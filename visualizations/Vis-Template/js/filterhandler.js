var FilterHandler = {

	currentFilter: null,
	registeredFilterVisualisations : [],
	filters : [],
	$filterRoot: null,
	vis: null,

	initialize: function(vis, filterRootSelector){
		FilterHandler.vis = vis;
		FilterHandler.$filterRoot = $(filterRootSelector);		
		FilterHandler.$filterRoot.on('click', '.filter-remove', function(){
			FilterHandler.removeFilter($(this).parents('.filter-container-outer'));
		});	
		FilterHandler.$filterRoot.on('click', '.filter-keep', function(){
			FilterHandler.makeCurrentPermanent();			
		});
	},

	addEmptyFilter: function(){		
		FilterHandler.currentFilter = { type: null, from: null, to: null, Object: null, $container: $('<div class="filter-container"></div>')};
		var $filter = $('<div class="filter-container-outer current"><div class="filter-controls"><a href="#" class="filter-keep"><span class="batch-sm-add"></span></a> <a href="#" class="filter-remove"><span class="batch-sm-delete"></span></a></div></div>').append(FilterHandler.currentFilter.$container);
		FilterHandler.$filterRoot.prepend($filter);
	},

	// type : "time"
	setCurrentFilter: function(type, from, to){
		if (FilterHandler.currentFilter == null)
			FilterHandler.addEmptyFilter();

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
			FilterHandler.currentFilter.$container,
			FilterHandler.currentFilter.from, 
			FilterHandler.currentFilter.to);
	},

	clearCurrent: function(){
		if (FilterHandler.currentFilter.Object != null){
			FilterHandler.currentFilter.Object.finalize();
			FilterHandler.currentFilter.Object = null;
		}
		FilterHandler.currentFilter.$container.empty();
	},

	makeCurrentPermanent: function(){
		if (FilterHandler.currentFilter == null)
			return;
		
		var index = FilterHandler.filters.length - 1;
		FilterHandler.currentFilter.$container.data('filter-index', index);
		FilterHandler.currentFilter.$container.parents('.filter-container-outer').removeClass('current').addClass('permanent');
		FilterHandler.filters.push(FilterHandler.currentFilter);
		FilterHandler.currentFilter = null;
	},

	removeFilter: function($filterOuter){			
		var filterIndex = $filterOuter.find('.filter-container').data('filter-index');
		if (filterIndex === undefined)
			return;

		FilterHandler.filters.splice(filterIndex);
		$filterOuter.remove();
		FilterHandler.resetFilterIndex();
	},

	resetFilterIndex: function(filterIndex, $filter){
		for (var i=0; i<FilterHandler.filters.length; i++){
			var filter = FilterHandler.filters[i];
			filter.$container.data('filter-index', i);
		}
	}
}