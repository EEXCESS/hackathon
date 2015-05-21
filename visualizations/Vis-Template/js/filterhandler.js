var FilterHandler = {

	currentFilter: null,
	listFilter: null,
	registeredFilterVisualisations : [],
	filters : [],
	$filterRoot: null,
	vis: null,
	ext: null,

	initialize: function(vis, ext, filterRootSelector){
		FilterHandler.vis = vis;
		FilterHandler.ext = ext;
		FilterHandler.$filterRoot = $(filterRootSelector);		
		FilterHandler.$filterRoot.on('click', '.filter-remove', function(){
			FilterHandler.removeFilter($(this).parents('.filter-container-outer'));
		});	
		FilterHandler.$filterRoot.on('click', '.filter-keep', function(){
			FilterHandler.makeCurrentPermanent();			
		});
	},

	addEmptyFilter: function(doIncludeControls){		
		FilterHandler.currentFilter = { type: null, from: null, to: null, Object: null, dataWithinFilter: [], $container: $('<div class="filter-container"></div>')};
		var $filter = $('<div class="filter-container-outer current"></div>').append(FilterHandler.currentFilter.$container);
		if (doIncludeControls)
			$filter.prepend($('<div class="filter-controls"><a href="#" class="filter-keep"><span class="batch-sm-add"></span></a> <a href="#" class="filter-remove"><span class="batch-sm-delete"></span></a></div>'));
		FilterHandler.$filterRoot.prepend($filter);
	},

	addEmptyListFilter: function(){
		var currentFilterTemp = FilterHandler.currentFilter;
		FilterHandler.addEmptyFilter(false);
		FilterHandler.listFilter = FilterHandler.currentFilter;
		FilterHandler.listFilter.itemsClicked = []; // { data: object, selectionMode: single/add/remove }		
		FilterHandler.currentFilter = currentFilterTemp;
		// move sort order
		if (FilterHandler.currentFilter != null)
			FilterHandler.listFilter.$container.parents('.filter-container-outer').insertAfter(FilterHandler.currentFilter.$container.parents('.filter-container-outer'));
	},

	setCurrentFilterRange: function(type, selectedData, from, to){
		if (from == null && to == null)
			FilterHandler.clearCurrent();

		FilterHandler.setCurrentFilter(type, selectedData, null, null, from, to);
	},

	setCurrentFilterCategories: function(type, selectedData, category, categoryValues){
		if (categoryValues == null)
			FilterHandler.clearCurrent();

		FilterHandler.setCurrentFilter(type, selectedData, category, categoryValues, null, null);
	},

	setCurrentFilter: function(type, selectedData, category, categoryValues, from, to){
		if (FilterHandler.currentFilter == null)
			FilterHandler.addEmptyFilter(true);

		FilterHandler.currentFilter.type = type;
		FilterHandler.currentFilter.categoryValues = categoryValues;
		FilterHandler.currentFilter.category = category;
		FilterHandler.currentFilter.from = from;
		FilterHandler.currentFilter.to = to;
		FilterHandler.currentFilter.dataWithinFilter = selectedData;

		FilterHandler.refreshCurrent();
	},
	
	singleItemSelected: function(dataItemSelected, selectedWithAddingKey){
		selectedWithAddingKey = selectedWithAddingKey || false;		
		if (FilterHandler.listFilter == null)
			FilterHandler.addEmptyListFilter();
			
		if (selectedWithAddingKey){
			// look if already selected before.
			var existingItemIndex = _.findIndex(FilterHandler.listFilter.itemsClicked, function(d){ return d.data.id == dataItemSelected.id; });
			if (existingItemIndex >= 0){
				FilterHandler.listFilter.itemsClicked.splice(existingItemIndex, 1);
			} else {
				// look if item is already included in other filters:
				var selectionMode = "add";
				var rangeFilteredDataIds = FilterHandler.mergeRangeFiltersDataIds();
				if (rangeFilteredDataIds.indexOf(dataItemSelected.id) >= 0)
					selectionMode = "remove";
				
				FilterHandler.listFilter.itemsClicked.push({data: dataItemSelected, selectionMode: selectionMode});
			}
		} else {
			if (FilterHandler.listFilter.itemsClicked.length == 1 && FilterHandler.listFilter.itemsClicked[0].data.id == dataItemSelected.id)
				FilterHandler.listFilter.itemsClicked = [];
			else 
				FilterHandler.listFilter.itemsClicked = [{data: dataItemSelected, selectionMode: "single"}];
		}
			
		FilterHandler.listFilter.dataWithinFilter = _.map(FilterHandler.listFilter.itemsClicked, function(d){ return d.data;});		
				
		FilterHandler.refreshListFilter(); 				
	},

	refreshCurrent: function(){
		if (FilterHandler.currentFilter.Object == null){
			FilterHandler.currentFilter.Object = PluginHandler.getFilterPluginForType(FilterHandler.currentFilter.type).Object;
			FilterHandler.currentFilter.Object.initialize(FilterHandler.vis);
		}
		
		FilterHandler.currentFilter.Object.draw(
			FilterHandler.vis.getData(), 
			FilterHandler.currentFilter.dataWithinFilter,
			FilterHandler.currentFilter.$container,
			FilterHandler.currentFilter.category, 
			FilterHandler.currentFilter.categoryValues, 
			FilterHandler.currentFilter.from, 
			FilterHandler.currentFilter.to);

		FilterHandler.ext.selectItems();
	},

	refreshListFilter: function(){
		
		if (FilterHandler.listFilter != null && FilterHandler.listFilter.itemsClicked.length == 0){
			FilterHandler.clearList();
		}
		
		if (FilterHandler.listFilter != null){
			if (FilterHandler.listFilter.Object == null){
				FilterHandler.listFilter.Object = PluginHandler.getFilterPluginForType('list').Object;
				FilterHandler.listFilter.Object.initialize(FilterHandler.vis);
			}
	
			FilterHandler.listFilter.Object.draw(
				FilterHandler.listFilter.$container,
				FilterHandler.listFilter.itemsClicked);
				//FilterHandler.listFilter.dataWithinFilter);
		}
			
		FilterHandler.ext.selectItems();
	},

	clearCurrent: function(){
		if (FilterHandler.currentFilter == null)
			return;
			
		FilterHandler.clear(FilterHandler.currentFilter);
		FilterHandler.currentFilter = null;
	},

	clearList: function(){
		if (FilterHandler.listFilter == null)
			return;
			
		FilterHandler.clear(FilterHandler.listFilter);
		FilterHandler.listFilter = null;
	},

	clear: function(filterToClear){
		if (filterToClear.Object != null){
			filterToClear.Object.finalize();
			filterToClear.Object = null;
		}
		filterToClear.$container.parents('.filter-container-outer').empty();
	},

	reset: function(){
		FilterHandler.clearCurrent();
		FilterHandler.clearList();
		FilterHandler.ext.selectItems();
	},

	makeCurrentPermanent: function(){
		if (FilterHandler.currentFilter == null)
			return;
		
		var index = FilterHandler.filters.length;
		FilterHandler.currentFilter.$container.data('filter-index', index);
		FilterHandler.currentFilter.$container.parents('.filter-container-outer').removeClass('current').addClass('permanent');
		FilterHandler.filters.push(FilterHandler.currentFilter);
		FilterHandler.currentFilter = null;
		//  todo: remove filter in current chart, but highlight
		FilterHandler.ext.selectItems();
	},

	removeFilter: function($filterOuter){
		var filterIndex = $filterOuter.find('.filter-container').data('filter-index');
		if (filterIndex === undefined || filterIndex < 0)
			return;

		FilterHandler.filters.splice(filterIndex);
		$filterOuter.remove();
		FilterHandler.resetFilterIndex();
		FilterHandler.ext.selectItems();
	},

	resetFilterIndex: function(filterIndex, $filter){
		for (var i=0; i<FilterHandler.filters.length; i++){
			var filter = FilterHandler.filters[i];
			filter.$container.data('filter-index', i);
		}
	},
	
	mergeRangeFiltersDataIds: function(){
		var mapId = function(d){ return d.id; };
		var dataToHighlightIds = [];

		if (FilterHandler.currentFilter == null && FilterHandler.filters.length == 0)
			return dataToHighlightIds;

		// Combining filters by AND (different type) and OR (same type)
		var filters = FilterHandler.filters.slice(); // clone
		if (FilterHandler.currentFilter != null)
			filters.push(FilterHandler.currentFilter);

		var filterGroups = _.groupBy(filters, function(f){ return f.type; })
		var filterGroupsDataIds = [];
		_.forEach(filterGroups, function(filterGroupList, type){
			var filterGroupDataIds = [];
			for (var i=0; i<filterGroupList.length; i++){
				filterGroupDataIds = _.union(filterGroupDataIds, _.map(filterGroupList[i].dataWithinFilter, mapId));
			}
			filterGroupsDataIds.push(filterGroupDataIds);
		});
		// AND
		if (filterGroupsDataIds.length > 0){
			dataToHighlightIds = filterGroupsDataIds[0];
			for (var i=1; i<filterGroupsDataIds.length; i++){
				var currentList = filterGroupsDataIds[i];
				dataToHighlightIds = _.filter(dataToHighlightIds, function(id){ return _.contains(currentList, id); });
			}
		}
		
		return dataToHighlightIds;
	},

	mergeFilteredDataIds: function(){
		
		if (FilterHandler.currentFilter == null && FilterHandler.filters.length == 0 && FilterHandler.listFilter == null)
			return null;
			
		var dataToHighlightIds = FilterHandler.mergeRangeFiltersDataIds();

		// Adding ListFilter
		if (FilterHandler.listFilter != null && FilterHandler.listFilter.itemsClicked.length > 0){
			
			if (FilterHandler.listFilter.itemsClicked.length == 1 && FilterHandler.listFilter.itemsClicked[0].selectionMode == "single")
				return [FilterHandler.listFilter.itemsClicked[0].data.id];
				
			var idsToRemove = _.map(_.filter(FilterHandler.listFilter.itemsClicked, function(item){ return item.selectionMode == "remove"; }), function(d){return d.data.id; });
			var idsToAdd = _.map(_.filter(FilterHandler.listFilter.itemsClicked, function(item){ return item.selectionMode == "single" || item.selectionMode == "add"; }), function(d){return d.data.id; });
			
			dataToHighlightIds = _.difference(dataToHighlightIds, idsToRemove); 
			dataToHighlightIds = _.union(dataToHighlightIds, idsToAdd);
			
		}

		//console.log('mergeFilteredData: ' + dataToHighlightIds.length);
		return dataToHighlightIds;
	}
}
