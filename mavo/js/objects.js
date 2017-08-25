function iStarModel(graph){
	this.graph = graph;
	this.links = [];
	this.actors = [];
	this.nodes = [];
	
	this.setModel = function(){
		this.actors = this.getActors();
		this.nodes = this.getNodes();
		this.links = this.getLinks();
	};
	
	this.getModel = function(){
		var iModel = {};
		iModel.actors = this.actors;
		iModel.nodes = this.nodes;
		iModel.links = this.links;
		return iModel;
	}
	
	this.getLinks= function(){
		var links = [];
		
		for (var i = 0; i < this.graph.getLinks().length; i++){			
			var current = this.graph.getLinks()[i];
			var type = current.label(0).attrs.text.text.toUpperCase()
			var source = "-";
			var target = "-";

			if (current.get("source").id)
				source = this.graph.getCell(current.get("source").id).prop("elementid");
			if (current.get("target").id)
				target = this.graph.getCell(current.get("target").id).prop("elementid");
			
			var annotation = "none";

			var link = new Link(source, target, type, annotation);
			
			links.push(link);
		}
		
		return links;
	}

	this.getActors = function(){
		var elements = this.graph.getElements();
		
		//Help variable to count the length of actors
		var actorCounter = 0;
		//List of actors to be sent to backend inside the InputModel object
		var actorsList = [];
		
		//Select only actors elements
		for (var i = 0; i < elements.length; i++){
			if ((elements[i] instanceof joint.shapes.basic.Actor) || (elements[i] instanceof joint.shapes.basic.Actor2)){
				var actorId = actorCounter.toString();
				//Making that the id has 4 digits
				while (actorId.length < 3){ 
					actorId = "0" + actorId;
					}
				actorId = "a" + actorId;
				//Adding the new id to the UI graph element
				elements[i].prop("elementid", actorId);
				var name = elements[i].attr(".name/text");
				var type = (elements[i].prop("actortype") || "A");
				//Creating the actor object to be sent to backend
				var actor = new Actor(actorId, name, type);
				actorsList.push(actor);
				//iterating counter
				actorCounter++;
			}
		}
		return actorsList;
	}
	
	this.getNodes = function(){
		var nodes = [];
		var counter = 0;
		for (var i = 0; i < this.graph.getElements().length; i++){		
			if (!(this.graph.getElements()[i] instanceof joint.shapes.basic.Actor) && !(this.graph.getElements()[i] instanceof joint.shapes.basic.Actor2)){
				
				/**
				 * NODE ACTOR ID
				 */
				var actorid = '-';
				if (this.graph.getElements()[i].get("parent")){
					actorid = (this.graph.getCell(this.graph.getElements()[i].get("parent")).prop("elementid") || "-");
				}
				
				/**
				 * NODE ID
				 */
				//Making that the elementId has 4 digits
				var elementID = counter.toString();
				while (elementID.length < 4){ 
					elementID = "0" + elementID;
					}
				//Adding the new id to the UI graph element
				this.graph.getElements()[i].prop("elementid", elementID);
				
				/**
				 * NODE TYPE
				 */
				var elementType;
				if (this.graph.getElements()[i] instanceof joint.shapes.basic.Goal)
					elementType = "G";
				else if (this.graph.getElements()[i] instanceof joint.shapes.basic.Task)
					elementType = "T";
				else if (this.graph.getElements()[i] instanceof joint.shapes.basic.Softgoal)
					elementType = "S";
				else if (this.graph.getElements()[i] instanceof joint.shapes.basic.Resource)
					elementType = "R";
				else
					elementType = "I";
				
				
				/**
				 * INITIAL VALUE
				 */
			  	var satValue = this.graph.getElements()[i].attr(".satvalue/value");
			  	
			  	/**
			  	 * NODE NAME
			  	 */
			  	//Getting intentional element name
				var name = this.graph.getElements()[i].attr(".name/text").replace(/\n/g, " ");
				
				//TODO
				var annotation = this.graph.getElements()[i].attr(".mavo/value");
								
				var maxsize = (this.graph.getElements()[i].attr(".mavo/size") || "1");
				
				/**
				 * CREATING OBJECT
				 */
				var node = new Node(elementID, actorid, name, elementType, annotation, maxsize, satValue);		  	
				nodes.push(node);

				//iterating the counter
				counter++;
			}	  	
		}
		return nodes;
	}
	
}

function Actor(id, name, type){
	this.id = id;
	this.name = name;
	this.type = type;
}

function Node(id, actorId, name, type, annotation, maxsize, satValue){
	this.id = id;
	this.actorId = actorId;
	this.name = name;
	this.type = type;
	this.annotation = annotation;
	this.maxsize = maxsize;
	this.satValue = satValue;
}

function Link(source, target, type, annotation){
	this.source = source;
	this.target = target;
	this.type = type;
	this.annotation = annotation;
}


