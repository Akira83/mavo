
var ToolbarView = Backbone.View.extend({
  className: 'model-tool-bar',
  template: [
	  '	                <button id="btn-undo" class="btn">Undo</button>	'	,
	  '	                <button id="btn-redo" class="btn">Redo</button>	'	,
	  '	                <div class="dropdown">	'	,
	  '	                  <button id="btn-clear" class="btn">Clear</button>	'	,
	  '	                  <!-- <div class="btn">Font Size</div> -->	'	,
	  '	                  <div class="dropdown-toolbar">	'	,
	  '	                    <a id="btn-clear-all">Full Model</a>	'	,
	  '	                    <a id="btn-clear-elabel">Evaluation Labels</a>	'	,
	  '	                  </div>	'	,
	  '	                </div>	'	,
	  '	                <button id="btn-save" class="btn">Save</button>	'	,
	  '	                <button id="btn-load" class="btn">Load</button>	'	,
	  '	            </div>	'	,
	  '	            <button id="btn-zoom-in" class="btn">Zoom In</button>	'	,
	  '	            <button id="btn-zoom-out" class="btn">Zoom Out</button>	'	,
	  '	            <button id="btn-svg" class="btn">Open as SVG</button>	'	,
	  '	            <input type="file" id="loader" style="display:none">	'	,
	  '	            <div class="dropdown">	'	,
	  '	              <div class="btn">Font Size</div>	'	,
	  '	              <div class="dropdown-toolbar">	'	,
	  '	                <a id="btn-fnt">Default</a>	'	,
	  '	                <a id="btn-fnt-up">Increase</a>	'	,
	  '	                <a id="btn-fnt-down">Decrease</a>	'	,
	  '	              </div>	'	,
	  '	            </div>	'	,
	  '	            <div class="dropdown">	'	,
	  '	              <div class="btn">Help</div>	'	,
	  '	              <div class="dropdown-toolbar">	'	,
	  '	                <a id = "btn-doc">Documentation</a>	'	,
	  '	                <a id = "btn-leg">Legend</a>	'	,
	  '	              </div>	'	,
	  '	            </div>	'	,
	  '	            <button id="btn-analysis" class="btn">Analysis</button>	'	,
	  '	            <button id="btn-model" class="btn">Model</button>	'	,

  ].join(''),
  events : {
	  //TESTED
	  'click #btn-undo' : 'btnUndo',
	  'click #btn-redo' : 'btnRedo',
	  'click #btn-clear-all' : 'btnClearAll',
	  'click #btn-clear-elabel' : 'btnClearElabel',
	  'click #btn-save' : 'btnSave',
	  'click #btn-load' : 'btnLoad',
	  'click #btn-zoom-in' : 'btnZoomIn',
	  'click #btn-zoom-out' : 'btnZoomOut',
	  'click #btn-svg' : 'btnSVG',	  
	  'click #btn-fnt-up' : 'btnFntUp',
	  'click #btn-fnt-down' : 'btnFntDown',
	  'click #btn-fnt' : 'btnFnt',
	  'click #btn-doc' : 'btnDoc',
	  'click #btn-leg' : 'btnLeg',
	  'click #btn-analysis' : 'btnAnalysis',
	  'click #btn-model' : 'btnModel',

  },
  render : function(){
      this.$el.html(_.template(this.template)());
  },
  //------
  //EVENTS
  //------
  btnUndo : function(){
	  App.commandManager.undo();
  },
  btnRedo : function(){
	  App.commandManager.redo();
  },
  btnClearAll : function(){
	App.graph.clear();
	App.elementCounter = 0;
	document.cookie='graph={}; expires=Thu, 18 Dec 2013 12:00:00 UTC;';
  },
  btnClearElabel : function(){
	var elements = App.graph.getElements();
	for (var i = 0; i < elements.length; i++){
		elements[i].removeAttr(".satvalue/d");
		elements[i].attr(".constraints/lastval", "none");
		elements[i].attr(".mavo/text", " ");
		var cellView  = elements[i].findView(App.paper);
		App.elementInspector.render(cellView);
		App.elementInspector.$('#init-sat-value').val("none");
		App.elementInspector.updateHTML(null);
	}
  },
  btnSave : function() {
	var name = window.prompt("Please enter a name for your file. \nIt will be saved in your Downloads folder. \n.json will be added as the file extension.", "<file name>");
	if (name){
		var fileName = name + ".json";
		App.download(fileName, JSON.stringify(App.graph.toJSON()));
	}
  },
  btnLoad : function(){
	$('#loader').click();
	var loader = document.getElementById("loader");
	var reader = new FileReader();
	var graph = App.graph;
	
	loader.onchange = function(){
		reader.readAsText(loader.files.item(0));
	};
	
	reader.onload = function(){
		graph.fromJSON(JSON.parse(reader.result));	
	}
  },  
  btnZoomIn : function() {
	  App.paperScroller.zoom(0.2, { max: 3 });
  },
  btnZoomOut : function() {
	  App.paperScroller.zoom(-0.2, { min: 0.2 });
  },
  btnSVG : function() {
	  App.paper.openAsSVG();
  },
  btnFntUp : function(){
	var max_font = 20;
	var elements = App.graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".name/font-size") < max_font){
			elements[i].attr(".name/font-size", elements[i].attr(".name/font-size") + 1);
		}
	}
  },
  btnFntDown : function(){
	var min_font = 6;
	var elements = App.graph.getElements();
	for (var i = 0; i < elements.length; i++){
		if (elements[i].attr(".name/font-size") > min_font){
			elements[i].attr(".name/font-size", elements[i].attr(".name/font-size") - 1);
		}
	}
  },
  btnFnt : function(){
	var elements = App.graph.getElements();
	for (var i = 0; i < elements.length; i++){
		elements[i].attr(".name/font-size", 10);
	}
  },
  btnDoc : function(){
	  window.open("https://arxiv.org/pdf/1605.07767v3.pdf");
  },
  btnLeg : function(){
	  window.open("legend.html", "Legend", "width=300, height=250");
  },
  btnAnalysis : function(){
	  App.changeView('analysis');
  },
  btnModel : function(){
	  App.changeView('model');
  }
});

ToolbarView.parent;
