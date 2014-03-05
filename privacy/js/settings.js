var birthdateTooltips= {};
var addressTooltips= {};
var geolocTooltips= {};
var tracesTooltips= ["Only the current page will be sent","Your account traces on this computer will be sent","Your account traces on all computers will be sent"];
var lastTrace = {};

function updateUserInfo(){
	userDataJSON = JSON.stringify(userInfo);
	$.ajax({
		   url: localStorage["API_BASE_URI"]+"api/v0/user/privacy_settings",
		   type: "POST",
		   contentType: "application/json;charset=UTF-8",
		   data: userDataJSON,
		   beforeSend: function (request)
	       {
	           request.setRequestHeader("traceid", idUser);
	       },
		   complete: function(response) {
			   $('.stateSettings').html("Changes saved");
		   }
		});
}

function doSimplePolicyToggle(fieldName) {
	var elQuery = "#" + fieldName + "Setting";
	var policyKey = "privacy.policy."+fieldName;
	var profileKey = "privacy.profile."+fieldName;
	
	if($(elQuery).attr("class") == "todo-done"){
		localStorage[policyKey] = "1";
		$("#list_settings").find(".email").html("Email: " + localStorage["privacy.profile.email"]);
	} else{
		localStorage[policyKey] = "0";
		$("#list_settings").find(".email").html("Email: nothing");
	}
}

function doSwitchEmail() {
	if($("#emailSetting").attr("class") == "todo-done"){
		localStorage["privacy.policy.email"] = "1";
		$("#list_settings").find(".email").html("Email: " + localStorage["privacy.profile.email"]);
	}
	else{
		localStorage["privacy.policy.email"] = "0";
		$("#list_settings").find(".email").html("Email: nothing");
	}
	updateRecommendation(initSandBox);
}

function doSwitchGender() {
	
	if($("#genderSetting").attr("class") == "todo-done"){
		$("#titleSetting").show();
		$("#titleSetting").addClass("todo-done");
		localStorage["privacy.policy.gender"] = "1";
		$("#list_settings").find(".gender").html("Gender: " + localStorage["privacy.profile.gender"]);
	}
	else{
		$("#titleSetting").hide();
		localStorage["privacy.policy.gender"] = "0";
		$("#list_settings").find(".gender").html("Gender: nothing");
		$("#titleSetting").removeClass("todo-done");
		localStorage["privacy.policy.title"] = "0";
		$("#list_settings").find(".title").html("Title: nothing");
	}
	updateRecommendation(initSandBox);
}

function doSwitchTitle() {
	if($("#titleSetting").attr("class") == "todo-done"){
		userInfo["privacy"]["title"] = "1";
		$("#list_settings").find(".title").html("Title: "+userInfo.title);
	}
	else{
		userInfo["privacy"]["title"] = "0";
		$("#list_settings").find(".title").html("Title: nothing");
		
	}
	updateRecommendation(initSandBox);
}

function triggerUpdateGeoloc() {
	
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
    		   $(".geoloc span").html("Geolocation: Latitude "+latitude+" , Longitude "+longitude);
    		   doUpdateGeoloc(response,coord);
    	   }
    	});
    });
}

function doUpdateGeoloc(geoname,coord){
	
	//if((userInfo. == undefined) || (userInfo.birthdate == "")) $('#ageSetting').hide();
	
	geolocTooltips[0] = "nothing";
	geolocTooltips[1] = geoname.postalCodes[0].countryCode;
	geolocTooltips[2] = geoname.postalCodes[0].adminName1;
	geolocTooltips[3] = geoname.postalCodes[0].adminName3;
	geolocTooltips[4] = geoname.postalCodes[0].placeName;
	geolocTooltips[5] = coord;
	
	settingSlider("Geoloc", 5, geolocTooltips,userInfo.privacy.geoloc);
}

function triggerUpdateAddress(){
	
	
	if((userInfo.address == undefined) || (userInfo.address.street == "")) {
		$('#addressSetting').hide();
	}
	else{
		doUpdateAddress();
	}
}

