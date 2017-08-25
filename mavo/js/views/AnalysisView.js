var AnalysisView = Backbone.View.extend({
	
	  className: 'analysis-view',
	  
	  template: [
		  '<label>Analysis</label>',
		  '<button id="btn-analysis" class="analysis-btns inspector-btn sub-label green-btn">Execute Analysis</button>',
  	  ].join(''),
	  events: {
		  'click #btn-analysis' : 'btnAnalysis',
	  },
	  render: function() {
	      this.$el.html(_.template(this.template)());
	  },
	  btnAnalysis : function(){
		  var iSModel = new iStarModel(App.graph);
		  iSModel.setModel();
		  
		  if(App.develop){
			var myjson = JSON.stringify(iSModel.getModel(), null, 2);
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

