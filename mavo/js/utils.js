//Helper function to download saved graph in JSON format
App.download = function(filename, text) {
	var dl = document.createElement('a');
	dl.setAttribute('href', 'data:application/force-download;charset=utf-8,' + encodeURIComponent(text));
	dl.setAttribute('download', filename);

	dl.style.display = 'none';
	document.body.appendChild(dl);

	dl.click();
	document.body.removeChild(dl);
}

//BACKEND COMMUNICATION
App.backendComm = function(js_object){
	
	if(App.develop){
		var analysisResult = {
				  "nodesList": [
					    {
					      "nodeId": "0000",
					      "satValues": [
					        "1"
					      ]
					    },
					    {
					      "nodeId": "0001",
					      "satValues": [
					        "1"
					      ]
					    },
					    {
					      "nodeId": "0002",
					      "satValues": [
					        "1"
					      ]
					    }
					  ]
					};
		App.loadAnalysis(analysisResult);

	}else{
		//backend script called
		var pathToCGI = "./cgi-bin/backendCom.cgi";

	 	$.ajax({
			url: pathToCGI,
			type: "post",
			contentType: "json",
			data:JSON.stringify(js_object),
			success: function(response){
				App.executeJava();
			}
		})	.fail(function(){
			msg = "Ops! Something went wrong.";
			alert(msg);
		});
	}
}

App.executeJava = function(){
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

App.getFileResults = function(){
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
			App.loadAnalysis(analysisResults);
		}
	})
	.fail(function(){
		msg = "Ops! Something went wrong getting file.";
		alert(msg);
	});
}

//Render the backend analysis into graph model
App.loadAnalysis = function(analysisResult){
	var elements = App.graph.getElements();
	for (var a = 0; a < elements.length; a++){
		var cell = elements[a];
		if (!(cell instanceof joint.shapes.basic.Actor) && !(cell instanceof joint.shapes.basic.Actor2)){
			for(var i = 0; i < analysisResult.nodesList.length; i++){
				if(cell.attributes.elementid == analysisResult.nodesList[i].nodeId){
					if(analysisResult.nodesList[i].satValues == 1){
						cell.attr({ '.satvalue': {'d': 'M 0 10 L 5 20 L 20 0 L 5 20 L 0 10', 'stroke': '#00FF00', 'stroke-width':4}});
						cell.attributes.attrs[".satvalue"].value = "satisfied";
					}else if(analysisResult.nodesList[i].satValues == 2){
						cell.attr({ '.satvalue': {'d': 'M 0 8 L 5 18 L 20 0 L 5 18 L 0 8 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#00FF00', 'stroke-width':3, 'fill': 'transparent'}});
						cell.attributes.attrs[".satvalue"].value = "partiallysatisfied";
					}else if (analysisResult.nodesList[i].satValues == 3) {
						cell.attr({ '.satvalue': {'d': 'M15.255,0c5.424,0,10.764,2.498,10.764,8.473c0,5.51-6.314,7.629-7.67,9.62c-1.018,1.481-0.678,3.562-3.475,3.562\
									c-1.822,0-2.712-1.482-2.712-2.838c0-5.046,7.414-6.188,7.414-10.343c0-2.287-1.522-3.643-4.066-3.643\
									c-5.424,0-3.306,5.592-7.414,5.592c-1.483,0-2.756-0.89-2.756-2.584C5.339,3.683,10.084,0,15.255,0z M15.044,24.406\
									c1.904,0,3.475,1.566,3.475,3.476c0,1.91-1.568,3.476-3.475,3.476c-1.907,0-3.476-1.564-3.476-3.476\
									C11.568,25.973,13.137,24.406,15.044,24.406z', 'stroke': '#222222', 'stroke-width': 1}});
						cell.attributes.attrs[".satvalue"].value = "unknown";
					}else if (analysisResult.nodesList[i].satValues == 4) {
						cell.attr({ '.satvalue': {'d': 'M 0 0 L 20 8 M 20 7 L 5 15 M 5 14 L 25 23', 'stroke': '#222222', 'stroke-width': 4}});
						cell.attributes.attrs[".satvalue"].value = "conflict";
					}else if(analysisResult.nodesList[i].satValues == 5){
						cell.attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 3, 'fill': 'transparent'}});
						cell.attributes.attrs[".satvalue"].value = "partiallydenied";
					}else if(analysisResult.nodesList[i].satValues == 6){
						cell.attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 3, 'fill': 'transparent'}});
						cell.attributes.attrs[".satvalue"].value = "denied";
					}
				}
			}
		}
	}	
}
	

