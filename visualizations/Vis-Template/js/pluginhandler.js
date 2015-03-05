var PluginHandler = {
	vis : null,
	visPlugins:[],
	filterPlugins:[],
	visRootSelector: null,
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

	initialize:function(vis, visRootSelector){
		PluginHandler.vis = vis;
		PluginHandler.visRootSelector = visRootSelector;
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
		if (configuration.Object.initialize != undefined)
			configuration.Object.initialize(PluginHandler.vis, PluginHandler.visRootSelector);

		PluginHandler.filterPlugins.push(configuration);
	},

	registerPluginScripts:function(pluginScripts){
		for(var i=0; i<pluginScripts.length; i++)
			PluginHandler.loadScript(pluginScripts[i]);
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