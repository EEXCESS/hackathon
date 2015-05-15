(function(){

	var TestMiniViz = {};

	TestMiniViz.initialize = function(EEXCESSObj){		
	};

	TestMiniViz.draw = function($container, selectedData){
		var $vis = $container.find('.TestMiniVizList');
		if ($vis.length == 0){
			$vis = $('<div class="TestMiniVizList">Hallo</div>').css('background-color', 'lightgrey').css('padding-top', '10px').css('padding-bottom', '10px');		
			$container.append($vis);
		}

		var items = "";
		_.forEach(selectedData, function(item, i){ items += '<span title="' + item.data.id + '">' + i + ' '+ item.selectionMode +' </span><br />'; });
		$vis.html('Selected Items: ' + selectedData.length + '<br />' + items);
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini List', 
		'type' : 'list', 
	});
})();
