

var EEXCESS = EEXCESS || {};

var globals = {};
var visTemplate = new Visualization( EEXCESS );
visTemplate.init();


var onDataReceived = function(dataReceived, status) {
	
	console.log("Post to EEXCESS/Belgin server status: " + status);
	
	globals.mappingcombination = dataReceived[0].mapping;
	globals.groupedBy = dataReceived[0].groupedBy;
	globals.data = dataReceived[0].data;
	
	console.log(globals);

	var charts = getCharts( globals.mappingcombination );
	
	visTemplate.refresh( globals.data.query, globals.data.results.results, charts, globals.mappingcombination, globals.groupedBy );
};





// request data from Plugin
requestPlugin();


function requestPlugin() {

    var requestVisualizations = function(pluginResponse, action) {
        console.log(pluginResponse);
    	if((typeof pluginResponse == "undefined") || pluginResponse.results == null) {
            onDataReceived([], "no data available");
        }
        else {
            
        	var dataToSend = pluginResponse;//fixMissingAndMalformattedValues( pluginResponse );
            var host = "http://eexcess.know-center.tugraz.at/";
            var cmd = "getMappings";
            
            // Call server
            var post = $.post(host + "/viz", { cmd: cmd, dataset: JSON.stringify(dataToSend) });
            
            post
            	.done(function(reqData){
            		var data = JSON.parse(reqData);
            		onDataReceived(data, "success");
            	})
            	.fail(function(){
            		var dummy = new Dummy();
            		globals.keywords = dummy.keywords;
            		onDataReceived(dummy.data, "fail");
            	});
        }
    }

    	
    EEXCESS.messaging.callBG({method: {parent: 'model', func: 'getResults'},data: null}, function(reqResult) {
           requestVisualizations(reqResult, "load_visualization");
    });
    
    EEXCESS.messaging.listener(
    	function(request, sender, sendResponse) {
    		if (request.method === 'newSearchTriggered') {
    			console.log('data received from plugin');
   				requestVisualizations(request.data, "refresh_visualization");
   			}
   		}
    );

    
}



/**
 * ************************************************************************************************************************************************
 */




function getCharts(combinations){

	var charts = [];
	combinations.forEach(function(mc){
		if(charts.indexOf(mc.chartname) == -1)
			charts.push(mc.chartname);
	});
	
	return charts;
}
