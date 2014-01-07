var onReceiveData = function(processedData, items) {
    var term = "Loom";
    var width = 900;
    var height = 900;
    var scape = facetScape(d3.select("body").select("div#facetScape"), width, height, processedData, items, term);
}

// call EEXCESS plugin
requestPlugin(onReceiveData);