function doUpdateAddress(){
	
	addressTooltips[0] = "nothing";
	addressTooltips[1] = JSON.parse(privacy.apply("address",JSON.stringify(userInfo.address),1)).country;
	addressTooltips[2] = JSON.parse(privacy.apply("address",JSON.stringify(userInfo.address),2)).region;
	addressTooltips[3] = JSON.parse(privacy.apply("address",JSON.stringify(userInfo.address),3)).district;
	addressTooltips[4] = JSON.parse(privacy.apply("address",JSON.stringify(userInfo.address),4)).city;
	
	var address = JSON.parse(privacy.apply("address",JSON.stringify(userInfo.address),5));
	addressTooltips[5] = userInfo.address.street+", "+userInfo.address.postalcode+" "+userInfo.address.city+", "+userInfo.address.country;
	
	settingSlider("Address", 5, addressTooltips,userInfo.privacy.address);
}


function initializeSettingsDisplay(){
	if(userInfo.privacy == undefined ){
		userInfo.privacy={};
	}
	if ( userInfo.privacy.email == undefined || userInfo.privacy.email == "" ||  userInfo.privacy.email == "1" ){
		userInfo.privacy.email = "1" ;
		$("#emailSetting").find(".switch-animate").removeClass("switch-off");
		$("#emailSetting").find(".switch-animate").addClass("switch-on");
		$("#list_settings").find(".email span").html(userInfo.email);
	}
	else if(  userInfo.privacy.email == "0" ){
		$("#emailSetting").find(".switch-animate").removeClass("switch-on");
		$("#emailSetting").find(".switch-animate").addClass("switch-off");
		$("#list_settings").find(".email span").html("nothing");
	}
	if ( userInfo.privacy.gender == undefined || userInfo.privacy.gender == "" || userInfo.privacy.gender == "1" ){
		userInfo.privacy.gender = "1" ;
		$("#genderSetting").find(".switch-animate").removeClass("switch-off");
		$("#genderSetting").find(".switch-animate").addClass("switch-on");
		$("#list_settings").find(".gender span").html(userInfo.gender);
		$("#titleSetting").show();
	}
	else if(  userInfo.privacy.gender == "0" ){
		$("#genderSetting").find(".switch-animate").removeClass("switch-on");
		$("#genderSetting").find(".switch-animate").addClass("switch-off");
		$("#titleSetting").hide();
		$("#list_settings").find(".gender span").html("nothing");
		$("#titlePrivacy").attr("checked","false");
	}
	if ( userInfo.privacy.title == undefined || userInfo.privacy.title == "" ||  userInfo.privacy.title == "1" ){
		userInfo.privacy.title = "1" ;
		$("#titleSetting").find(".switch-animate").removeClass("switch-off");
		$("#titleSetting").find(".switch-animate").addClass("switch-on");
		$("#list_settings").find(".title span").html(userInfo.title);
	}
	else if(  userInfo.privacy.title == "0" ){
		$("#titleSetting").find(".switch-animate").removeClass("switch-on");
		$("#titleSetting").find(".switch-animate").addClass("switch-off");
		$("#list_settings").find(".title span").html("nothing");
	}
	if ( userInfo.privacy.birthdate == undefined || userInfo.privacy.birthdate == ""){
		userInfo.privacy.birthdate = "0" ;
	}
	if ( userInfo.privacy.address == undefined || userInfo.privacy.address == ""){
		userInfo.privacy.address = "0" ;
	}	
	if ( userInfo.privacy.geoloc == undefined || userInfo.privacy.geoloc == ""){
		userInfo.privacy.geoloc = "0" ;
	}	
	if ( userInfo.privacy.traces == undefined || userInfo.privacy.traces == ""){
		userInfo.privacy.traces = "0" ;
	}	
	
	if(userInfo.title == undefined || userInfo.title == "") $("#titleSetting").hide();
	
	if((userInfo.gender != undefined) && (userInfo.gender != "")) {
		$('#genderSetting').show();
	}
	if((userInfo.title != undefined) && (userInfo.title != "") && (userInfo.gender == 1)) {
		$('#titleSetting').show();
	}
	
	
	//endInit();
}
	
