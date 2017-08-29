//Get necessary variables from the main page
var Analysis = {}; 
Analysis.document = jQuery.extend({}, window.opener.document);
Analysis.graph = new joint.dia.Graph();
console.log(JSON.stringify(window.opener.App.analysisResult));
Analysis.paper;
Analysis.paperScroller;
Analysis.analysisResult = jQuery.extend({}, window.opener.App.analysisResult);
Analysis.elements = [];

Analysis.paper = new joint.dia.Paper({
	    width: 1200,
	    height: 600,
	    gridSize: 10,
	    perpendicularLinks: false,
	    model: Analysis.graph,
	    defaultLink: new joint.dia.Link({
			'attrs': {
				'.connection': {stroke: '#000000'},
				'.marker-source': {'d': '0'},
				'.marker-target': {stroke: '#000000', "d": 'M 10 0 L 0 5 L 10 10 L 0 5 L 10 10 L 0 5 L 10 5 L 0 5'}
				},
			'labels': [{position: 0.5, attrs: {text: {text: "and"}}}]
		})
	});

Analysis.paperScroller = new joint.ui.PaperScroller({
		autoResizePaper: true,
		paper: Analysis.paper
	});

	$('#paper').append(Analysis.paperScroller.render().el);
	Analysis.paperScroller.center();

	//Load graph by the cookie
	if (Analysis.document.cookie){
		
		var cookies = Analysis.document.cookie.split(";");
		var prevgraph = "";
		
		for (var i = 0; i < cookies.length; i++){
			if (cookies[i].indexOf("graph=") >= 0){
				prevgraph = cookies[i].substr(6);
			}
		}

		if (prevgraph != "" && prevgraph != "undefined"){
			Analysis.graph.fromJSON(JSON.parse(prevgraph));
		}	
	}
	
	//Filter out Actors
	for (var e = 0; e < Analysis.graph.getElements().length; e++){
		if (!(Analysis.graph.getElements()[e] instanceof joint.shapes.basic.Actor))
			Analysis.elements.push(Analysis.graph.getElements()[e]);
	}
	
window.onload = function(){
	Analysis.renderNavigationSidebar();	
}

Analysis.renderNavigationSidebar = function(currentPage = 0){
	Analysis.clear_pagination_values();
		
	var currentPageIn = document.getElementById("currentPage");
	var num_states_lbl = document.getElementById("num_states_lbl");
	
	num_states_lbl.innerHTML += Analysis.analysisResult.nodesList[0].satValues.length;
	
	currentPageIn.value = currentPage.toString();
	
	Analysis.updatePagination(currentPage);
	Analysis.updateNodesValues(currentPage);
}

Analysis.updateNodesValues = function(currentPage, step = 0){
	if(currentPage == "")
		currentPage = 0;
	
	var cell;
	var value;
	var elements = Analysis.graph.getElements();
	for (var a = 0; a < elements.length; a++){
		var cell = elements[a];
		if (!(cell instanceof joint.shapes.basic.Actor) && !(cell instanceof joint.shapes.basic.Actor2)){
			for(var i = 0; i < Analysis.analysisResult.nodesList.length; i++){
				if(cell.attributes.elementid == Analysis.analysisResult.nodesList[i].nodeId){
					if(Analysis.analysisResult.nodesList[i].satValues[currentPage] == 1){
						cell.attr({ '.satvalue': {'d': 'M 0 10 L 5 20 L 20 0 L 5 20 L 0 10', 'stroke': '#00FF00', 'stroke-width':4}});
						cell.attributes.attrs[".satvalue"].value = "satisfied";
					}else if(Analysis.analysisResult.nodesList[i].satValues[currentPage] == 2){
						cell.attr({ '.satvalue': {'d': 'M 0 8 L 5 18 L 20 0 L 5 18 L 0 8 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#00FF00', 'stroke-width':3, 'fill': 'transparent'}});
						cell.attributes.attrs[".satvalue"].value = "partiallysatisfied";
					}else if (Analysis.analysisResult.nodesList[i].satValues[currentPage] == 3) {
						cell.attr({ '.satvalue': {'d': 'M15.255,0c5.424,0,10.764,2.498,10.764,8.473c0,5.51-6.314,7.629-7.67,9.62c-1.018,1.481-0.678,3.562-3.475,3.562\
									c-1.822,0-2.712-1.482-2.712-2.838c0-5.046,7.414-6.188,7.414-10.343c0-2.287-1.522-3.643-4.066-3.643\
									c-5.424,0-3.306,5.592-7.414,5.592c-1.483,0-2.756-0.89-2.756-2.584C5.339,3.683,10.084,0,15.255,0z M15.044,24.406\
									c1.904,0,3.475,1.566,3.475,3.476c0,1.91-1.568,3.476-3.475,3.476c-1.907,0-3.476-1.564-3.476-3.476\
									C11.568,25.973,13.137,24.406,15.044,24.406z', 'stroke': '#222222', 'stroke-width': 1}});
						cell.attributes.attrs[".satvalue"].value = "unknown";
					}else if (Analysis.analysisResult.nodesList[i].satValues[currentPage] == 4) {
						cell.attr({ '.satvalue': {'d': 'M 0 0 L 20 8 M 20 7 L 5 15 M 5 14 L 25 23', 'stroke': '#222222', 'stroke-width': 4}});
						cell.attributes.attrs[".satvalue"].value = "conflict";
					}else if(Analysis.analysisResult.nodesList[i].satValues[currentPage] == 5){
						cell.attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 3, 'fill': 'transparent'}});
						cell.attributes.attrs[".satvalue"].value = "partiallydenied";
					}else if(Analysis.analysisResult.nodesList[i].satValues[currentPage] == 6){
						cell.attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 3, 'fill': 'transparent'}});
						cell.attributes.attrs[".satvalue"].value = "denied";
					}
				}
			}
		}
	}
}

