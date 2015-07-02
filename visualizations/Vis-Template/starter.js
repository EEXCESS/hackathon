

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
        
    globals["mappingcombination"] = getMappings();//dataReceived[0].mapping;
    globals["query"] = dataReceived.query;
    globals["charts"] = getCharts(globals.mappingcombination);
    console.log('Globals:');
    console.log(globals);

    globals["data"] = dataReceived.results.results;
    if (determineDataFormatVersion(dataReceived.results.results) == "v2"){
        loadDetails(dataReceived.results.results, function(mergedData){ 
            globals["data"] = mapRecommenderV1toV2(mergedData);
            visTemplate.refresh(globals);
        });
    } else {
        visTemplate.refresh(globals);
    }
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
 
 function determineDataFormatVersion(data){
     if (data == null || data.length == 0)
        return null;
        
     if (data[0].documentBadge)
        return "v2";
        
     return "v1";
 }
 
 function mapRecommenderV1toV2(v2data){
    // V1 Format:
    // {
    //     "id": "/09213/EUS_215E6E9754504544B88CEC4C120A18F8",
    //     "title": "Prague's water towersPražské vodní věže",
    //     "previewImage": "http://europeanastatic.eu",
    //     "uri": "http://europeana.eu/resolve/record/09213/EUS_215E6E9754504544B88CEC4C120A18F8",
    //     "eexcessURI": "http://europeana.eu/api/405rd",
    //     "collectionName": "09213_Ag_EU_EUscreen_Czech_Televison",
    //     "facets": {
    //         "provider": "Europeana",
    //         "type": "unkown",
    //         "language": "cs",
    //         "year": "2001",
    //         "license": "http://www.europeana.eu/rights/rr-f/"
    //     },
    //     "bookmarked": false,
    //     "provider-icon": "../../media/icons/Europeana-favicon.ico",
    //     "coordinate": [
    //         50.0596696,
    //         14.4656239
    //     ]
    // }
    
    // V2 Overview-Format: 
    // {
    //     "resultGroup": [
    //         {
    //             "resultGroup": [],
    //             "documentBadge": {
    //                 "id": "10010306208",
    //                 "uri": "http://www.econbiz.de/Record/10010306208",
    //                 "provider": "ZBW"
    //             },
    //             "mediaType": "unknown",
    //             "title": "Institutional change of the agricultural administration and rural associations in East Germany before and after unification",
    //             "description": "Der Zusammenbruch des sozialistischenng.",
    //             "date": "2011",
    //             "language": "de",
    //             "licence": "restricted"
    //         }
    //     ],
    //     "documentBadge": {
    //         "id": "10009278214",
    //         "uri": "http://www.econbiz.de/Record/10009278214",
    //         "provider": "ZBW"
    //     },
    //     "mediaType": "unknown",
    //     "title": "Institutional change of the agricultural administration and rural associations in East Germany before and after unification",
    //     "description": "Der Zusammenbruch des sozialistischen Regimes Ende 1989 sowie der immer ...Ostdeutschland während der ersten Jahre nach der Vereinigung.",
    //     "date": "2011",
    //     "language": "de",
    //     "licence": "restricted"
    // }
    
     // V2 Details:
    // {
    //     "eexcessProxy": {
    //         "edmlanguage": {
    //             "xmlnsedm": "http://www.europeana.eu/schemas/edm/",
    //             "content": "fr"
    //         },
    //         "dctitle": {
    //             "content": 1998,
    //             "xmlnsdc": "http://purl.org/dc/elements/1.1/"
    //         },
    //         "edmeuropeanaProxy": {
    //             "xmlnsedm": "http://www.europeana.eu/schemas/edm/",
    //             "content": false
    //         },
    //         "edmconcept": [
    //             {
    //                 "xmlnsedm": "http://www.europeana.eu/schemas/edm/",
    //                 "content": "film"
    //             },
    //             {
    //                 "xmlnsedm": "http://www.europeana.eu/schemas/edm/",
    //                 "content": "documentary film"
    //             }
    //         ],
    //         "xmlnseexcess": "http://eexcess.eu/schema/",
    //         "dcidentifier": {
    //             "content": "/04802/0C20B49D6C149705C27D255DC5666F27E46FE377",
    //             "xmlnsdc": "http://purl.org/dc/elements/1.1/"
    //         }
    //     }
    // }
       
    
    var v1data = [];
    for (var i=0; i<v2data.length; i++){
        var v2DataItem = v2data[i];
        var v1DataItem = {
            "id": v2DataItem.documentBadge.id,
            "title": v2DataItem.title,
            "description": v2DataItem.description,
            "previewImage": v2DataItem.previewImage,
            "uri": v2DataItem.documentBadge.uri,
            "eexcessURI": "", //"http://europeana.eu/api/405rd",
            "collectionName": "", // "09213_Ag_EU_EUscreen_Czech_Televison",
            "facets": {
                "provider": v2DataItem.documentBadge.provider,
                "type": v2DataItem.mediaType,
                "language": v2DataItem.language,
                "year": v2DataItem.date,
                "license": v2DataItem.licence
            },
            "detailsV2": v2DataItem.details,
            "bookmarked": false,
            "provider-icon": "", //"../../media/icons/Europeana-favicon.ico",
            "coordinate": null //[50.0596696, 14.4656239]
        };
        
        if (v2DataItem.details && v2DataItem.details.eexcessProxy && v2DataItem.details.eexcessProxy.wgs84lat)
            v1DataItem.coordinate = [v2DataItem.details.eexcessProxy.wgs84lat, v2DataItem.details.eexcessProxy.wgs84long];
            
        v1data.push(v1DataItem);
    }
    
    return v1data;
 }
 
 function loadDetails(data, callback){
    // Detail Call:
    // {
    //     "documentBadge": [
    //         {
    //             "id": "E1.6882",
    //             "uri": "http://www.kim.bl.openinteractive.ch/sammlungen#f19e71ca-4dc6-48b8-858c-60a1710066f0",
    //             "provider": "KIM.Portal"
    //         }
    // }

    var detailCallBadges = _.map(data, 'documentBadge');

    var detailscall = $.ajax({
        async: false,
        url: 'http://eexcess-dev.joanneum.at/eexcess-privacy-proxy-1.0-SNAPSHOT/api/v1/getDetails',
        data: JSON.stringify({ "documentBadge" : detailCallBadges }),
        type: 'POST',
        contentType: 'application/json; charset=UTF-8',
        dataType: 'json'
    });
    detailscall.done(function(detailData) {
        var mergedData = mergeOverviewAndDetailData(detailData, data);
        callback(mergedData);
    });
    detailscall.fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Error while calling details');
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
        if(textStatus !== 'abort') {
            console.error(textStatus);
        }
    });
 }
 
 function mergeOverviewAndDetailData(detailData, data){
    for (var i=0; i<detailData.documentBadge.length; i++){
        var detailDataItem = detailData.documentBadge[i];
        var details = JSON.parse(detailDataItem.detail);
        var originalItem = _.find(data, function(dataItem){ return dataItem.documentBadge.id == detailDataItem.id; })
        originalItem.details = details;
    }
    
    return data;
 }


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
        },
    	{
            "chart" : "urank",
            "combinations": [
                [
                    {"facet": "language", "visualattribute": "color"}
                ],
                [
                    {"facet": "provider", "visualattribute": "color"}
                ]
            ]
        },
        {
            "chart" : "landscape",
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

    for(var i=0; i<visTemplate.plugins.length; i++){
        var plugin = visTemplate.plugins[i];
        mappings.push({
            "chart": plugin.displayName,
            "combinations": plugin.mappingCombinations
        });
    }

    return mappings;

}



function getDemoResultsUniversity(){

    var demoDataReceived = {
        results:{
            results: demoDataUniversity
        },
        query:"University Campus"
    };
    return demoDataReceived;
}


function getDemoResultsHistoricBuildings(){

    var demoDataReceived = {
        results:{
            results: demoDataHistoricalBuildings
        },
        query:"Historical Buildings"
    };
    return demoDataReceived;
}