//creating the app private space
function App(){
	var self = this;
	
	//Set this attribute equals true for development purpose, set false for production deployment
	this.development = true;
	
	this.toolbar = new ToolbarView();
	this.elementInspector = new ElementInspector();
	this.linkInspector = new LinkInspector();
	this.analysisView = new AnalysisView();
	this.analysisView.parent = self;
	this.stencil;
	
	this.graph;
	this.paper;
	this.paperScroller;
	this.selection; 
	this.commandManager;
	this.selectionView;

	this.satvalues = {satisfied: 2, partiallysatisfied: 1, partiallydenied: -1, denied: -2, unknown: 0, conflict: 3, none: 4};

	this.init = function(){
		this.loadObjects();
		//Load views
		this.loadViews();	
		this.changeView("model");
		//If a cookie exists, process it as a previously created graph and load it.
		this.loadCookies();
		this.keyboardShortcuts();
		
		/**
		 * GRAPH ACTIONS
		 */
		var element_counter = 0;
		//Whenever an element is added to the graph
		this.graph.on("add", function(cell){
			if (cell instanceof joint.dia.Link){
				if (self.graph.getCell(cell.get("source").id) instanceof joint.shapes.basic.Actor){

					cell.attr({
						'.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
						'.marker-source': {'d': '0'},
						'.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
					});
					cell.prop("linktype", "actorlink");
					cell.label(0, {attrs: {text: {text: "is-a"}}});
				}
			}

			//Give element a unique default
			cell.attr(".name/text", cell.attr(".name/text") + "_" + element_counter);
			element_counter++;

			//Send actors to background so elements are placed on top
			if (cell instanceof joint.shapes.basic.Actor){
				cell.toBack();
			}

			self.paper.trigger("cell:pointerup", cell.findView(self.paper));
		});

		//Auto-save the cookie whenever the graph is changed.
		this.graph.on("change", function(){
			//save the graph on a cook when it has changes
			var graphtext = JSON.stringify(self.graph);
			document.cookie = "graph=" + graphtext;
		});

		this.graph.on('change:size', function(cell, size){
			cell.attr(".label/cx", 0.25 * size.width);

			//Calculate point on actor boundary for label (to always remain on boundary)
			var b = size.height;
			var c = -(size.height/2 + (size.height/2) * (size.height/2) * (1 - (-0.75 * size.width/2) * (-0.75 * size.width/2)  / ((size.width/2) * (size.width/2)) ));
			var y_cord = (-b + Math.sqrt(b*b - 4*c)) / 2;

			cell.attr(".label/cy", y_cord);
		});

		/**
		 * PAPER ACTIONS
		 */
		// Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
		// Otherwise, initiate paper pan.
		this.paper.on('blank:pointerdown', function(evt, x, y) {
		    if (_.contains(KeyboardJS.activeKeys(), 'shift')) {
		        self.selectionView.startSelecting(evt, x, y);
		    } else {
		    	self.paperScroller.startPanning(evt, x, y);
		    }
		});

		this.paper.on('cell:pointerdown', function(cellView, evt, x, y){
			var cell = cellView.model;
			if (cell instanceof joint.dia.Link){
				cell.reparent();
			}

			//Unembed cell so you can move it out of actor
			if (cell.get('parent') && !(cell instanceof joint.dia.Link)) {
				self.graph.getCell(cell.get('parent')).unembed(cell);
			}
		});

		// Unhighlight everything when blank is being clicked
		this.paper.on('blank:pointerclick', function(){
			var elements = self.graph.getElements();
			for (var i = 0; i < elements.length; i++){
				var cellView  = elements[i].findView(self.paper);
				var cell = cellView.model;
				cellView.unhighlight();
				cell.attr('.outer/stroke', 'black');
				cell.attr('.outer/stroke-width', '1');
				if (cell instanceof joint.shapes.basic.Actor){
					cell.attr('.outer/stroke-dasharray', '5 2');
				}

			}
			self.linkInspector.clear();
			self.elementInspector.clear();
		});

		// Disable context menu inside the paper.
		this.paper.el.oncontextmenu = function(evt) { evt.preventDefault(); };

		//Link equivalent of the element editor
		this.paper.on("link:options", function(evt, cell){
			var link = cell.model;
			setLinkType(link);
			var linktype = link.attr(".link-type");
			self.linkInspector.clear();
			self.elementInspector.clear();
			self.linkInspector.render(cell, linktype);
		});
		

		//Single click on cell
		this.paper.on('cell:pointerup', function(cellView, evt) {
			// Link
			if (cellView.model instanceof joint.dia.Link){
				var link = cellView.model;
				var sourceCell = link.getSourceElement().attributes.type;
				setLinkType(link);
				var linktype = link.attr(".link-type");
				drawDefaultLink(link, linktype);

				// Check if link is valid or not
				if (link.getTargetElement()){
					var targetCell = link.getTargetElement().attributes.type;

				}
				return
			// element is selected
			}else{
				var currentHalo;
				
				self.selection.reset();
				self.selection.add(cellView.model);
				var cell = cellView.model;
				// Unhighlight everything
				var elements = self.graph.getElements();
				for (var i = 0; i < elements.length; i++){
					var cellview  = elements[i].findView(self.paper);
					cellview.unhighlight();
					cellview.model.attr('.outer/stroke', 'black');
					cellview.model.attr('.outer/stroke-width', '1');
					if (cellview.model instanceof joint.shapes.basic.Actor){
						cellview.model.attr('.outer/stroke-dasharray', '5 2');
					}
				}
				// Highlight when cell is clicked
				cellView.highlight();
				searchRoot(cell, null);
				searchLeaf(cell, null);

				currentHalo = new joint.ui.Halo({
					graph: self.graph,
					paper: self.paper,
					cellView: cellView,
					type: 'toolbar'
				});

				currentHalo.removeHandle('unlink');
				currentHalo.removeHandle('clone');
				currentHalo.removeHandle('fork');
				currentHalo.removeHandle('rotate');
				currentHalo.render();

				//Embed an element into an actor boundary, if necessary
				if (!(cellView.model instanceof joint.shapes.basic.Actor) && !(cellView.model instanceof joint.shapes.basic.Actor2)){
					var ActorsBelow = self.paper.findViewsFromPoint(cell.getBBox().center());

					if (ActorsBelow.length){
						for (var a = 0; a < ActorsBelow.length; a++){
							if (ActorsBelow[a].model instanceof joint.shapes.basic.Actor){

								ActorsBelow[a].model.embed(cell);
							}
						}
					}
				}

				self.linkInspector.clear();
				self.elementInspector.render(cellView);
				self.changeView("model");
			}
		});
		

		// Identify link-type: Refinement, Contribution, Qualification or NeededBy
		// And store the linktype into the link
		function setLinkType(link){
			if (!link.getTargetElement() || !link.getSourceElement()){
				link.attr(".link-type", "Error");
				return;
			}
			var sourceCell = link.getSourceElement().attributes.type;
			var targetCell = link.getTargetElement().attributes.type;
			var sourceCellInActor = link.getSourceElement().get('parent');
			var targetCellInActor = link.getTargetElement().get('parent');

			switch(true){
				// Links of actors must be paired with other actors
				case ((sourceCell == "basic.Actor" || sourceCell == "basic.Actor2") && (targetCell == "basic.Actor" || targetCell == "basic.Actor2")):
					link.attr(".link-type", "Actor");
					break;
				case ((sourceCell == "basic.Actor") && (!targetCellInActor)):
					link.attr(".link-type", "Error");
					break;
				case ((targetCell == "basic.Actor") && (!sourceCellInActor)):
					link.attr(".link-type", "Error");
					break;

				case ((sourceCell == "basic.Actor2") && (!targetCellInActor)):
					link.attr(".link-type", "Dependency");
					break;
				case ((targetCell == "basic.Actor2") && (!sourceCellInActor)):
					link.attr(".link-type", "Dependency");
					break;

				case ((!!sourceCellInActor) && (!targetCellInActor && (targetCell == "basic.Actor" || targetCell == "basic.Actor2"))):
					link.attr(".link-type", "Error");
					break;
				case ((!!targetCellInActor) && (!sourceCellInActor && (sourceCell == "basic.Actor" || sourceCell == "basic.Actor2"))):
					link.attr(".link-type", "Error");
					break;
				case ((!!sourceCellInActor) && (!targetCellInActor)):
					link.attr(".link-type", "Dependency");
					break;
				case ((!!targetCellInActor) && (!sourceCellInActor)):
					link.attr(".link-type", "Dependency");
					break;

				case ((sourceCell == "basic.Goal") && (targetCell == "basic.Goal")):
					link.attr(".link-type", "Refinement");
					break;
				case ((sourceCell == "basic.Goal") && (targetCell == "basic.Softgoal")):
					link.attr(".link-type", "Contribution");
					break;
				case ((sourceCell == "basic.Goal") && (targetCell == "basic.Task")):
					link.attr(".link-type", "Refinement");
					break;
				case ((sourceCell == "basic.Goal") && (targetCell == "basic.Resource")):
					link.attr(".link-type", "Error");
					break;
				case ((sourceCell == "basic.Softgoal") && (targetCell == "basic.Goal")):
					link.attr(".link-type", "Qualification");
					break;
				case ((sourceCell == "basic.Softgoal") && (targetCell == "basic.Softgoal")):
					link.attr(".link-type", "Contribution");
					break;
				case ((sourceCell == "basic.Softgoal") && (targetCell == "basic.Task")):
					link.attr(".link-type", "Qualification");
					break;
				case ((sourceCell == "basic.Softgoal") && (targetCell == "basic.Resource")):
					link.attr(".link-type", "Qualification");
					break;
				case ((sourceCell == "basic.Task") && (targetCell == "basic.Goal")):
					link.attr(".link-type", "Refinement");
					break;
				case ((sourceCell == "basic.Task") && (targetCell == "basic.Softgoal")):
					link.attr(".link-type", "Contribution");
					break;
				case ((sourceCell == "basic.Task") && (targetCell == "basic.Task")):
					link.attr(".link-type", "Refinement");
					break;
				case ((sourceCell == "basic.Task") && (targetCell == "basic.Resource")):
					link.attr(".link-type", "Error");
					break;
				case ((sourceCell == "basic.Resource") && (targetCell == "basic.Goal")):
					link.attr(".link-type", "Error");
					break;
				case ((sourceCell == "basic.Resource") && (targetCell == "basic.Softgoal")):
					link.attr(".link-type", "Contribution");
					break;
				case ((sourceCell == "basic.Resource") && (targetCell == "basic.Task")):
					link.attr(".link-type", "NeededBy");
					break;
				case ((sourceCell == "basic.Resource") && (targetCell == "basic.Resource")):
					link.attr(".link-type", "Error");
					break;

				default:
					console.log('Default');
			}
			return;
		}
		// Need to draw a link upon user creating link between 2 nodes
		// Given a link and linktype, draw the deafult link
		function drawDefaultLink(link, linktype){
			switch(linktype){
				case "Refinement":
					link.attr({
					  '.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
					  '.marker-source': {'d': 'M 0 0'},
					  '.marker-target': {stroke: '#000000', 'stroke-width': 1, "d": 'M 10 0 L 10 10 M 10 5 L 0 5' }
					});
					link.label(0 ,{position: 0.5, attrs: {text: {text: 'and'}}});
					break;
				case "Qualification":
					link.attr({
					  '.connection': {stroke: '#000000', 'stroke-dasharray': '5 2'},
					  '.marker-source': {'d': 'M 0 0'},
					  '.marker-target': {'d': 'M 0 0'}
					});
					link.label(0 ,{position: 0.5, attrs: {text: {text: "qualification"}}});
					break;
				case "Contribution":
					link.attr({
					  '.marker-target': {'d': 'M 12 -3 L 5 5 L 12 13 M 5 5 L 30 5', 'fill': 'transparent'}
					})
					link.label(0 ,{position: 0.5, attrs: {text: {text: "makes"}}});
					break;
				case "NeededBy":
					link.attr({
					  '.marker-target': {'d': 'M-4,0a4,4 0 1,0 8,0a4,4 0 1,0 -8,0'}
					})
					link.label(0 ,{position: 0.5, attrs: {text: {text: "neededby"}}});
					break;
				case "Dependency":
					link.attr({
						'.marker-source': {'d': 'M 0 0'},
						'.marker-target': {'d': 'M 100 0 C 85 -5, 85 20, 100 15 L 100 0 M -100 0' ,'fill': 'transparent'},
					})
					link.label(0 ,{position: 0.5, attrs: {text: {text: ""}}});
					break;
				case "Actor":
					link.label(0 ,{position: 0.5, attrs: {text: {text: 'is-a'}}});
					break;
				case "Error":
					link.label(0 ,{position: 0.5, attrs: {text: {text: "Error"}}});
					break;
				default:
					break;
			}
		}

		//When a cell is clicked, create the Halo
		function isLinkInvalid(link){
			return (!link.prop('source/id') || !link.prop('target/id'));
		}
		
		
		// ===================Search for root and leaf =====================


		// Given a cell, search and highlight its root
		// It ultilizes recursion
		// When first time calling it, originalCell is null
		// After that it is set to the cell that is being clicked on
		// This is to prevent searching in an cyclic graph
		function searchRoot(cell, originalCell){
			// If cellView = originalCell, we have a cycle
			if (cell == originalCell){
				return
			}
			// If first time calling it, set originalCell to cell
			if (originalCell == null){
				originalCell = cell;
			}

			// Highlight it when it is a root
			if (isRoot(cell)){
				cell.attr('.outer/stroke', '#996633');
				cell.attr('.outer/stroke-width', '5');
				cell.attr('.outer/stroke-dasharray', '');

				return;
			}
			// A list of nodes to find next
			var queue = enQueue1(cell);
			// If no more node to search for, we are done
			if (queue.length == 0){
				return;
			}
			// Call searchRoot for all nodes in queue
			for (var i = queue.length - 1; i >= 0; i--) {
				searchRoot(queue[i], originalCell);
			}

			return;
		}
		// Definition of root: 
		// No outgoing refinement, contribution, neededby link
		// No incoming dependency , Actor link
		// No error link at all
		function isRoot(cell){
			var outboundLinks = self.graph.getConnectedLinks(cell, {outbound: true});
			var inboundLinks = self.graph.getConnectedLinks(cell, {inbound: true});
			var inboundQualificationCount = 0;
			var outboundQualificationCount = 0;
			
			for (var i = inboundLinks.length - 1; i >= 0; i--) {
				var linkType = inboundLinks[i].attr('.link-type')
				if (linkType == 'Error' || linkType == 'Dependency' || linkType == 'Actor' ){
					return false;
				}
				if (linkType == 'Qualification'){
					inboundQualificationCount = inboundQualificationCount + 1;
				}
			}

			for (var i = outboundLinks.length - 1; i >= 0; i--) {
				var linkType = outboundLinks[i].attr('.link-type')
				if (linkType == 'Error' || (linkType != 'Dependency' && linkType != 'Actor' && linkType != 'Qualification')){
					return false;
				}

				if (linkType == 'Qualification'){
					outboundQualificationCount = outboundQualificationCount + 1;
				}
			}

			// If no outbound and inbound link, do not highlight anything
			// If all outbound links are qualification, and all inbound links are qualification, do not highlight anything
			if (outboundLinks.length == outboundQualificationCount && inboundLinks.length == inboundQualificationCount){
				return false;
			}

			return true;
		}
		// This is for searchRoot function
		// Given a cell, find a list of all "parent" cells for searchRoot to search next
		// We define a parent P as:
		// A dependency/actor link going from P to current node
		// Or
		// A refinement, contribution, neededby link from current node to P
		function enQueue1(cell){
			var queue = [];
			var outboundLinks = self.graph.getConnectedLinks(cell, {outbound: true});
			var inboundLinks = self.graph.getConnectedLinks(cell, {inbound: true});
			for (var i = inboundLinks.length - 1; i >= 0; i--) {
				var linkType = inboundLinks[i].attr('.link-type')
				if (linkType == 'Dependency' || linkType == 'Actor'){
					var sourceCell = inboundLinks[i].getSourceElement();
					queue.push(sourceCell);
				}
			}
			
			for (var i = outboundLinks.length - 1; i >= 0; i--) {
				var linkType = outboundLinks[i].attr('.link-type')
				if (linkType != 'Error' && linkType != 'Dependency' && linkType != 'Actor' && linkType != 'Qualification'){
					var targetCell = outboundLinks[i].getTargetElement();
					queue.push(targetCell);
				}
			}
			return queue;

		}


		// Given a cell, search and highlight its leaf
		// This is a modified BFS alg ultilizing recursion
		// When first time calling it, originalCell is null
		// After that it is set to the cell that is being clicked on
		// This is to prevent searching in an cyclic graph
		function searchLeaf(cell, originalCell){
			// If cellView = originalCell, we have a cycle
			if (cell == originalCell){
				return
			}
			// If first time calling it, set originalCell to cell
			if (originalCell == null){
				originalCell = cell;
			}

			// Highlight it when it is a leaf
			if (isLeaf(cell)){
				cell.attr('.outer/stroke', '#339933');
				cell.attr('.outer/stroke-width', '5');
				cell.attr('.outer/stroke-dasharray', '');

				return;
			}
			// A list of nodes to find next
			var queue = enQueue2(cell);
			// If no more node to search for, we are done
			if (queue.length == 0){
				return;
			}
			// Call searchLeaf for all nodes in queue
			for (var i = queue.length - 1; i >= 0; i--) {
				searchLeaf(queue[i], originalCell);
			}

			return;
		}
		// Definition of leaf: 
		// No incoming refinement, contribution, neededby link
		// No outgoing dependency , Actor link
		// No error link at all
		function isLeaf(cell){
			var outboundLinks = self.graph.getConnectedLinks(cell, {outbound: true});
			var inboundLinks = self.graph.getConnectedLinks(cell, {inbound: true});
			var inboundQualificationCount = 0;
			var outboundQualificationCount = 0;


			for (var i = outboundLinks.length - 1; i >= 0; i--) {
				var linkType = outboundLinks[i].attr('.link-type')
				if (linkType == 'Error' || linkType == 'Dependency' || linkType == 'Actor' ){
					return false;
				}
				if (linkType == 'Qualification'){
					outboundQualificationCount = outboundQualificationCount + 1;
				}
			}

			for (var i = inboundLinks.length - 1; i >= 0; i--) {
				var linkType = inboundLinks[i].attr('.link-type')
				if (linkType == 'Error' || (linkType != 'Dependency' && linkType != 'Actor' && linkType != 'Qualification')){
					return false;
				}
				if (linkType == 'Qualification'){
					inboundQualificationCount = inboundQualificationCount + 1;
				}
			}

			// If no outbound and inbound link, do not highlight anything
			// If all outbound links are qualification, and all inbound links are qualification, do not highlight anything
			if (outboundLinks.length == outboundQualificationCount && inboundLinks.length == inboundQualificationCount){
				return false;
			}

			return true;
		}
		// This is for searchLeaf function
		// Given a cell, find a list of all "parent" cells for searchLeaf to search next
		// We define a children C as:
		// A dependency/actor link going from current node to C
		// Or
		// A refinement, contribution, qualification, neededby link from C to current node
		function enQueue2(cell){
			var queue = [];
			var outboundLinks = self.graph.getConnectedLinks(cell, {outbound: true});
			var inboundLinks = self.graph.getConnectedLinks(cell, {inbound: true});
			for (var i = outboundLinks.length - 1; i >= 0; i--) {
				var linkType = outboundLinks[i].attr('.link-type')
				if (linkType == 'Dependency' || linkType == 'Actor'){
					var targetCell = outboundLinks[i].getTargetElement();
					queue.push(targetCell);
				}
			}
			
			for (var i = inboundLinks.length - 1; i >= 0; i--) {
				var linkType = inboundLinks[i].attr('.link-type')
				if (linkType != 'Error' && linkType != 'Dependency' && linkType != 'Actor' && linkType != 'Qualification'){
					var sourceCell = inboundLinks[i].getSourceElement();
					queue.push(sourceCell);
				}
			}
			return queue;

		}
	}
			
	this.loadObjects = function(){
		this.graph = new joint.dia.Graph();		

		this.paper = new joint.dia.Paper({
		    width: 1000,
		    height: 1000,
		    gridSize: 10,
		    perpendicularLinks: false,
		    model: this.graph,
		    defaultLink: new joint.dia.Link({
				'attrs': {
					'.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
					'.marker-source': {'d': 'M 0 0'},
					'.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 z'}
					},
				'labels': [{position: 0.5, attrs: {text: {text: "this is default link. You shouldnt be able to see it"}}}]
			})
		});
		this.paperScroller = new joint.ui.PaperScroller({
			autoResizePaper: true,
			paper: this.paper
		});

		$('#paper').append(this.paperScroller.render().el);
		this.paperScroller.center();

		this.commandManager = new joint.dia.CommandManager({ graph: self.graph });

		this.selection = new Backbone.Collection();
		
		this.selectionView = new joint.ui.SelectionView({
			paper: self.paper,
			graph: self.graph,
			model: self.selection
		});

	}
	
	this.loadViews = function(){
		//Views
		//Main menu toolbar
		this.toolbar.parent = self;
		$('.toolbar').append(this.toolbar.el);
		this.toolbar.render();

		//Element pannel options (right-panel)
		$('.inspector').append(this.elementInspector.el);

		//Link pannel options (right-panel)
		$('.inspector').append(this.linkInspector.el);

		$('.inspector').append(this.analysisView.el);
		
		//Graph elements (left-panel)
		this.stencil = new joint.ui.Stencil({
				graph: this.graph,
				paper: this.paper,
				width: 200,
				height: 600
			});
		
		$('#stencil').append(this.stencil.render().el);
		
		var goal = new joint.shapes.basic.Goal({ position: {x: 50, y: 20} });
		var task = new joint.shapes.basic.Task({ position: {x: 50, y: 100} });
		var quality = new joint.shapes.basic.Softgoal({ position: {x: 50, y: 170} });
		var res = new joint.shapes.basic.Resource({ position: {x: 50, y: 250} });
		// This is actor without boundary
		var act2 = new joint.shapes.basic.Actor2({ position: {x: 60, y: 330} });
		var act = new joint.shapes.basic.Actor({ position: {x: 40, y: 430} });

		this.stencil.load([goal, task, quality, res, act2, act]);	
		
	}
	
	this.changeView = function(mode){
		//Verifying which view has to be shown
		if(mode == "model"){
			$("#stencil").show();
			$("#btn-analysis").show();
			$("#btn-model").hide();
			this.analysisView.clear();
			
		}else if(mode == "analysis"){
			$("#stencil").hide();
			$("#btn-model").show();
			$("#btn-analysis").hide();
			this.elementInspector.clear();
			this.linkInspector.clear();
			this.analysisView.graph = self.graph;
			this.analysisView.render();
		}
	}

	this.loadCookies = function(){
		if (document.cookie){
			var cookies = document.cookie.split(";");
			var prevgraph = "";

			for (var i = 0; i < cookies.length; i++){
				if (cookies[i].indexOf("graph=") >= 0){
					prevgraph = cookies[i].substr(6);
				}
			}

			if (prevgraph != "" && prevgraph != "undefined"){
				this.graph.fromJSON(JSON.parse(prevgraph));
			}	
		}
	}
	
	this.keyboardShortcuts = function(){
		// ----------------------------------------------------------------- //
		// Keyboard shortcuts
		var clipboard = new joint.ui.Clipboard();
		KeyboardJS.on('ctrl + c', function() {
			// Copy all selected elements and their associatedf links.
			clipboard.copyElements(self.selection, self.graph, { translate: { dx: 20, dy: 20 }, useLocalStorage: true });
		});
		KeyboardJS.on('ctrl + v', function() {
			clipboard.pasteCells(self.graph);

			self.selectionView.cancelSelection();

			clipboard.pasteCells(self.graph, { link: { z: -1 }, useLocalStorage: true });

			// Make sure pasted elements get selected immediately. This makes the UX better as
			// the user can immediately manipulate the pasted elements.
			clipboard.each(function(cell) {
				if (cell.get('type') === 'link') return;

				// Push to the selection not to the model from the clipboard but put the model into the graph.
				// Note that they are different models. There is no views associated with the models
				// in clipboard.
				self.selection.add(self.graph.get('cells').get(cell.id));
			});

			self.selection.each(function(cell) {
			self.selectionView.createSelectionBox(self.paper.findViewByModel(cell));
			});
		});
	}
	
	//BACKEND COMMUNICATION
	this.backendComm = function(js_object){
		//Show in console just to see what is going to backend

		//backend script called
		var pathToCGI = "./cgi-bin/backendCom.cgi";

		if(this.development){
			analysisResults = {"result" : [{"id" : "0000", "satvalue" : "2"},{"id" : "0002", "satvalue" : "6"},{"id" : "0001", "satvalue" : "2"}]};
			this.loadAnalysis(analysisResults);
			
		}else{
		 	$.ajax({
				url: pathToCGI,
				type: "post",
				contentType: "json",
				data:JSON.stringify(js_object),
				success: function(response){
					self.executeJava();
				}
			})	.fail(function(){
				msg = "Ops! Something went wrong.";
				alert(msg);
			});
			
		}
	}

	this.executeJava = function(){
		var pathToCGI = "./cgi-bin/executeJava.cgi";
		$.ajax({
			url: pathToCGI,
			type: "get",
			success: function(response){
				this.getFileResults();
			}
		})
		.fail(function(){
			msg = "Ops! Something went wrong. Executing java.";
			alert(msg);
		});
	}

	this.getFileResults = function(){
		//backend script called
		var pathToCGI = "./cgi-bin/fileRead.cgi";

		//Executing action to send backend
		$.ajax({
			url: pathToCGI,
			type: "get",
			success: function(response){
				analysisResults = JSON.parse(response);
				if (analysisResults == ""){
					alert("Ops! We couldn't read output.out file.")
					return
				}
				console.log(JSON.stringify(response));
				self.loadAnalysis(analysisResults);
			}
		})
		.fail(function(){
			msg = "Ops! Something went wrong getting file.";
			alert(msg);
		});
	}

	this.loadAnalysis = function(analysisResult){
		var elements = self.graph.getElements();
		for (var a = 0; a < elements.length; a++){
			var cell = elements[a];
			if (!(cell instanceof joint.shapes.basic.Actor) && !(cell instanceof joint.shapes.basic.Actor2)){
				for(var i = 0; i < analysisResult.result.length; i++){
					if(cell.attributes.elementid == analysisResult.result[i].id){
						if(analysisResult.result[i].satvalue == 1){
							cell.attr({ '.satvalue': {'d': 'M 0 10 L 5 20 L 20 0 L 5 20 L 0 10', 'stroke': '#00FF00', 'stroke-width':4}});
							cell.attributes.attrs[".satvalue"].value = "satisfied";
						}else if(analysisResult.result[i].satvalue == 2){
							cell.attr({ '.satvalue': {'d': 'M 0 8 L 5 18 L 20 0 L 5 18 L 0 8 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#00FF00', 'stroke-width':3, 'fill': 'transparent'}});
							cell.attributes.attrs[".satvalue"].value = "partiallysatisfied";
						}else if(analysisResult.result[i].satvalue == 3){
							cell.attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 3, 'fill': 'transparent'}});
							cell.attributes.attrs[".satvalue"].value = "partiallydenied";
						}else if(analysisResult.result[i].satvalue == 4){
							cell.attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 3, 'fill': 'transparent'}});
							cell.attributes.attrs[".satvalue"].value = "denied";
						}
					}
				}
			}
		}	
	}
	
