(function(){

	var TestPlugin = {};
	var $root = null;

	TestPlugin.initialize = function(EEXCESSObj, rootSelector){
		$root = $(rootSelector);
		// load CSS
		// load other needed scripts (require.js is available)
	};

	TestPlugin.draw = function(receivedData, mappingCombination, iWidth, iHeight){
		var $inner = $('<div>Hallo</div>').css('background-color', 'blue').css('height', '100%');
		$root.append($inner);
	};

	// indexArray: array with items' indices to highlight. They match items in receivedData (parameter in Render.draw)
	TestPlugin.highlightItems = function(indexArray){
	};

	TestPlugin.finalize = function(){
	};
	
	PluginHandler.registerVisualisationPlugin(TestPlugin, {
		'displayName' : 'TestPlugin', 
	});
})();