Analysis.updatePagination = function(currentPage){
	var pagination = document.getElementById("pagination");
	var modelsSize = Analysis.analysisResult.nodesList[0].satValues.length;
	var nextSteps_array_size = modelsSize;
	if(nextSteps_array_size > 6){
		Analysis.renderPreviousBtn(pagination, currentPage);
		if(currentPage - 3 < 0){
			for(var i = 0; i < 6; i++){
				Analysis.render_pagination_values(currentPage, i);
			}
		}else{
			if(currentPage + 3 < nextSteps_array_size){
				for(i = currentPage - 3; i < currentPage + 3; i++){
					Analysis.render_pagination_values(currentPage, i);
				}				
			}else{
				for(i = currentPage - 3; i < nextSteps_array_size; i++){
					Analysis.render_pagination_values(currentPage, i);
				}
			}
		}
		Analysis.renderForwardBtn(pagination, currentPage)
	}else{
		Analysis.renderPreviousBtn(pagination, currentPage);
		for(var i = 0; i < nextSteps_array_size; i++){
			Analysis.render_pagination_values(currentPage, i);
		}
		Analysis.renderForwardBtn(pagination, currentPage)
	}
}

Analysis.renderPreviousBtn = function(pagination, currentPage){
	var value;
	if(currentPage == 0){
		value = 0;
	}else{
		value = currentPage - 1;
	}
	pagination.innerHTML += '<a href="#" onclick="Analysis.renderNavigationSidebar('+value.toString()+')">&laquo;</a>';
}

Analysis.renderForwardBtn = function(pagination, currentPage){
	var value;
	var nextSteps_array_size = Analysis.analysisResult.nodesList[0].satValues.length;

	if(currentPage == nextSteps_array_size-1){
		value = currentPage;
	}else{
		value = currentPage + 1;
	}
	pagination.innerHTML += '<a href="#" onclick="Analysis.renderNavigationSidebar(' + value.toString() + ')">&raquo;</a>';
}

Analysis.render_pagination_values = function(currentPage, i){
	var pagination = document.getElementById("pagination");
	if(currentPage == i){
		pagination.innerHTML += '<a href="#" class="active" onclick="Analysis.renderNavigationSidebar(' + i.toString() + ')">' + i.toString() + '</a>';					
	}else{
		pagination.innerHTML += '<a href="#" onclick="Analysis.renderNavigationSidebar(' + i.toString() + ')">' + i.toString() + '</a>';					
	}
}

Analysis.clear_pagination_values = function(){
	var pagination = document.getElementById("pagination");
	var num_states_lbl = document.getElementById("num_states_lbl");
	var currentPageIn = document.getElementById("currentPage");
	
	pagination.innerHTML = "";
	num_states_lbl.innerHTML = "";
	currentPageIn.value = "";
}

Analysis.goToState = function(){ 
	var requiredState = parseInt(document.getElementById("requiredState").value);
	var nextSteps_array_size = Analysis.analysisResult.nodesList[0].satValues.length;

	if((requiredState != "NaN") && (requiredState > 0)){
		if(requiredState > nextSteps_array_size){
			Analysis.renderNavigationSidebar(nextSteps_array_size);
		}else{
			Analysis.renderNavigationSidebar(requiredState);
		}
	}
}


