

var EEXCESS = EEXCESS || {};

var globals = {};
var visTemplate = new Visualization( EEXCESS );
visTemplate.init();


var onDataReceived = function(dataReceived, status) {
	
	console.log(status);
	
    if(status == "no data available"){
        visTemplate.refresh("");
        return;
    }

	globals.mappingcombination = dataReceived[0].mapping;
	globals.groupedBy = dataReceived[0].groupedBy;
	globals.data = dataReceived[0].data;
	
	console.log(globals);

	var charts = getCharts( globals.mappingcombination );
	
	visTemplate.refresh( globals.data.results.results, globals.data.query, charts, globals.mappingcombination, globals.groupedBy );
};





// request data from Plugin
requestPlugin();


function requestPlugin() {

    var requestVisualizations = function(pluginResponse) {
    	if((typeof pluginResponse == "undefined") || pluginResponse.results == null) {
            onDataReceived([], "no data available");
        }
        else {
            
        	var dataToSend = deletedRdf(pluginResponse);
            var host = "http://eexcess.know-center.tugraz.at/";
            var cmd = "getMappings";

            // Call server
            var post = $.post(host + "/viz", { cmd: cmd, dataset: JSON.stringify(dataToSend) });
            
            post
            	.done(function(reqData){
            		var data = JSON.parse(reqData);
            		onDataReceived(data, "Post to EEXCESS/Belgin server status: success");
            	})
            	.fail(function(){
            		var dummy = new Dummy();
            		globals.keywords = dummy.keywords;
            		onDataReceived(dummy.data, "Post to EEXCESS/Belgin server status: fail");
            	});
        }
    }

    	
    // Set listener to receive new data when a new query is triggered
    EEXCESS.messaging.listener(
    	function(request, sender, sendResponse) {
    		if (request.method === 'newSearchTriggered') {
    			console.log('data received from plugin');
   				requestVisualizations(request.data);
   			}
   		}
    );

    
    // Retrieve current recommendations data
    EEXCESS.messaging.callBG({method: {parent: 'model', func: 'getResults'},data: null});

}



/**
 * ************************************************************************************************************************************************
 */


function deletedRdf(pluginResponse) {

    pluginResponse.results.results.forEach(function(d){
        delete d.rdf;
    });

    return pluginResponse;
}


function getCharts(combinations){

	var charts = [];
	combinations.forEach(function(mc){
		if(charts.indexOf(mc.chartname) == -1)
			charts.push(mc.chartname);
	});
	
	return charts;
}
