(function(){

	var TestMiniViz = {};

	TestMiniViz.initialize = function(EEXCESSObj){		
		// load CSS
		// load other needed scripts (require.js is available)
	};

	TestMiniViz.draw = function(allData, selectedData, inputData, $container, category, categoryValues, fromYear, toYear){
		var $vis = $container.find('.TestMiniViz');
		if ($vis.length == 0){
			$vis = $('<div class="TestMiniViz">Hallo</div>');
			$container.append($vis);
		}
		
		$vis.html('<div class="debug">Filter: ' + fromYear + " - " + toYear + '<br />Highlighted: ' + selectedData.length + '</div>');
		$vis.prepend('<img src="Plugins/MiniVizTimeMockupScreenshot.png" style="width:100%; padding:3px 0;"/>');
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini', 
		'type' : 'time', 
	});
})();
