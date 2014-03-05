/************************************************************************
*    Script to collect the traces kept about the user (only his data)   *
************************************************************************/

/*
* This function gets the user's data and put them into traces.html
*/

function parseUrl(url) {
	url = url.split(':')[1];
	host = url.split('/')[0];
	host = 'http://'+host;
	return(host);
}

function getDelay(begin, end, option){
	
	if (end == undefined) {
		end=begin;
	}
	
	begin = begin.split('Z')[0];
	end = end.split('Z')[0];
	
	var timeBegin = begin.split('T')[1];
	var dayBegin = begin.split('T')[0];
	var timeEnd = end.split('T')[1];
	var dayEnd = end.split('T')[0];
	
	var delayYear = dayEnd.split('-')[0]-dayBegin.split('-')[0];
	var delayMonth = dayEnd.split('-')[1]-dayBegin.split('-')[1];
	var delayDay = dayEnd.split('-')[2]-dayBegin.split('-')[2];
	
	var delayHour = timeEnd.split(':')[0]-timeBegin.split(':')[0];
	var delayMinute = timeEnd.split(':')[1]-timeBegin.split(':')[1];
	var delaySecond = timeEnd.split(':')[2]-timeBegin.split(':')[2];
	
	//alert(delayYear+ '-'+delayMonth+'-'+delayDay+'T'+delayHour+':'+delayMinute+':'+delaySecond);
	
	if (option == "string"){
		var result = "Time spent: "
		
		if (delayYear != 0) {
			result = result + delayYear + " year";
			}
		else if(delayMonth != 0){
			result = result + delayMonth + " month";
		}
		else if(delayDay != 0){
			result = result + delayDay + " day";
		}
		else if (delayHour != 0){
			if(delayHour ==1 && delayMinute <=10){
				result = result + (delayMinute+60) + " minutes";
			}
			else {
				result = result + delayHour + " hour";
				if (delayHour!=1) result= result +"s";
			}
		}
		else if (delayMinute !=0){
			if(delayMinute ==1 && delaySecond <=40){
				result = result + (delaySecond+60) + " seconds";
			}
			else {
				result = result + delayMinute + " minute";
				if (delayMinute!=1) result= result +"s";
			}
			
		}
		else {
			result = result + delaySecond + " second";
			if (delaySecond!=1) result= result +"s";
		}
		
		return result;
	}
	else{
		var result = delaySecond + 60*delayMinute + 60*60*delayHour + 3600*24*delayDay + 3600*24*30*delayMonth + 3600*24*30*365*delayYear;
		return result;
	}
}

function parseDate(date){
	if(date == undefined) {
		return('Error in date format');
	}
	else{
		date = date.split('Z')[0];  //remove the Z character
		var dateParts = date.split('T');
		var dayPart = dateParts[0];
		var timePart = dateParts[1];
		
		var daySplit = dayPart.split('-');
		var year = Number(daySplit[0]);
		var month = Number(daySplit[1]) - 1;
		var day = Number(daySplit[2]);
		
		var monthsTab = new Array("January","February","March","April","May","June","July","August","September","October","November","December");
		month = monthsTab[month];
		
		dateFormated = day + " " + month + " " + year + " at " + timePart;
		return(dateFormated);
	}
}

function traces(pluginId,userId) {  //user_id = plugin_id; email = user_id
	// a query is send to the proxy
	var url = localStorage["API_BASE_URI"]+"api/v0/user/traces";
	var method = 'POST';
	var async = false;
	var request = new XMLHttpRequest();
	
	var body = '';
	var userData = new Object();
	
	if(pluginId != '') {
		userData.pluginId = pluginId;
	}
	
	if(userId != '') {
		userData.userId = userId;
	}	
	userData.environnement = localStorage["env"];
	request.open(method, url, async);	
	request.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	request.send(JSON.stringify(userData));
	
	
	// useful data are collected from the response
	var traces = request.responseText;
	localStorage["traces"] = traces;
	var tracesJson = JSON.parse(traces);
	var sources = tracesJson["hits"].hits;
	var nbTraces = tracesJson["hits"].total;
	
	
	//  Add the datas as a list to traces.html
	$('#nbTraces').html(nbTraces + " traces dans l'historique");
	if(nbTraces>50) nbTraces = 50;                    // only the first 50 results are displayed
	
	for(var i=0;i<nbTraces;i++) {     
		var content = sources[i];
		var clone = $('#template').clone(true);
		
		clone.attr("id","templateCopy")
		clone.css("display","inherit");
		clone.appendTo('#list_trace');
		
		var beginDate = parseDate(content["_source"].temporal.begin);
		var endDate = parseDate(content["_source"].temporal.end);
		
		if(content["_source"].events.end == "active") {
			$(clone).find('.historyEnd').hide();
			$(clone).find('.tempImg2').hide();
			$(clone).find('.delay').hide();
		}
		
		$(clone).find('.historyEnd').html('('+endDate+')');
		$(clone).find('.delay').html(getDelay(content["_source"].temporal.begin,content["_source"].temporal.end,"string"));
		
		delaySec = getDelay(content["_source"].temporal.begin,content["_source"].temporal.end,"seconds");
		
		var baseRJ = 150;
		var baseG = 255;
		baseRJ = Math.round(baseRJ - 15*Math.log(delaySec+1));
		if(baseRJ < 0) baseRJ = 0;
		baseG = Math.round(baseG -15*Math.log(delaySec+1));
		if(baseG < 0) baseG = 0;
		
		colorRGB = "rgb("+baseRJ+","+baseG+","+baseRJ+")";
		heightRGB = Math.round(127.5-baseG/2+10);
		$(clone).find('.timebar').css("height",heightRGB);
		$(clone).find('.timebar').css("background",colorRGB);
		
		$(clone).find('.historyBegin').html('('+beginDate+')');
		
		var $title = content["_source"].document.title;
		if ($title.length > 75) $title = $title.substr(0,70)+"...";
		
		$(clone).find('.traces').html($title);
		$(clone).find('.traces').attr("href",content["_source"].document.url);
		$(clone).find('.host').html(parseUrl(content["_source"].document.url));
		
		if (content["_source"].events.begin == "focus") {
			$(clone).find('.tempImg1').attr("src","media/focus.png");
		}
		if (content["_source"].events.end == "blur") {
			$(clone).find('.tempImg2').attr("src","media/blur.png");
		}
		
		var parsedUrl = parseUrl(content["_source"].document.url);
		var faviconUrl = parsedUrl+"/favicon.ico";
		
		
		$(clone).find('.favicon').attr("src",faviconUrl);
		
		if (content["_source"].user.email != undefined){
			$(clone).find('.userEmail').html(content["_source"].user.email);
			var gravatar = "http://www.gravatar.com/avatar/"+MD5(content["_source"].user.email);
			$(clone).find('.userGravatar').attr('src',gravatar);
			$(clone).find('.userInformations').css("display","inline")
		}
		
		
		$(clone).find('.jsonDetail').JSONView(content["_source"]);

	}
}


