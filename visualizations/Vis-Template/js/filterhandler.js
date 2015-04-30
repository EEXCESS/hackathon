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

	addEmptyFilter: function(){		
		FilterHandler.currentFilter = { type: null, from: null, to: null, Object: null, dataWithinFilter: [], $container: $('<div class="filter-container"></div>')};
		var $filter = $('<div class="filter-container-outer current"><div class="filter-controls"><a href="#" class="filter-keep"><span class="batch-sm-add"></span></a> <a href="#" class="filter-remove"><span class="batch-sm-delete"></span></a></div></div>').append(FilterHandler.currentFilter.$container);
		FilterHandler.$filterRoot.prepend($filter);
	},

	addEmptyListFilter: function(){
		var currentFilterTemp = FilterHandler.currentFilter;
		FilterHandler.addEmptyFilter();
		FilterHandler.listFilter = FilterHandler.currentFilter;
		FilterHandler.listFilter.mergeMode = 'union';
		FilterHandler.makeCurrentPermanent ();
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
			FilterHandler.addEmptyFilter();

		FilterHandler.currentFilter.type = type;
		FilterHandler.currentFilter.categoryValues = categoryValues;
		FilterHandler.currentFilter.category = category;
		FilterHandler.currentFilter.from = from;
		FilterHandler.currentFilter.to = to;
		FilterHandler.currentFilter.dataWithinFilter = selectedData;

		FilterHandler.refreshCurrent();
	},

	setCurrentFilterListItems: function(selectedData, wasFirstItemSelectedWithAddingKey){		
		if (FilterHandler.listFilter == null)
			FilterHandler.addEmptyListFilter();

		if (selectedData == null || selectedData.length == 0){
			FilterHandler.removeFilter(FilterHandler.listFilter.$container.parents('.filter-container-outer'));
			FilterHandler.listFilter = null;
			return;
		}

		if (wasFirstItemSelectedWithAddingKey)
			FilterHandler.listFilter.mergeMode = 'symetricDifference'; // rename to xor?

		FilterHandler.listFilter.dataWithinFilter = selectedData;
		FilterHandler.refreshListFilter();
	},

	refreshCurrent: function(){
		if (FilterHandler.currentFilter.Object == null){
			FilterHandler.currentFilter.Object = PluginHandler.getFilterPluginForType(FilterHandler.currentFilter.type).Object;
			FilterHandler.currentFilter.Object.initialize();
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
		if (FilterHandler.listFilter.Object == null){
			FilterHandler.listFilter.Object = PluginHandler.getFilterPluginForType('list').Object;
			FilterHandler.listFilter.Object.initialize();
		}

		FilterHandler.listFilter.Object.draw(
			FilterHandler.listFilter.$container,
			FilterHandler.listFilter.dataWithinFilter,
			FilterHandler.listFilter.mergeMode);
	},

	clearCurrent: function(){
		if (FilterHandler.currentFilter == null)
			return;

		if (FilterHandler.currentFilter.Object != null){
			FilterHandler.currentFilter.Object.finalize();
			FilterHandler.currentFilter.Object = null;
		}
		FilterHandler.currentFilter.$container.parents('.filter-container-outer').empty();
		FilterHandler.currentFilter = null;
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

	mergeFilteredDataIds: function(){
		var mapId = function(d){ return d.id; };
		var dataToHighlightIds = []

		if (FilterHandler.currentFilter == null && FilterHandler.filters.length == 0 && FilterHandler.listFilter == null)
			return null;

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
				currentList = filterGroupsDataIds[i];
				dataToHighlightIds = _.filter(dataToHighlightIds, function(id){ return _.contains(currentList, id); });
			}
		}

		if (FilterHandler.listFilter != null){
			var listFilterDataIds = _.map(FilterHandler.listFilter.dataWithinFilter, mapId);
			if (FilterHandler.listFilter.mergeMode == 'union'){
				dataToHighlightIds = _.union(dataToHighlightIds, listFilterDataIds);
			} else if (FilterHandler.listFilter.mergeMode == 'symetricDifference') {
				dataToHighlightIds = _.xor(dataToHighlightIds, listFilterDataIds);
			}
		}

		console.log('mergeFilteredData: ' + dataToHighlightIds.length);
		return dataToHighlightIds;
	}
}
