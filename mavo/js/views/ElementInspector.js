//Class for the element properties tab that appears when an element is clicked 

var ElementInspector = Backbone.View.extend({
	
  className: 'element-inspector',

  template: [
      '<label>Node name</label>',
      '<textarea id="elementName" class="cell-attrs-text"></textarea>',
      '<label>Initial Satisfaction Value</label>',
      '<select id="init-sat-value" class="dropdown-elem-inpec">',
        '<option value=none> None </option>',
        '<option value=conflict> Conflict </option>',
        '<option value=satisfied> Satisfied </option>',
        '<option value=partiallysatisfied> Partially Satisfied </option>',
        '<option value=unknown> Unknown </option>',
        '<option value=partiallydenied> Partially Denied </option>',
        '<option value=denied> Denied </option>',
	  '</select>',
      '<br>',
      '<label>MAVO Annotations</label>',
      '<textarea id="annotations" class="cell-attrs-text"></textarea>',
      '<label>Add New Annotation</label>',
      '<select id="mavo-annotation" class="dropdown-elem-inpec">',
      	'<option value=none> None </option>',
  		'<option value=M> May (M) </option>',
  		'<option value=S> ABS (S) </option>',
  		'<option value=V> Variable (V) </option>',
	  '</select>',
	  '<div id="set-max-size" hidden>',
	    '<label>Max Set</label>',
	    '<select id="set-size" class="actor-type">',
	      '<option value=1> 1 </option>',
	      '<option value=2> 2 </option>',
	      '<option value=3 selected="select"> 3 </option>',
	      '<option value=4> 4 </option>',
	      '<option value=5> 5 </option>',
	    '</select>',
	  '</div>',
	  '<button id="btn-clean" class="analysis-btns inspector-btn sub-label green-btn">Clean Annotations</button>'
  ].join(''),
  
  actor_template: [
    '<label>Actor name</label>',
    '<textarea id="elementName" class="cell-attrs-text" maxlength=100></textarea>',
    '<label> Actor type </label>',
    '<select class="actor-type">',
      '<option value=A> Actor </option>',
      '<option value=G> Agent </option>',
      '<option value=R> Role </option>',
    '</select>'
	].join(''),	

  events: {
    'keyup #elementName': 'nameAction',
    'change #init-sat-value':'updateHTML',
    'change #mavo-annotation':'addMavoAnnotation',
    'click #btn-clean':'cleanAnnotations',
    'change #set-size':'updateHTML',
    'change .actor-type': 'updateHTML'

  },
  
  //Initializing Element Inspector using the template.
  render: function(cellView) {
    this._cellView = cellView;
    var cell = this._cellView.model;

    // Render actor template if actor or actor2
    if (cell instanceof joint.shapes.basic.Actor || cell instanceof joint.shapes.basic.Actor2){
      this.$el.html(_.template(this.actor_template)());
      this.$('#elementName').val(cell.attr(".name/text") || '');
      return
    }else{
      this.$el.html(_.template(this.template)());
    }

    cell.on('remove', function() {
        this.$el.html('');
    }, this);
    
    // Load initial value
    this.$('#elementName').val(cell.attr(".name/text") || '');
    this.$('#init-sat-value').val(cell.attr(".satvalue/value") || 'none');
    if (!cell.attr(".satvalue/value")){
      cell.attr(".satvalue/value", 'none');
    }
    
    //Load MAVO annotations view
    this.$('#annotations').val(cell.attr(".mavo/text") || 'none');
    this.$('#mavo-annotation').val('none');
    
    if (!cell.attr(".mavo/size")){
        cell.attr(".mavo/size", '');
    }
   
    var mavoAnnotations = (cell.attr(".mavo/text") || "");
    
    if(mavoAnnotations.indexOf("S") !== -1){
    	this.$('#set-size').val(cell.attr(".mavo/size") || '3');
    	this.$('#set-max-size').show();
    }else{
 	   this.$('#set-max-size').hide();   
    }    
    	
  },
  // update cell name
  nameAction: function(event){
	var ENTER_KEY = 13;
    //Prevent the ENTER key from being recorded when naming nodes.
	if (event.which === ENTER_KEY){
		event.preventDefault();
    }

    var cell = this._cellView.model;
    var text = this.$('#elementName').val()
    // Do not allow special characters in names, replace them with spaces.

    text = text.replace(/[^\w\n]/g, ' ');
    cell.attr({ '.name': { text: text } });
  },
  //Add mavo annotation to the cell
  addMavoAnnotation: function(){
    var cell = this._cellView.model;
    //Verify if the cell already has any annotation
    var mavoAnnotations = (cell.attr(".mavo/text")||"");
    var newAnnotation = this.$('#mavo-annotation').val();
    //If it is the same annotation dont create a new one, just create if it is a new annotation
    if(mavoAnnotations.indexOf(newAnnotation) == -1){
        cell.attr(".mavo/text", mavoAnnotations + " " + newAnnotation);
        if(newAnnotation=="S"){
            var max_size = this.$('#set-size').val();
        	cell.attr(".mavo/size", max_size); 
        }
    }
    this.render(this._cellView);
  },
  //Clear all mavo annotations
  cleanAnnotations: function(){
	  var cell = this._cellView.model;
      cell.attr(".mavo/text", "");    
      this.render(this._cellView);
  },
  // update satisfaction value and buttons selection based on function type selection
  updateHTML: function(event){
   var initValue = this.$('#init-sat-value').val();
   
   // display based on inital value
    if((initValue == "none") || (initValue == "conflict")){
      this.updateCell(null);
      return
    }else{
    	this.updateCell();
    }
  },

  //Make corresponding changes in the inspector to the actual element in the chart
  updateCell: function(event) {
		var cell = this._cellView.model;
    // Cease operation if selected is Actor
  	if (cell instanceof joint.shapes.basic.Actor){ 
    	cell.prop("actortype", this.$('.actor-type').val());
    	if (cell.prop("actortype") == 'G'){
    		cell.attr({ '.line':
    					{'ref': '.label',
            			 'ref-x': 0,
            			 'ref-y': 0.08,
            			 'd': 'M 5 10 L 55 10',
            			 'stroke-width': 1,
            			 'stroke': 'black'}});
    	}else if (cell.prop("actortype") == 'R'){
    		cell.attr({ '.line':
    					{'ref': '.label',
            			 'ref-x': 0,
            			 'ref-y': 0.6,
            			 'd': 'M 5 10 Q 30 20 55 10 Q 30 20 5 10' ,
            			 'stroke-width': 1,
            			 'stroke': 'black'}});
    	}else {
    		cell.attr({'.line': {'stroke-width': 0}});
    	}
    	return;
  	}
    // Cease operation if selected is Actor2
    if (cell instanceof joint.shapes.basic.Actor2){ 
      cell.prop("actortype", this.$('.actor-type').val());
      if (cell.prop("actortype") == 'G'){
        cell.attr({ '.line':
              {
                   'ref-x': 0,
                   'ref-y': 0.08,
                   'd': 'M 10 10 L 70 10',
                   'stroke-width': 1,
                   'stroke': 'black'}});
      }else if (cell.prop("actortype") == 'R'){
        cell.attr({ '.line':
              {
                   'ref-x': 0,
                   'ref-y': 0.6,
                   'd': 'M 5 10 Q 30 20 75 10 Q 30 20 5 10' ,
                   'stroke-width': 1,
                   'stroke': 'black'}});
      }else {
        cell.attr({'.line': {'stroke-width': 0}});
      }
      return;
    }

    // save cell data
    cell.attr(".satvalue/value", this.$('#init-sat-value').val());
    cell.attr(".mavo/text", this.$('#mavo-annotation').val());
    
    //Update node display based on values
    var value = this.$('#init-sat-value').val();

    if (value == "satisfied"){
      cell.attr({ '.satvalue': {'d': 'M 0 10 L 5 20 L 20 0 L 5 20 L 0 10', 'stroke': '#00FF00', 'stroke-width':4}});
    }else if(value == "partiallysatisfied") {
      cell.attr({ '.satvalue': {'d': 'M 0 8 L 5 18 L 20 0 L 5 18 L 0 8 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#00FF00', 'stroke-width':3, 'fill': 'transparent'}});
    }else if (value == "denied"){
      cell.attr({ '.satvalue': {'d': 'M 0 20 L 20 0 M 10 10 L 0 0 L 20 20', 'stroke': '#FF0000', 'stroke-width': 4}});
    }else if (value == "partiallydenied") {
      cell.attr({ '.satvalue': {'d': 'M 0 15 L 15 0 M 15 15 L 0 0 M 17 30 L 17 15 C 17 15 30 17 18 23', 'stroke': '#FF0000', 'stroke-width': 3, 'fill': 'transparent'}});
    }else if (value == "conflict") {
      cell.attr({ '.satvalue': {'d': 'M 0 0 L 20 8 M 20 7 L 5 15 M 5 14 L 25 23', 'stroke': '#222222', 'stroke-width': 4}});
    }else if (value == "unknown") {
      cell.attr({ '.satvalue': {'d': 'M15.255,0c5.424,0,10.764,2.498,10.764,8.473c0,5.51-6.314,7.629-7.67,9.62c-1.018,1.481-0.678,3.562-3.475,3.562\
          c-1.822,0-2.712-1.482-2.712-2.838c0-5.046,7.414-6.188,7.414-10.343c0-2.287-1.522-3.643-4.066-3.643\
          c-5.424,0-3.306,5.592-7.414,5.592c-1.483,0-2.756-0.89-2.756-2.584C5.339,3.683,10.084,0,15.255,0z M15.044,24.406\
          c1.904,0,3.475,1.566,3.475,3.476c0,1.91-1.568,3.476-3.475,3.476c-1.907,0-3.476-1.564-3.476-3.476\
          C11.568,25.973,13.137,24.406,15.044,24.406z', 'stroke': '#222222', 'stroke-width': 1}});
    }else {
      cell.removeAttr(".satvalue/d");
    }
    
    //Update node display based on mavo
    var mavo = this.$('#mavo-annotation').val();
    var max_size = this.$('#set-size').val();
    
    if(mavo == "M"){
    	cell.attr({'.mavo':{'text':'M', 'value':'M'}});
    	this.$('#set-max-size').hide();
    }else if(mavo == "S"){
    	cell.attr({'.mavo':{'text':'S', 'value':'S', 'size':max_size}}); 
    	this.$('#set-max-size').show();
    }else if(mavo == "V"){
    	cell.attr({'.mavo':{'text':'V', 'text':'V'}});
    	this.$('#set-max-size').hide();
    }else if(mavo == "none"){
        cell.removeAttr(".mavo/text");
        this.$('#set-max-size').hide();
    }
    	
  },
  
  clear: function(){
    this.$el.html('');
  }
});

