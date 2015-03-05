var PluginHandler = {
	vis : null,
	plugins:[],
	rootSelector: null,
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

	initialize:function(vis, rootSelector){
		PluginHandler.vis = vis;
		PluginHandler.rootSelector = rootSelector;
	},

	getPlugins:function(){
		return PluginHandler.plugins;
	},

	registerVisualisationPlugin: function(pluginObject, pluginConfiguration){

		if (!pluginConfiguration.mappingCombinations){
			pluginConfiguration.mappingCombinations = PluginHandler.defaultCombinations;
		}

		pluginConfiguration.Object = pluginObject;
		if (pluginConfiguration.Object.initialize != undefined)
			pluginConfiguration.Object.initialize(PluginHandler.vis, PluginHandler.rootSelector);
		PluginHandler.plugins.push(pluginConfiguration);
		PluginHandler.vis.refreshChartSelect(); // todo: call not before all plugins are loaded
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
		for(var i=0; i<PluginHandler.plugins.length; i++){
			var plugin = PluginHandler.plugins[i];
			if (plugin.displayName == displayName){				
				return plugin;			
			}
		}
		return null;
	}
};