/*
*    This function collect the user email from the localStorage (via background.js)
*    More informations may be collected later
*/

function doReloadTraces(){
	for(var i=0;i<50;i++){
		var id = "list"+i;
		$('#templateCopy').remove();
	}
	
	if($('#inputUserTraces').is(':checked')){
		if($('#inputPluginTraces').is(':checked')) {
			/*chrome.extension.sendRequest({method: "getLocalStorage", key: "uuid"}, function(response) {
				var uuidPlugin = response.data;
				chrome.extension.sendRequest({method: "getLocalStorage", key: "privacy_email"}, function(response) {
					traces(uuidPlugin,response.data);
 				 });
  			});*/
			if ( localStorage["user_id"] != undefined && localStorage["user_id"] != ''){
				traces(localStorage["uuid"],localStorage["user_id"]);
			}
			else{
				traces(localStorage["uuid"],'');
			}
			
		}
		else {
			/*chrome.extension.sendRequest({method: "getLocalStorage", key: "privacy_email"}, function(response) {
				traces('',response.data);
 			 });
 			 */
			
			if ( localStorage["user_id"]!=undefined && localStorage["user_id"]!=''){
				traces('',localStorage["user_id"]);
			}
			else{
				document.getElementById('nbTraces').innerHTML ="0 traces dans l'historique";
			}
		}
	}
	else {
		if($('#inputPluginTraces').is(':checked')) {
			/*chrome.extension.sendRequest({method: "getLocalStorage", key: "uuid"}, function(response) {
				traces(response.data,'');
  			});
  			*/
			traces(localStorage["uuid"],'');
		}
		else {
			//traces('','');
			document.getElementById('nbTraces').innerHTML ="0 traces dans l'historique";
 		}
		
	}
		
}


function doToggleDetails() {
	var d = $(this).closest('.details').find('.jsonDetail');
	d.toggle("drop");
	if ($(this).closest('.details').find('.menuArrow').css("-webkit-transform") != "none"){
		$(this).closest('.details').find('.menuArrow').css("-webkit-transform","none");
	}
	else {
		$(this).closest('.details').find('.menuArrow').css("-webkit-transform","rotate(90deg)");
	}
	/*if(d.is(":visible")) {
		d.effect("drop","down");
	} else {
		d.toggle("drop");	
	}*/
}

$('#inputUserTraces').live("change",doReloadTraces);
$('#inputPluginTraces').live("change",doReloadTraces);
$('.detailHandle').live("click",doToggleDetails);


$(document).ready(function () {
	
	var docUrl = $(document)[0].URL;
	var pluginUrl = docUrl.split('/')[0]+"//"+docUrl.split('/')[2]+'/'+docUrl.split('/')[3]+'/';
	
	$('.tabProfile').live("click",function(){document.location = pluginUrl+"profile.html"});
	$('.tabSettings').live("click",function(){document.location = pluginUrl+"policy.html"});
	$('.tabPluginSettings').live("click",function(){document.location = pluginUrl+"settings.html"});
	//********************************
	if (localStorage["env"] == "work"){
		$("#workButton").addClass("active");
	}
	else{
		$("#homeButton").addClass("active");
	}

	$("#workButton").on("click",function(){localStorage["env"]="work"; document.location.reload(true);});
	$("#homeButton").on("click",function(){localStorage["env"]="home"; document.location.reload(true);});
	
	traces(localStorage["uuid"],localStorage["user_id"]);
});
