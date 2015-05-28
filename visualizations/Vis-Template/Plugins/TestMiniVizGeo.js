(function(){

	var TestMiniViz = {};

	TestMiniViz.initialize = function(EEXCESSObj){		
		// load CSS
		// load other needed scripts (require.js is available)
	};

	TestMiniViz.draw = function(allData, selectedData, inputData, $container, category, categoryValues, northEast, southWest){
		var $vis = $container.find('.TestMiniVizGeo');
		if ($vis.length == 0){
			$vis = $('<div class="TestMiniVizGeo">Hallo</div>').css('padding-top', '10px').css('padding-bottom', '10px');		
			$container.append($vis);
		}

		if (northEast != null && southWest != null)
			$vis.html('NE: ' + northEast.lat.toFixed(4) + ", " + northEast.lng.toFixed(4) + " <br />SW: " + southWest.lat.toFixed(4) + ", " + southWest.lng.toFixed(4) + '<br />Highlighted: ' + selectedData.length);
		else 
			$vis.html('');
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini Geo', 
		'type' : 'geo', 
	});
})();
