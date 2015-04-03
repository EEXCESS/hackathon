(function(){

	var TestMiniViz = {};

	TestMiniViz.initialize = function(EEXCESSObj){		
		// load CSS
		// load other needed scripts (require.js is available)
	};

	TestMiniViz.draw = function(data, hightlightedData, $container, northEast, southWest){
		var $vis = $container.find('.TestMiniViz');
		if ($vis.length == 0){
			$vis = $('<div class="TestMiniViz">Hallo</div>').css('background-color', 'lightgrey').css('margin-top', '10px').css('padding-top', '10px').css('padding-bottom', '10px');		
			$container.append($vis);
		}

		$vis.html('NE: ' + northEast.lat.toFixed(4) + ", " + northEast.lng.toFixed(4) + " <br />SW: " + southWest.lat.toFixed(4) + ", " + southWest.lng.toFixed(4) + '<br />Highlighted: ' + hightlightedData.length);
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini Geo', 
		'type' : 'geo', 
	});
})();