function doUpdateAge(){
	
	if((userInfo.birthdate == undefined) || (userInfo.birthdate == "")) {
		$('#ageSetting').hide();
	}
	else{
		var indication = "What will be send: ";
		
		birthdateTooltips[0] = "nothing";
		birthdateTooltips[1] = JSON.parse(privacy.apply("birthdate",userInfo.birthdate,1)).decade;
		birthdateTooltips[2] = JSON.parse(privacy.apply("birthdate",userInfo.birthdate,2)).age;
		birthdateTooltips[3] = JSON.parse(privacy.apply("birthdate",userInfo.birthdate,3)).date;

		
		settingSlider("Birthdate", 3, birthdateTooltips,userInfo.privacy.birthdate);
	}	
}

function initSettings(){
	triggerUpdateAddress();
	doUpdateAge();
	triggerUpdateGeoloc();
	initializeSettingsDisplay();
	settingSlider("Traces", 2, tracesTooltips,userInfo.privacy.traces);
	lastTrace = JSON.parse(localStorage["traces"]).hits.hits[0]["_source"];
	
	initSliderUser();
}

function tracesHoverIn(){
	if ($(this).find(".tooltip-inner").html() == "undefined"){
		$(this).find(".tooltip-inner").html(tracesTooltips[parseInt(userInfo.privacy.traces)]);
	}
	$(this).find(".slider-tip").show();
}

function tracesHoverOut(){
	$(this).find(".slider-tip").hide();
}

function geolocHoverIn(){
	if ($(this).find(".tooltip-inner").html() == "undefined"){
		$(this).find(".tooltip-inner").html(geolocTooltips[parseInt(userInfo.privacy.geoloc)]);
	}
	$(this).find(".slider-tip").show();
}

function geolocHoverOut(){
	$(this).find(".slider-tip").hide();
}


function addressHoverIn(){
	if ($(this).find(".tooltip-inner").html() == "undefined"){
		$(this).find(".tooltip-inner").html(addressTooltips[parseInt(userInfo.privacy.address)]);
	}
	$(this).find(".slider-tip").show();
}

function addressHoverOut(){
	$(this).find(".slider-tip").hide();
}

function ageHoverIn(){
	if ($(this).find(".tooltip-inner").html() == "undefined"){
		$(this).find(".tooltip-inner").html(privacy.apply("birthdate",userInfo.birthdate,parseInt(userInfo.privacy.birthdate)));
	}
	$(this).find(".slider-tip").show();
}

function ageHoverOut(){
	$(this).find(".slider-tip").hide();
}

function hoverIn(){
	$(this).find(".slider-tip").show();
}

function hoverOut(){
	$(this).find(".slider-tip").hide();
}


	//updateRecommendation (JSON.parse(localStorage["traces"]).hits.hits[0]["_source"]);

function updateRecommendation(callback, trace){
	if ( trace == undefined ){
		trace = lastTrace;
	}
	var traces = JSON.stringify(trace);
	$('.loader').attr("src","media/ajax-loader.gif")
	
	userDataJSON = JSON.stringify(userInfo);
	$.ajax({
		   url: localStorage["API_BASE_URI"]+"api/v0/user/privacy_settings",
		   type: "POST",
		   contentType: "application/json;charset=UTF-8",
		   data: userDataJSON,
		   beforeSend: function (request)
	       {
	           request.setRequestHeader("traceid", idUser);
	       },
		   complete: function(response) {
			   
			   $.ajax({
				   url: localStorage["API_BASE_URI"]+"api/v0/recommend/fetch",
				   type: "POST",
				   contentType: "application/json;charset=UTF-8",
				   data: traces,
				   complete: function(response, status){
				   
						var xml = response.responseText;
						$("#results").html(xml);
						
						$('.loader').attr("src","flat_ui/images/todo/done.png");
						localStorage["recommend"] = xml;
						var hitCount = $(xml).attr("data-hits");
						
						$.ajax({
							   url: localStorage["API_BASE_URI"]+"api/v0/recommend/rewrite",
							   type: "POST",
							   contentType: "application/json;charset=UTF-8",
							   data: JSON.stringify(trace),
							   complete: function(response, status){

									localStorage["recommendation_query"] = response.responseText;
									callback();
									
									
							   }
							});
						
				   }
				});
		   }
	});
}

