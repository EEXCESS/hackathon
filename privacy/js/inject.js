/******************************************************
*   This script add users's context to the database   *
******************************************************/


/*
*    This function create a string readable by elasticsearch in Json
*/

// sendDocumentContext
function collect_context(event) {
	console.log("Loaded");
    var documentContext = {
    	method: "documentContext",
    	url : window.location.protocol + window.location.hostname + window.location.pathname,
    	title : document.title,
    	event: event
    };
    
    console.log("Sending docContext");
	chrome.extension.sendRequest(documentContext, function(){});
	console.log("docContext sent.");
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.method == "getContext") {
	
		collect_context(request.event);
	}
});


function sendRequest(event) {
	
	var documentRequest = {
		method: "newRequest",
		event: event
	}
	
	chrome.extension.sendRequest(documentRequest, function(){});
}

/*
*    On each new page, this function saves the new context
*/
//chrome.tabs.onActivated.addListener(collect_context("focus"));
window.addEventListener("load",sendRequest("load"));
window.addEventListener("unload",sendRequest("unload"));

