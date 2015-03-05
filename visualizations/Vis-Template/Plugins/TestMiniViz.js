(function(){

	var TestMiniViz = {};
	var $root = null;

	TestMiniViz.initialize = function(EEXCESSObj, rootSelector){
		$root = $(rootSelector);
		// load CSS
		// load other needed scripts (require.js is available)
	};

	TestMiniViz.draw = function(receivedData, mappingCombination, iWidth, iHeight){
		var $inner = $('<div>Hallo</div>').css('background-color', 'blue').css('height', '100%');
		$root.append($inner);
	};

	// indexArray: array with items' indices to highlight. They match items in receivedData (parameter in Render.draw)
	TestMiniViz.highlightItems = function(indexArray){
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini', 
	});
})();
