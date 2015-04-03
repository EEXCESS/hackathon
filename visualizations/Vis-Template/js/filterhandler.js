var FilterHandler = {

	currentFilter : { type: null, from: null, to: null, Object: null},	
	registeredFilterVisualisations : [],
	$filterRoot: null,
	$currentFilterContainer: null,	
	vis: null,

	initialize: function(vis, filterRootSelector){
		FilterHandler.vis = vis;
		FilterHandler.$filterRoot = $(filterRootSelector);
		FilterHandler.$currentFilterContainer = $('<div></div>').css('height', '100%');
		FilterHandler.$filterRoot.append(FilterHandler.$currentFilterContainer);
	},

	// type : "time"
	setCurrentFilter: function(type, from, to){
		FilterHandler.currentFilter.type = type;
		FilterHandler.currentFilter.from = from;
		FilterHandler.currentFilter.to = to;

		FilterHandler.refreshCurrent();
	},

	refreshCurrent: function(){
		if (FilterHandler.currentFilter.Object == null){
			FilterHandler.currentFilter.Object = PluginHandler.getFilterPluginForType(FilterHandler.currentFilter.type).Object;
			FilterHandler.currentFilter.Object.initialize();
		}

		FilterHandler.currentFilter.Object.draw(
			FilterHandler.vis.getData(), 
			FilterHandler.vis.getHighlightedData(), 
			FilterHandler.$currentFilterContainer,
			FilterHandler.currentFilter.from, 
			FilterHandler.currentFilter.to);
	},

	clearCurrent: function(){
		if (FilterHandler.currentFilter.Object != null){
			FilterHandler.currentFilter.Object.finalize();
			FilterHandler.currentFilter.Object = null;
		}
		FilterHandler.$currentFilterContainer.empty();
	}
}