function settingSlider(field, max, tooltips, privacy){
	
	$("#slider"+field).find(".slider-tip").html(tooltips[parseInt(privacy)]);
	
	$("#slider"+field).slider({
		value:parseInt(privacy),
		min: 0,
		max: max,
		step: 1,
		create:function(){
			$("#full"+field).html(tooltips[max]);
			$("#list_settings").find("."+field.toLowerCase()+" span").html(tooltips[parseInt(privacy)]);
			$(this).children(".ui-slider-handle").html('<div class="tooltip top slider-tip"><div class="tooltip-arrow"></div><div class="tooltip-inner">' + tooltips[parseInt(privacy)] + '</div></div>');
			$(this).find(".slider-tip").hide();
			if(privacy == "0"){
				$(this).find('.tooltip-inner').css("margin-left","85px");
				$(this).find('.tooltip-arrow').css("margin-left","-52px");
			}
			if(privacy == (""+max)){
				$(this).find('.tooltip-inner').css("margin-left","-60px");
				$(this).find('.tooltip-arrow').css("margin-left","20px");
			}
		},
		slide: function( event, ui ) {
			if(ui.value == 0){
				$(this).find('.ui-slider-handle').find('.tooltip-inner').css("margin-left","85px");
				$(this).find('.ui-slider-handle').find('.tooltip-arrow').css("margin-left","-52px");
			}
			else if(ui.value == max){
				$(this).find('.ui-slider-handle').find('.tooltip-inner').css("margin-left","-60px");
				$(this).find('.ui-slider-handle').find('.tooltip-arrow').css("margin-left","20px");
			}
			else {
				$(this).find('.ui-slider-handle').find('.tooltip-inner').css("margin-left","0");
				$(this).find('.ui-slider-handle').find('.tooltip-arrow').css("margin-left","-10px");
			}
			userInfo.privacy[field.toLowerCase()] = "" + ui.value;
			privacy = userInfo.privacy[field.toLowerCase()];
			$("#list_settings").find("."+field.toLowerCase()+" span").html(tooltips[parseInt(privacy)]);
			var correspondingItem;
			
			
			//var sliderValue =  $('#sliderUserTrace').slider("option","value"); 
			var sliderValue = tracesSliderCurrentValue;
			console.log("slider value : "+sliderValue);
		
			for ( var i = 0; i <traceValuesMapping.length; i++){
				if ( traceValuesMapping[i].value == sliderValue){
					correspondingItem = traceValuesMapping[i].trace;
				}
			}
			console.log(correspondingItem);
			if ( correspondingItem != undefined){
				updateRecommendation(initSandbox, JSON.parse(correspondingItem));
			}
			else{
				updateRecommendation(initSandbox);
			}
			

			$(this).find('.ui-slider-handle').find(".tooltip-inner").html(tooltips[parseInt(privacy)]);
		},
		stop: function(){
			$(".slider-tip").hide();
		}
	}).addSliderSegments(max+1,tooltips);
}

$(document).ready(function(){
	
	var docUrl = $(document)[0].URL;
	var pluginUrl = docUrl.split('/')[0]+"//"+docUrl.split('/')[2]+'/'+docUrl.split('/')[3]+'/';
	
	$('.tabTraces').live("click",function(){document.location = pluginUrl+"traces.html"});
	$('.tabProfile').live("click",function(){document.location = pluginUrl+"profile.html"});
	
	initSandbox();
	initUserInfo();
	
	$('.ui-slider-segment').live("mouseenter",hoverIn).live("mouseleave",hoverOut);
	
	$("#sliderBirthdate").find(".ui-slider-handle").live("mouseenter",ageHoverIn).live("mouseleave",ageHoverOut);
	$("#sliderAddress").find(".ui-slider-handle").live("mouseenter",addressHoverIn).live("mouseleave",addressHoverOut);
	$("#sliderGeoloc").find(".ui-slider-handle").live("mouseenter",geolocHoverIn).live("mouseleave",geolocHoverOut);
	$("#sliderTraces").find(".ui-slider-handle").live("mouseenter",tracesHoverIn).live("mouseleave",tracesHoverOut);

	$('#emailSetting').find(".switch").live("click",doSwitchEmail);
	$('#genderSetting').find(".switch").live("click",doSwitchGender);
	$('#titleSetting').find(".switch").live("click",doSwitchTitle);  
	$('.submitSetting').live("click",updateUserInfo);

});
