var onReceiveData = function(queryTerms, processedData, items) {
    var width = $(window).width()-30;
    var height = 500;
    var scape = facetScape(d3.select("body").select("div#facetScape"), width, height, processedData, items, queryTerms);
}

EEXCESS.messageListener(
    function(request, sender, sendResponse) {
        if (request.method === 'newSearchTriggered') {
            //requestPlugin(onReceiveData);
        }
    }
);

// get Data from Plugin
requestPlugin(onReceiveData);
