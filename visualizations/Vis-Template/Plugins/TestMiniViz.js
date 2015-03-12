(function(){

	var TestMiniViz = {};

	TestMiniViz.initialize = function(EEXCESSObj){
		
		// load CSS
		// load other needed scripts (require.js is available)
	};

	// filtes[].facet, from, to, type
	TestMiniViz.draw = function(data, filter, containerSelector, mappingCombination){
		$container = $(containerSelector);
		var $inner = $('<div>Hallo</div>').css('background-color', 'blue').css('height', '100%');		
		$container.append($inner);
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini', 
		'type' : 'date', 
	});
})();
