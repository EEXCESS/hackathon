var onReceiveData = function(queryTerms, processedData, items) {
    var term = "Loom";
    var width = $(window).width()-40;//900;
    var height = $(window).height()-90;
    var scape = facetScape(d3.select("body").select("div#facetScape"), width, height, processedData, items, queryTerms);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.method === 'newSearchTriggered') {
            //requestPlugin(onReceiveData);
        }
    }
);

// get Data from Plugin
requestPlugin(onReceiveData);