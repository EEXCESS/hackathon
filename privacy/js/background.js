/***************************************************************
*     Background script to access to localStorage at anytime   *
***************************************************************/
var version = "1.00";
console.log("EEXCESS privacy plugin version "+version);
if ( localStorage["API_BASE_URI"]==undefined){
	localStorage["API_BASE_URI"] = "http://localhost:8080/privacy-proxy/";
}

/////////////////////////////////////////////////////// global variables


//active tab's id
var activeTabId = 0;

//Environnement init
if (localStorage["env"]==undefined){
	localStorage["env"] = "home";
}


// plugin's unique id
var uuidUser = localStorage["uuid"];

// traces's unique elasticsearch id (used for updating them)
var arrayTraceID = new Array();


if (uuidUser == undefined) {
	uuidUser = randomUUID();
	localStorage["uuid"] = uuidUser;
}




// Event trigered when the window's active tab changes
chrome.tabs.onActivated.addListener(function(info) {

	//alert(info.tabId);

	if (activeTabId){                  //
		//alert(activeTabId);
		updateContext(activeTabId, "blur");    //
		}

	activeTabId = info.tabId;
	//alert('new:'+activeTabId);
	if (activeTabId){
		//triggerContext( activeTabId);	
		triggerContext(activeTabId,"focus");	
	}
});

// event trigered when the tab is being closed
chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
	if ( arrayTraceID[tabId] != undefined ){
		triggerContext(tabId, "unload");
	}
	
});







/**
 * Create and return a "version 4" RFC-4122 UUID string.
 */
 
function randomUUID() {
  var s = [], itoh = '0123456789ABCDEF';
 
  // Make array of random hex digits. The UUID only has 32 digits in it, but we
  // allocate an extra items to make room for the '-'s we'll be inserting.
  for (var i = 0; i < 36; i++) s[i] = Math.floor(Math.random()*0x10);
 
  // Conform to RFC-4122, section 4.4
  s[14] = 4;  // Set 4 high bits of time_high field to version
  s[19] = (s[19] & 0x3) | 0x8;  // Specify 2 high bits of clock sequence
 
  // Convert to hex chars
  for (var i = 0; i < 36; i++) s[i] = itoh[s[i]];
 
  // Insert '-'s
  s[8] = s[13] = s[18] = s[23] = '-';
 
  return s.join('');
}




chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
	console.log("processing brower request");
    if (request.method == "getLocalStorage") {
      sendResponse({data: localStorage[request.key]});
    }else if (request.method == "documentContext") {
    	get_geolocation_context(request.event, sender.tab.id, request);
    }else if (request.method == "newRequest") {
    	if (request.event == "load") {
    		triggerContext(sender.tab.id,"load");
    	}
    	else if (request.event == "unload"){
    		updateContext(sender.tab.id,"unload");
    	}
    }
    else if ( request.method ="updateRecommendation"){
    	updateRecommendations();
    }
    else {  
      sendResponse({});
    }
});


/*
*    This function collect the date at this format: YYYY-MM-DDTHH:mmZ (ISO_8601)
*/

function date_heure()
{
        date = new Date();
        year = date.getFullYear();
        month = date.getMonth()+1;
        if(month<10)
        {
                month = "0"+month;
        }
        day = date.getDate();
        if(day<10)
        {
                day = "0"+day;
        }
        hour = date.getHours();
        if(hour<10)
        {
                hour = "0"+hour;
        }
        minute = date.getMinutes();
        if(minute<10)
        {
                minute = "0"+minute;
        }
        second = date.getSeconds();
        if(second<10)
        {
                second = "0"+second;
        }
        result = year + '-' + month +'-'+day+'T'+hour+':'+minute+':'+second+'Z';
        return result;
}


/*
*  This function makes the Json (string format) and send it to the proxy
*/



function triggerContext(tabId,event) {
	var requestContext = {
		method: "getContext",
		event: event
	}

	chrome.tabs.sendMessage(tabId, requestContext, function(){});  //asks for a tab to send the page's context
}
	
