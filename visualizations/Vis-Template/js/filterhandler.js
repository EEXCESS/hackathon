var FilterHandler = {

	currentFilter: null,
	registeredFilterVisualisations : [],
	filters : [],
	$filterRoot: null,
	$currentFilterContainer: null,	
	vis: null,

	createEmptyFilter: function(){
		return { type: null, from: null, to: null, Object: null};
	},

	initialize: function(vis, filterRootSelector){
		FilterHandler.currentFilter = FilterHandler.createEmptyFilter()
		FilterHandler.vis = vis;
		FilterHandler.$filterRoot = $(filterRootSelector);
		FilterHandler.addEmptyContainer();
	},

	addEmptyContainer: function(){
		FilterHandler.$currentFilterContainer = $('<div></div>');
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
	},

	keepCurrentFilter: function(){
		if (FilterHandler.currentFilter.type == null)
			return;

		FilterHandler.filters.push(FilterHandler.currentFilter);
		FilterHandler.currentFilter = FilterHandler.createEmptyFilter();
		FilterHandler.addEmptyContainer();
	},

	removeFilter: function(filterIndex){
		FilterHandler.filters.split(filterIndex);
	}
}