//		//Update images for properties
//		if (value == "satisfied"){
//		  // cell.attr({ '.satvalue': {'d': 'M 0 10 L 5 20 L 20 0 L 5 20 L 0 10', 'stroke': '#00FF00', 'stroke-width':4}});
//		  cell.attr(".satvalue/text", "(FS, T)");
//		}else if(value == "partiallysatisfied") {
//		  // cell.attr({ '.satvalue': {'d': 'M 0 8 L 5 18 L 20 0 L 5 18 L 0 8 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#00FF00', 'stroke-width':3, 'fill': 'transparent'}});
//		  cell.attr(".satvalue/text", "(PS, T)");
//		}else if (value == "denied"){
//		  // cell.attr({ '.satvalue': {'d': 'M 0 20 L 20 0 M 10 10 L 0 0 L 20 20', 'stroke': '#FF0000', 'stroke-width': 4}});
//		  cell.attr(".satvalue/text", "(T, FD)");
//		}else if (value == "partiallydenied") {
//		  // cell.attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 3, 'fill': 'transparent'}});
//		  cell.attr(".satvalue/text", "(T, PD)");
//		}else if (value == "unknown") {
//		  // cell.attr({ '.satvalue': {'d': 'M15.255,0c5.424,0,10.764,2.498,10.764,8.473c0,5.51-6.314,7.629-7.67,9.62c-1.018,1.481-0.678,3.562-3.475,3.562\
//		      // c-1.822,0-2.712-1.482-2.712-2.838c0-5.046,7.414-6.188,7.414-10.343c0-2.287-1.522-3.643-4.066-3.643\
//		      // c-5.424,0-3.306,5.592-7.414,5.592c-1.483,0-2.756-0.89-2.756-2.584C5.339,3.683,10.084,0,15.255,0z M15.044,24.406\
//		      // c1.904,0,3.475,1.566,3.475,3.476c0,1.91-1.568,3.476-3.475,3.476c-1.907,0-3.476-1.564-3.476-3.476\
//		      // C11.568,25.973,13.137,24.406,15.044,24.406z', 'stroke': '#222222', 'stroke-width': 1}});
//		      cell.attr(".satvalue/text", "?");
//		}else {
//		  cell.removeAttr(".satvalue/d");
//		}
	
};