function get_geolocation_context(event,id,request){
	var lastUpdate = localStorage["geolocationDate"];
	var d = new Date();
	var n = d.getTime();
	if((lastUpdate == undefined) || (n-lastUpdate > 3600000)){
		localStorage["geolocationDate"] = n;
		navigator.geolocation.getCurrentPosition(function(position){
	        var latitude = position.coords.latitude;
	        var longitude = position.coords.longitude;
	        
	        url = "http://api.geonames.org/findNearbyPostalCodesJSON?lat="+latitude+"&lng=" + longitude +"&username=eexcess.insa";

	    	$.ajax({
	    	   url: url,
	    	   type: "GET",
	    	   contentType: "text/json;charset=UTF-8",
	    	   success: function(response) {
	    		   
	    		   coord = "lat="+latitude+",lng="+longitude;
	    		   var geolocation = {
	    				country:response.postalCodes[0].countryCode,
	    				region:response.postalCodes[0].adminName1,
	    		   		district: response.postalCodes[0].adminName3,
	    		   		place: response.postalCodes[0].placeName,
	    		   		coord: coord
	    		   }
	    		   
	    		   localStorage["geolocation"] = JSON.stringify(geolocation);
	    		   send_context(event,id,request);
	    	   }
	    	});
	    });
	}
	else{
		send_context(event,id,request);
	}
}

function send_context(event, tabID, context){
	
	console.log("Putting document context");
	console.log("tabID: " +tabID);
	var date = date_heure();
	var geolocation = JSON.parse(localStorage["geolocation"]);
	var trace = {
		user: {
			user_id: localStorage["user_id"],
			environnement: localStorage["env"]
		},
		plugin: {
			version: version,
			uuid: localStorage["uuid"]
		},
		temporal: {
			begin: date
		},
		events: {
			begin: event,
			end: "active"
		},
		document: {
			url: context.url,
			title: context.title
		},
		geolocation: geolocation
	};
	
	var traceJSON = JSON.stringify(trace);
	console.log("Context: "+traceJSON);
	
	$.ajax({
	   url: localStorage["API_BASE_URI"]+"api/v0/privacy/trace",
	   type: "POST",
	   contentType: "application/json;charset=UTF-8",
	   data: traceJSON,
	   complete: function(response){
	   		var responseJSON = JSON.parse(response.responseText);
	   		trace["id"]
	   		 = responseJSON["_id"];
			arrayTraceID[tabID] = trace;
			recommend(traceJSON);
	   }
	});
}

/*
 * This function is used to update the recommendations based on the last trace corresponding to the curent environnement
 */
function updateRecommendations(){
	// the traces stored in localstorage are reloaded
	// the traces loaded are those corresponding to the user's (if set) + the plugin's (both checkbox enabeled on the trace page)
	var url = localStorage["API_BASE_URI"]+"api/v0/user/traces";
	var method = 'POST';
	var async = false;
	var request = new XMLHttpRequest();
	
	var body = '';
	var userData = new Object();
	
	userData.pluginId = localStorage["uuid"];
	
	if(localStorage["user_id"]!=undefined && localStorage["user_id"]!="") {
		userData.userId = localStorage["user_id"];
	}	
	userData.environnement = localStorage["env"];
	request.open(method, url, async);	
	request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	request.send(JSON.stringify(userData));

	var traces = request.responseText;
	localStorage["traces"] = traces;
	
	tracesJson = JSON.parse(traces);
	var traceToSend = tracesJson["hits"]["hits"][0];
	recommend(JSON.stringify(traceToSend));
}

function recommend(traces){
	localStorage.removeItem("recommend");
	$.ajax({
	   url: localStorage["API_BASE_URI"]+"api/v0/recommend/fetch",
	   type: "POST",
	   contentType: "application/json;charset=UTF-8",
	   data: traces,
	   complete: function(response, status){
	   
			var xml = $(response.responseText);
			var hitCount = $(xml).attr("data-hits");
			localStorage["recommend"] = response.responseText;
			
			if (hitCount != 0) {
				chrome.browserAction.setBadgeText({text: hitCount});
			}
			//localStorage["recommendation_query"] = response.getResponseHeader('recommendation_query');
			
			
	   }
	});
	
	$.ajax({
		   url: localStorage["API_BASE_URI"]+"api/v0/recommend/rewrite",
		   type: "POST",
		   contentType: "application/json;charset=UTF-8",
		   data: traces,
		   complete: function(response, status){

				localStorage["recommendation_query"] = response.responseText;
				
				
		   }
		});
	
}

function updateContext(tabID, evnt) {
	console.log("Putting document context");
	var date = date_heure();
	var trace = arrayTraceID[tabID];
	if (trace != undefined) {
		console.log("tabID (update): " +tabID);
		console.log(trace);
		var headerTraceID = trace.id;
		delete(trace.id);
		
		trace.temporal.end = date_heure();
		trace.events.end = evnt;
		
		var traceJSON = JSON.stringify(trace);
		console.log("Context: "+traceJSON);
		$.ajax({
		   url: localStorage["API_BASE_URI"]+"api/v0/privacy/trace",
		   type: "POST",
		   contentType: "application/json;charset=UTF-8",
		   data: traceJSON,
		   headers:{"traceId": headerTraceID},
		   success: function(response) {
				console.log("Response: "+response);	
		   }
		});
	}
}