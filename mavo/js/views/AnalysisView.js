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
		  console.log(JSON.stringify(iSModel.getModel()));
		  this.parent.backendComm(iSModel.getModel());
	  },	  
	  clear: function(){
	    this.$el.html('');
	  }
});

AnalysisView.parent;
