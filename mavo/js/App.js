//Set this attribute equals true for development purpose, set false for production deployment
App.develop = true;

//Shared variables
App.graph;
App.paper;
App.paperScroller;
App.selection; 
App.commandManager;
App.selectionView;	

App.satvalues = {
		"satisfied": "2", 
		"partiallysatisfied": "1", 
		"partiallydenied": "-1", 
		"denied": "-2", 
		"unknown": "0", 
		"conflict": "3",
		"none": "4"
			};

App.loadModels = function(){
	
	App.graph = new joint.dia.Graph();		

	App.paper = new joint.dia.Paper({
	    width: 1000,
	    height: 1000,
	    gridSize: 10,
	    perpendicularLinks: false,
	    model: App.graph,
	    defaultLink: new joint.dia.Link({
			'attrs': {
				'.connection': {stroke: '#000000', 'stroke-dasharray': '0 0'},
				'.marker-source': {'d': 'M 0 0'},
				'.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 z'}
				},
			'labels': [{position: 0.5, attrs: {text: {text: "this is default link. You shouldnt be able to see it"}}}]
		})
	});
	App.paperScroller = new joint.ui.PaperScroller({
		autoResizePaper: true,
		paper: App.paper
	});

	$('#paper').append(this.paperScroller.render().el);
	App.paperScroller.center();

	App.commandManager = new joint.dia.CommandManager({ graph: App.graph });

	App.selection = new Backbone.Collection();
	
	App.selectionView = new joint.ui.SelectionView({
		paper: App.paper,
		graph: App.graph,
		model: App.selection
	});

	
	/**
	 * GRAPH ACTIONS
	 */
	App.elementCounter = 0;
	//Whenever an element is added to the graph
	App.graph.on("add", function(cell){
		if (cell instanceof joint.dia.Link){
			if (App.graph.getCell(cell.get("source").id) instanceof joint.shapes.basic.Actor){

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
		cell.attr(".name/text", cell.attr(".name/text") + "_" + App.elementCounter);
		App.elementCounter++;

		//Send actors to background so elements are placed on top
		if (cell instanceof joint.shapes.basic.Actor){
			cell.toBack();
		}

		App.paper.trigger("cell:pointerup", cell.findView(App.paper));
	});

	//Auto-save the cookie whenever the graph is changed.
	App.graph.on("change", function(){
		//save the graph on a cook when it has changes
		var graphtext = JSON.stringify(App.graph);
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
	
	// Initiate selecting when the user grabs the blank area of the paper while the Shift key is pressed.
	// Otherwise, initiate paper pan.
	App.paper.on('blank:pointerdown', function(evt, x, y) {
	    if (_.contains(KeyboardJS.activeKeys(), 'shift')) {
	        App.selectionView.startSelecting(evt, x, y);
	    } else {
	    	App.paperScroller.startPanning(evt, x, y);
	    }
	});

	App.paper.on('cell:pointerdown', function(cellView, evt, x, y){
		var cell = cellView.model;
		if (cell instanceof joint.dia.Link){
			cell.reparent();
		}

		//Unembed cell so you can move it out of actor
		if (cell.get('parent') && !(cell instanceof joint.dia.Link)) {
			App.graph.getCell(cell.get('parent')).unembed(cell);
		}
	});

	// Unhighlight everything when blank is being clicked
	App.paper.on('blank:pointerclick', function(){
		var elements = App.graph.getElements();
		for (var i = 0; i < elements.length; i++){
			var cellView  = elements[i].findView(App.paper);
			var cell = cellView.model;
			cellView.unhighlight();
			cell.attr('.outer/stroke', 'black');
			cell.attr('.outer/stroke-width', '1');
			if (cell instanceof joint.shapes.basic.Actor){
				cell.attr('.outer/stroke-dasharray', '5 2');
			}

		}
		App.linkInspector.clear();
		App.elementInspector.clear();
	});

	// Disable context menu inside the paper.
	App.paper.el.oncontextmenu = function(evt) { evt.preventDefault(); };

	//Link equivalent of the element editor
	App.paper.on("link:options", function(evt, cell){
		var link = cell.model;
		setLinkType(link);
		var linktype = link.attr(".link-type");
		App.linkInspector.clear();
		App.elementInspector.clear();
		App.linkInspector.render(cell, linktype);
	});
	

	//Single click on cell
	App.paper.on('cell:pointerup', function(cellView, evt) {
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
			
			App.selection.reset();
			App.selection.add(cellView.model);
			var cell = cellView.model;
			// Unhighlight everything
			var elements = App.graph.getElements();
			for (var i = 0; i < elements.length; i++){
				var cellview  = elements[i].findView(App.paper);
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
				graph: App.graph,
				paper: App.paper,
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
				var ActorsBelow = App.paper.findViewsFromPoint(cell.getBBox().center());

				if (ActorsBelow.length){
					for (var a = 0; a < ActorsBelow.length; a++){
						if (ActorsBelow[a].model instanceof joint.shapes.basic.Actor){

							ActorsBelow[a].model.embed(cell);
						}
					}
				}
			}

			App.linkInspector.clear();
			App.elementInspector.render(cellView);
			App.changeView("model");
		}
	});
}

App.loadViews = function(){
	App.toolbar = new ToolbarView();
	App.elementInspector = new ElementInspector();
	App.linkInspector = new LinkInspector();
	App.analysisView = new AnalysisView();
	App.stencil;
	
	//Views
	//Main menu toolbar
	$('.toolbar').append(App.toolbar.el);
	App.toolbar.render();

	//Element pannel options (right-panel)
	$('.inspector').append(App.elementInspector.el);

	//Link pannel options (right-panel)
	$('.inspector').append(App.linkInspector.el);

	$('.inspector').append(App.analysisView.el);
	
	//Graph elements (left-panel)
	App.stencil = new joint.ui.Stencil({
			graph: App.graph,
			paper: App.paper,
			width: 200,
			height: 600
		});
	
	$('#stencil').append(App.stencil.render().el);
	
	var goal = new joint.shapes.basic.Goal({ position: {x: 50, y: 20} });
	var task = new joint.shapes.basic.Task({ position: {x: 50, y: 100} });
	var quality = new joint.shapes.basic.Softgoal({ position: {x: 50, y: 170} });
	var res = new joint.shapes.basic.Resource({ position: {x: 50, y: 250} });
	var act2 = new joint.shapes.basic.Actor2({ position: {x: 60, y: 330} });
	var act = new joint.shapes.basic.Actor({ position: {x: 40, y: 430} });

	this.stencil.load([goal, task, quality, res, act2, act]);	

}

App.changeView = function(mode){
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
		App.elementInspector.clear();
		App.linkInspector.clear();
		App.analysisView.graph = App.graph;
		App.analysisView.render();
	}
}

App.loadCookies = function(){
	if (document.cookie){
		var cookies = document.cookie.split(";");
		var prevgraph = "";

		for (var i = 0; i < cookies.length; i++){
			if (cookies[i].indexOf("graph=") >= 0){
				prevgraph = cookies[i].substr(6);
			}
		}

		if (prevgraph != "" && prevgraph != "undefined"){
			App.graph.fromJSON(JSON.parse(prevgraph));
		}	
	}
}

App.keyboardShortcuts = function(){
	// ----------------------------------------------------------------- //
	// Keyboard shortcuts
	var clipboard = new joint.ui.Clipboard();
	KeyboardJS.on('ctrl + c', function() {
		// Copy all selected elements and their associatedf links.
		clipboard.copyElements(App.selection, App.graph, { translate: { dx: 20, dy: 20 }, useLocalStorage: true });
	});
	KeyboardJS.on('ctrl + v', function() {
		clipboard.pasteCells(App.graph);

		App.selectionView.cancelSelection();

		clipboard.pasteCells(App.graph, { link: { z: -1 }, useLocalStorage: true });

		// Make sure pasted elements get selected immediately. This makes the UX better as
		// the user can immediately manipulate the pasted elements.
		clipboard.each(function(cell) {
			if (cell.get('type') === 'link') return;

			// Push to the selection not to the model from the clipboard but put the model into the graph.
			// Note that they are different models. There is no views associated with the models
			// in clipboard.
			App.selection.add(App.graph.get('cells').get(cell.id));
		});

		App.selection.each(function(cell) {
		App.AppctionView.createSelectionBox(App.paper.findViewByModel(cell));
		});
	});
}

App.init = function(){
	App.loadModels();
	App.loadViews();	
	App.changeView("model");
	//If a cookie exists, process it as a previously created graph and load it.
	App.loadCookies();
	App.keyboardShortcuts();
}

