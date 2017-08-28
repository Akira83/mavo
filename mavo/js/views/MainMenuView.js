var MainMenuView = Backbone.View.extend({
	
  className: 'main-menu-class',
  
  template:[
	  '<nav class="navbar navbar-expand-lg navbar-dark bg-dark">' +
	  '  <a class="navbar-brand" href="#">Leaf 2.0 MAVO</a>' +
	  '    <ul class="navbar-nav">' +
	  //BEGIN: FILE MENU
	  '      <li class="nav-item dropdown">' +
	  '        <a class="nav-link dropdown-toggle" href="#" id="fileMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
	  '          File' +
	  '        </a>' +
	  '        <div class="dropdown-menu" aria-labelledby="fileMenu">' +
	  '          <a id="btn_new" class="dropdown-item" href="#">New Model</a>' +
	  '          <a id="btn_open" class="dropdown-item" href="#">Open Model</a>' +
	  '          <a id="btn_save" class="dropdown-item" href="#">Save Model</a>' +
	  '				<div class="dropdown-divider"></div>' +
	  '          <a id="btn_exp_svg" class="dropdown-item" href="#">Export as SVG</a>' +
	  '          <a id="btn_exp_leaf" class="dropdown-item" href="#">Export as .leaf</a>' +
	  '        </div>' +
	  '      </li>' +
	  //END: FILE MENU
	  //BEGIN: EDIT MENU
	  '      <li class="nav-item dropdown">' +
	  '        <a class="nav-link dropdown-toggle" href="#" id="fileMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
	  '          Edit' +
	  '        </a>' +
	  '        <div class="dropdown-menu" aria-labelledby="fileMenu">' +
	  '          <a id="btn_undo" class="dropdown-item" href="#">Undo</a>' +
	  '          <a id="btn_redo" class="dropdown-item" href="#">Redo</a>' +
	  '				<div class="dropdown-divider"></div>' +
	  '          <a id="btn_clr_model" class="dropdown-item" href="#">Clear All Model</a>' +
	  '          <a id="btn_clr_eval_lbls" class="dropdown-item" href="#">Clear Evaluation Labels</a>' +
	  '        </div>' +
	  '      </li>' +
	  //END: EDIT MENU
	  //BEGIN: VIEW MENU
	  '      <li class="nav-item dropdown">' +
	  '        <a class="nav-link dropdown-toggle" href="#" id="fileMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
	  '          View' +
	  '        </a>' +
	  '        <div class="dropdown-menu" aria-labelledby="fileMenu">' +
	  '          <a id="btn_zoom_in" class="dropdown-item" href="#">Zoom In</a>' +
	  '          <a id="btn_zoom_out" class="dropdown-item" href="#">Zoom Out</a>' +
	  '				<div class="dropdown-divider"></div>' +
	  '          <a id="btn_ftn_default" class="dropdown-item" href="#">Default Font Size</a>' +
	  '          <a id="btn_fnt_up" class="dropdown-item" href="#">Increase Font Size</a>' +
	  '          <a id="btn_fnt_down" class="dropdown-item" href="#">Decrease Font Size</a>' +
	  '        </div>' +
	  '      </li>' +
	  //END: VIEW MENU
	  //BEGIN: HELP MENU
	  '      <li class="nav-item dropdown">' +
	  '        <a class="nav-link dropdown-toggle" href="#" id="fileMenu" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">' +
	  '          Help' +
	  '        </a>' +
	  '        <div class="dropdown-menu" aria-labelledby="fileMenu">' +
	  '		   	<a id="btn_doc" class="dropdown-item" onclick="window.open("documentation.pdf"); return false;">Documentation</a>' +
	  '			<a id="btn_legend" class="dropdown-item" onclick="window.open("legend.html", "newwindow", "width=300, height=250"); return false;">Legend</a>' +
	  '        </div>' +
	  '      </li>' +
	  //END: HELP MENU
	  '      <li class="nav-item dropdown">' +
	  '		   	<a id="btn_analysis" class="nav-link">Analysis</a>' +
	  '      </li>' +
	  '      <li class="nav-item dropdown">' +
	  '			<a id="btn_model" class="nav-link ">Modelling</a>' +
	  '      </li>' +
	  '    </ul>' +
	  '</nav>' 
  ],
  
  el: '#toolbar',
  
  initialize: function(){
		this.render();
  },
  
  render: function(){
	  this.$el.html(_.template(this.template)());
  },
  
  events:{
	  //FILE
	  'click #btn_new' : 'btnClearAll',
	  'click #btn_open' : 'btnLoad',
	  'click #btn_save' : 'btnSave',
	  'click #btn_exp_svg' : 'btnSVG',	  
	  //EDIT	  
	  'click #btn_undo' : 'btnUndo',
	  'click #btn_redo' : 'btnRedo',
	  'click #btn_clr_model' : 'btnClearAll',
	  'click #btn_clr_eval_lbls' : 'btnClearElabel',
	  //VIEW
	  'click #btn_zoom_in' : 'btnZoomIn',
	  'click #btn_zoom_out' : 'btnZoomOut',
	  'click #btn_fnt_default' : 'btnFnt',
	  'click #btn_fnt_up' : 'btnFntUp',
	  'click #btn_fnt_down' : 'btnFntDown',
	  //HELP
	  'click #btn_doc' : 'btnDoc',
	  'click #btn_legend' : 'btnLeg',
	  
	  'click #btn_analysis' : 'btnAnalysis',
	  'click #btn_model' : 'btnModel',
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
