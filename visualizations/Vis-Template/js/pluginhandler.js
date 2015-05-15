var PluginHandler = {
	vis : null,
	visPlugins:[],
	filterPlugins:[],
	visRootSelector: null,
	filterRootSelector: null,
	pluginScripts:[],
	isInitialized:false,
	defaultCombinations : [
                [
                    {"facet": "language", "visualattribute": "x-axis"},
                    {"facet": "count", "visualattribute": "y-axis"},
                    {"facet": "language", "visualattribute": "color"}
                ],
                [
                    {"facet": "provider", "visualattribute": "x-axis"},
                    {"facet": "count", "visualattribute": "y-axis"},
                    {"facet": "provider", "visualattribute": "color"}
                ]
            ],

	initialize:function(vis, visRootSelector, filterRootSelector){
		PluginHandler.vis = vis;
		PluginHandler.visRootSelector = visRootSelector;
		PluginHandler.filterRootSelector = filterRootSelector;
		PluginHandler.isInitialized = true;
		
		PluginHandler.registerPluginScripts(PluginHandler.pluginScripts);		
	},

	getPlugins:function(){
		return PluginHandler.visPlugins;
	},

	registerVisualisation: function(pluginObject, configuration){

		if (!configuration.mappingCombinations){
			configuration.mappingCombinations = PluginHandler.defaultCombinations;
		}

		configuration.Object = pluginObject;
		if (configuration.Object.initialize != undefined)
			configuration.Object.initialize(PluginHandler.vis, PluginHandler.visRootSelector);
		PluginHandler.visPlugins.push(configuration);
		PluginHandler.vis.refreshChartSelect(); // todo: call not before all plugins are loaded
	},

	registerFilterVisualisation: function(pluginObject, configuration){
		configuration.Object = pluginObject;
		PluginHandler.filterPlugins.push(configuration);
	},

	getFilterPluginForType: function(type){
		for(var i=0; i<PluginHandler.filterPlugins.length; i++){
			var filterPlugin = PluginHandler.filterPlugins[i];
			if (filterPlugin.type == type)
				return filterPlugin;
		}
	},

	registerPluginScripts:function(pluginScripts){		
		for(var i=0; i<pluginScripts.length; i++){
			if (PluginHandler.isInitialized){
				PluginHandler.loadScript(pluginScripts[i]);
			} else {
				PluginHandler.pluginScripts.push(pluginScripts[i]);
			}
		}			
	},

	loadScript: function (scriptName, callback) {
	    var scriptEl = document.createElement('script');
	    scriptEl.src = chrome.extension.getURL('visualizations/Vis-Template/Plugins/' + scriptName + '');
	    scriptEl.addEventListener('load', callback, false);
	    document.head.appendChild(scriptEl);
	},

	getByDisplayName:function(displayName){
		for(var i=0; i<PluginHandler.visPlugins.length; i++){
			var plugin = PluginHandler.visPlugins[i];
			if (plugin.displayName == displayName){				
				return plugin;			
			}
		}
		return null;
	}
};