////Update images for properties
//// Navie: Changed satvalue from path to text
//if (value == "satisfied"){
//  // cell.attr({ '.satvalue': {'d': 'M 0 10 L 5 20 L 20 0 L 5 20 L 0 10', 'stroke': '#00FF00', 'stroke-width':4}});
//  cell.attr(".satvalue/text", "(FS, T)");
//}else if(value == "partiallysatisfied") {
//  // cell.attr({ '.satvalue': {'d': 'M 0 8 L 5 18 L 20 0 L 5 18 L 0 8 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#00FF00', 'stroke-width':3, 'fill': 'transparent'}});
//  cell.attr(".satvalue/text", "(PS, T)");
//}else if (value == "denied"){
//  // cell.attr({ '.satvalue': {'d': 'M 0 20 L 20 0 M 10 10 L 0 0 L 20 20', 'stroke': '#FF0000', 'stroke-width': 4}});
//  cell.attr(".satvalue/text", "(T, FD)");
//}else if (value == "partiallydenied") {
//  // cell.attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 3, 'fill': 'transparent'}});
//  cell.attr(".satvalue/text", "(T, PD)");
//}else if (value == "unknown") {
//  // cell.attr({ '.satvalue': {'d': 'M15.255,0c5.424,0,10.764,2.498,10.764,8.473c0,5.51-6.314,7.629-7.67,9.62c-1.018,1.481-0.678,3.562-3.475,3.562\
//      // c-1.822,0-2.712-1.482-2.712-2.838c0-5.046,7.414-6.188,7.414-10.343c0-2.287-1.522-3.643-4.066-3.643\
//      // c-5.424,0-3.306,5.592-7.414,5.592c-1.483,0-2.756-0.89-2.756-2.584C5.339,3.683,10.084,0,15.255,0z M15.044,24.406\
//      // c1.904,0,3.475,1.566,3.475,3.476c0,1.91-1.568,3.476-3.475,3.476c-1.907,0-3.476-1.564-3.476-3.476\
//      // C11.568,25.973,13.137,24.406,15.044,24.406z', 'stroke': '#222222', 'stroke-width': 1}});
//      cell.attr(".satvalue/text", "?");
//}else {
//  cell.removeAttr(".satvalue/d");
//}


/**
 * PAPER ACTIONS
 */


//Identify link-type: Refinement, Contribution, Qualification or NeededBy
//And store the linktype into the link
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
//Need to draw a link upon user creating link between 2 nodes
//Given a link and linktype, draw the deafult link
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
		link.label(0 ,{position: 0.5, attrs: {text: {text: "Dependency"}}});
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

//===================Search for root and leaf =====================


//Given a cell, search and highlight its root
//It ultilizes recursion
//When first time calling it, originalCell is null
//After that it is set to the cell that is being clicked on
//This is to prevent searching in an cyclic graph
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
//Definition of root: 
//No outgoing refinement, contribution, neededby link
//No incoming dependency , Actor link
//No error link at all
function isRoot(cell){
var outboundLinks = App.graph.getConnectedLinks(cell, {outbound: true});
var inboundLinks = App.graph.getConnectedLinks(cell, {inbound: true});
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
//This is for searchRoot function
//Given a cell, find a list of all "parent" cells for searchRoot to search next
//We define a parent P as:
//A dependency/actor link going from P to current node
//Or
//A refinement, contribution, neededby link from current node to P
function enQueue1(cell){
var queue = [];
var outboundLinks = App.graph.getConnectedLinks(cell, {outbound: true});
var inboundLinks = App.graph.getConnectedLinks(cell, {inbound: true});
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


//Given a cell, search and highlight its leaf
//This is a modified BFS alg ultilizing recursion
//When first time calling it, originalCell is null
//After that it is set to the cell that is being clicked on
//This is to prevent searching in an cyclic graph
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
//Definition of leaf: 
//No incoming refinement, contribution, neededby link
//No outgoing dependency , Actor link
//No error link at all
function isLeaf(cell){
var outboundLinks = App.graph.getConnectedLinks(cell, {outbound: true});
var inboundLinks = App.graph.getConnectedLinks(cell, {inbound: true});
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
//This is for searchLeaf function
//Given a cell, find a list of all "parent" cells for searchLeaf to search next
//We define a children C as:
//A dependency/actor link going from current node to C
//Or
//A refinement, contribution, qualification, neededby link from C to current node
function enQueue2(cell){
var queue = [];
var outboundLinks = App.graph.getConnectedLinks(cell, {outbound: true});
var inboundLinks = App.graph.getConnectedLinks(cell, {inbound: true});
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

