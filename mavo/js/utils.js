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

