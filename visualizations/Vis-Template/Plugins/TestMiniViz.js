(function(){

	var TestMiniViz = {};
	var $inner = null;

	TestMiniViz.initialize = function(EEXCESSObj){		
		// load CSS
		// load other needed scripts (require.js is available)
	};

	TestMiniViz.draw = function(data, from, to, $container){
		if (this.$inner == null){
			this.$inner = $('<div>Hallo</div>').css('background-color', 'lightgrey').css('margin-top', '10px').css('padding-top', '10px').css('padding-bottom', '10px');		
			$container.append(this.$inner);
		}

		this.$inner.html('Filter: ' + from + " - " + to);
	};

	TestMiniViz.finalize = function(){
	};
	
	PluginHandler.registerFilterVisualisation(TestMiniViz, {
		'displayName' : 'TestMini', 
		'type' : 'time', 
	});
})();
