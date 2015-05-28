(function(){

	var TestMiniViz = {};

	TestMiniViz.initialize = function(EEXCESSObj){		
		// load CSS
		// load other needed scripts (require.js is available)
	};

	TestMiniViz.draw = function(allData, selectedData, inputData, $container, category, categoryValues, fromYear, toYear){
		var $vis = $container.find('.TestMiniViz');
		if ($vis.length == 0){
			$vis = $('<div class="TestMiniViz">Hallo</div>').css('background-color', 'lightgrey').css('padding-top', '10px').css('padding-bottom', '10px');		
			$container.append($vis);
		}

		$vis.html('Filter: ' + fromYear + " - " + toYear + '<br />Highlighted: ' + selectedData.length);
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini', 
		'type' : 'time', 
	});
})();
