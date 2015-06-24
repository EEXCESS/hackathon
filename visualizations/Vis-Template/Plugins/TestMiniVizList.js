(function(){

	var TestMiniViz = {};

	TestMiniViz.initialize = function(EEXCESSObj){		
	};

	TestMiniViz.draw = function($container, selectedData){
		var $vis = $container.find('.TestMiniVizList');
		if ($vis.length == 0){
			$vis = $('<div class="TestMiniVizList">Hallo</div>');
			$container.append($vis);
		}

		var items = "";
		var previews = "";
		_.forEach(selectedData, function(item, i){ 
			var src = '../../media/no-img.png';
			if (item.data.previewImage)
				src = item.data.previewImage;
			previews += '<img title="' + item.data.title + '" src="' + src + '" class="" style="width:24px; height:24px; margin:1px;" />'; 
			items += '<span title="' + item.data.id + '">' + i + ' '+ item.selectionMode +' </span><br />';
		});
		$vis.html('<div class="listFilterImages" style="align:center; padding:5px;">' + previews + '</div><div class="debug">Selected Items: ' + selectedData.length + '<br />' + items + '</div>');
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini List', 
		'type' : 'list', 
	});
})();
