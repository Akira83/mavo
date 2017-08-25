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
		  var iSModel = new iStarModel(this.graph);
		  iSModel.setModel();
		  
		  var localhost = true;
		  if(localhost){
			var myjson = JSON.stringify(iSModel.getModel(), null, 2);
		  	var x = window.open();
			x.document.open();
			x.document.write('<html><body><pre>' + myjson + '</pre></body></html>');
			x.document.close();
		  }else{
			  this.parent.backendComm(iSModel.getModel());			  
		  }
	  },	  
	  clear: function(){
	    this.$el.html('');
	  }
});

AnalysisView.parent;
