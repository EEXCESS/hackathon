var onReceiveData = function(queryTerms, processedData, items) {
    var width = $(window).width();
    var height = $(window).height();
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