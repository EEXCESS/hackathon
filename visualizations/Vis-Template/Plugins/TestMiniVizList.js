(function(){

	var TestMiniViz = {};

	TestMiniViz.initialize = function(EEXCESSObj){		
	};

	TestMiniViz.draw = function($container, selectedData, mergeMode){
		var $vis = $container.find('.TestMiniVizList');
		if ($vis.length == 0){
			$vis = $('<div class="TestMiniVizList">Hallo</div>').css('background-color', 'lightgrey').css('padding-top', '10px').css('padding-bottom', '10px');		
			$container.append($vis);
		}

		$vis.html('Selected Items: ' + selectedData.length + '; merge: ' + mergeMode);
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini List', 
		'type' : 'list', 
	});
})();
