var AnalysisView = Backbone.View.extend({
	
	  className: 'analysis-view',
	  
	  template: [
		  '<label>Analysis</label>',
		  '<button id="btnOneSolution" class="analysis-btns inspector-btn sub-label green-btn">First Solution</button>',
		  '<button id="btnAllSolutions" class="analysis-btns inspector-btn sub-label green-btn">All Solutions</button>',
  	  ].join(''),
	  events: {
		  'click #btnOneSolution' : 'oneSolution',
		  'click #btnAllSolutions' : 'allSolutions',
	  },
	  render: function() {
	      this.$el.html(_.template(this.template)());
	  },
	  oneSolution: function(){
		  var iSModel = new iStarModel(App.graph);
		  iSModel.setModel();
		  var myjson = {};
		  myjson.action = "oneSolution";
		  myjson.model = iSModel.getModel();
		  
		  if(App.develop){
			myjson = JSON.stringify(myjson, null, 2);
		  	var x = window.open();
			x.document.open();
			x.document.write('<html><body><pre>' + myjson + '</pre></body></html>');
			x.document.close();
			App.backendComm(iSModel.getModel());			  
		  }else{
			  App.backendComm(iSModel.getModel());			  
		  }
	  }, 
	  allSolutions: function(){
		  var iSModel = new iStarModel(App.graph);
		  iSModel.setModel();
		  var myjson = {};
		  myjson.action = "allSolutions";
		  myjson.model = iSModel.getModel();
		  
		  if(App.develop){
			myjson = JSON.stringify(myjson, null, 2);
		  	var x = window.open();
			x.document.open();
			x.document.write('<html><body><pre>' + myjson + '</pre></body></html>');
			x.document.close();
		  }else{
			  App.backendComm(iSModel.getModel());			  
		  }
	  },
	  clear: function(){
	    this.$el.html('');
	  }
});

