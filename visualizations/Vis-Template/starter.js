

var EEXCESS = EEXCESS || {};

var globals = {};
var visTemplate = new Visualization( EEXCESS );
visTemplate.init();


var onDataReceived = function(dataReceived, status) {

    console.log(status);

    if(status == "no data available"){
        visTemplate.refresh();
        return;
    }

    globals["data"] = dataReceived.results.results;
    globals["mappingcombination"] = getMappings();//dataReceived[0].mapping;
    globals["query"] = dataReceived.query;
    globals["charts"] = getCharts(globals.mappingcombination);

    console.log(globals);
    visTemplate.refresh(globals);
};





// request data from Plugin
requestPlugin();


function requestPlugin() {

    var requestVisualization = function(pluginResponse) {
        if((typeof pluginResponse == "undefined") || pluginResponse.results == null) {

            /*  TO USE DUMMY DATA UNCOMMENT THE NEXT 2 LINES AND COMMENT THE NEXT ONE*/
            var dummy = new Dummy();
            onDataReceived(dummy.data.data, "No data received. Using dummy data");

            //onDataReceived([], "no data available");
        }
        else {
            onDataReceived(deletedRdf(pluginResponse), "Data requested successfully");
            /*      CALL TO EEXCESS/Belgin SERVER
             var dataToSend = deletedRdf(pluginResponse);
             var host = "http://eexcess.know-center.tugraz.at/";
             var cmd = "getMappings";

             // Call server
             var post = $.post(host + "/viz", { cmd: cmd, dataset: JSON.stringify(dataToSend) });

             post
             .done(function(reqData){
             var data = JSON.parse(reqData);
             //console.log(JSON.stringify(data));
             onDataReceived(data, "Post to EEXCESS/Belgin server status: success");
             })
             .fail(function(){
             var dummy = new Dummy();
             globals.keywords = dummy.keywords;
             onDataReceived(dummy.data, "Post to EEXCESS/Belgin server status: fail");
             });
             */
        }
    };


    // Set listener to receive new data when a new query is triggered
    EEXCESS.messaging.listener(
        function(request, sender, sendResponse) {

            console.log(request.method);
            if (request.method === 'newSearchTriggered') {
                console.log('data received from plugin');
                requestVisualization(request.data);
            }
        }
    );


    // Retrieve current recommendations data
    EEXCESS.messaging.callBG({method: {parent: 'model', func: 'getResults'},data: null}, function(reqResult) {
        console.log("first call for results");
        console.log(reqResult);
        requestVisualization(reqResult);
    });

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
    /*  FORMAT OF MAPPING COMBINATIONS RETRIEVED FROM EEXCESS/Belgin
     combinations.forEach(function(mc){
     if(charts.indexOf(mc.chartname) == -1)
     charts.push(mc.chartname);
     });
     */

    combinations.forEach(function(c){
        charts.push(c.chart);
    });

    return charts;
}


function getMappings(){

    var mappings = [
        {
            "chart" : "timeline",
            "combinations": [
                [
                    {"facet": "year", "visualattribute": "x-axis"},
                    {"facet": "provider", "visualattribute": "y-axis"},
                    {"facet": "language", "visualattribute": "color"}
                ],
                [
                    {"facet": "year", "visualattribute": "x-axis"},
                    {"facet": "language", "visualattribute": "y-axis"},
                    {"facet": "provider", "visualattribute": "color"}
                ]
            ]
        },
        {
            "chart" : "barchart",
            "combinations": [
                [
                    {"facet": "language", "visualattribute": "x-axis"},
                    {"facet": "count", "visualattribute": "y-axis"},
                    {"facet": "language", "visualattribute": "color"}
                ],
                [
                    {"facet": "provider", "visualattribute": "x-axis"},
                    {"facet": "count", "visualattribute": "y-axis"},
                    {"facet": "provider", "visualattribute": "color"}
                ]
            ]
        },
        {
            "chart" : "geochart",
            "combinations": [
                [
                    {"facet": "language", "visualattribute": "color"}
                ],
                [
                    {"facet": "provider", "visualattribute": "color"}
                ]
            ]
        }
    ];

    return mappings;

}
