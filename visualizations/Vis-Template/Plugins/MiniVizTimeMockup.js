(function(){

	var TestMiniViz = {};

	TestMiniViz.initialize = function(EEXCESSObj){		
		// load CSS
		// load other needed scripts (require.js is available)
	};

	TestMiniViz.draw = function(data, selectedData, $container, category, categoryValues, fromYear, toYear){
		var $vis = $container.find('.TestMiniViz');
		if ($vis.length == 0){
			$vis = $('<div class="TestMiniViz">Hallo</div>').css('background-color', 'lightgrey').css('padding-bottom', '7px')
				.css('color', 'rgb(148, 148, 148)').css('font-style', 'italic').css('font-size', '8px');
			$container.append($vis);
		}
		
		$vis.html('Filter: ' + fromYear + " - " + toYear + '<br />Highlighted: ' + selectedData.length);
		$vis.prepend('<img src="Plugins/MiniVizTimeMockupScreenshot.png" />');
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini', 
		'type' : 'time', 
	});
})();
