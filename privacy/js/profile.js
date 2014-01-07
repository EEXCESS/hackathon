var userInfo = {
	username: localStorage["username"]
};
var idUser;


function initUserInfo(){

	var request ={
		
		_id: localStorage["user_id"]
		
	};
	
	
	var JSONrequest = JSON.stringify(request);
	
	$.ajax({
	   url: localStorage["API_BASE_URI"]+"api/v0/user/profile",
	   type: "POST",
	   contentType: "application/json;charset=UTF-8",
	   data: JSONrequest,
	   complete: function(response){    
	   		userInfo = JSON.parse(response.responseText);
	   		idUser = userInfo["id"];
	   		userInfo = userInfo["values"];
	   		if ( userInfo != null ){
	   			generateProfilePage();
	   		}
	   		initSettings();

	   }
	})
};

function generateProfilePage() {
	if ( userInfo.username != undefined && userInfo.username !="" ){
		$(".username").html("Username: " + userInfo.username);
		localStorage["username"]= userInfo.username;
	}
	else{
		$(".username").html("Username: user");
		localStorage["username"] = "user";
	}
	
	var gravatar = "http://www.gravatar.com/avatar/"+MD5(userInfo.email);
	$('.gravatarProfile').attr('src',gravatar);
	
	$(".emailTitle").html("Email: " + userInfo.email);
	$("#fullEmail").html(userInfo.email);
	
	
	$(".titleTitle").html("Title: " + userInfo.title);
	$("#fullTitle").html(userInfo.title);
	if(userInfo.title == "") {
		$(".titleTitle").html("Title: Not saved yet");
		$("#fullTitle").html("Title: Not saved yet");
	}
	
	$(".lastnameTitle").html("Lastname: " + userInfo.lastname);
	if(userInfo.lastname == "") {
		$(".lastnameTitle").html("Lastname: Not saved yet");
	}
	
	$(".firstnameTitle").html("Firstname: " + userInfo.firstname);
	if(userInfo.firstname == "") {
		$(".firstnameTitle").html("Firstname: Not saved yet");
	}
	
	$(".genderTitle").html("Gender: " + userInfo.gender);
	$("#fullGender").html(userInfo.gender);
	if(userInfo.gender == "") {
		$(".genderTitle").html("Gender: Not saved yet");
		$("#fullGender").html("Gender: Not saved yet");
	}
	
	$(".birthdateTitle").html("Birthdate: " + userInfo.birthdate);
	$("#fullAge").html(userInfo.birthdate);
	if(userInfo.birthdate == "" || userInfo.birthdate == undefined) {
		$(".birthdateTitle").html("Birthdate: Not saved yet");
		$("#fullAge").html("Birthdate: Not saved yet");
	}
	$(".topics").html("Topics: " + getTopicsStr());
	if(getTopicsStr() == "") {
		$(".topics").html("Topics : Not defined yet");
	}
	
	generateDateSelect();
	
	generateAddress();
	
	
	
}

function generateDateSelect(){
	
	for (var i=2;i<=31;i++){
		var day = i;
		
		if(day<10) day = "0"+day;
		
		$('.inputBirthdate3').append("<option>"+day+"</option>");
	}
	
	for (var i=2;i<=12;i++){
		var month = i;
		
		if(month<10) month = "0"+month;
		
		$('.inputBirthdate2').append("<option>"+month+"</option>");
	}
	
	
	for (var i=1;i<=120;i++){
		year = 2013-i;
		$('.inputBirthdate1').append("<option>"+year+"</option>");
	}
}

function generateAddress(){
	
	if (userInfo.address == undefined){
		$(".streetTitle").html("Address");
		$(".cityTitle").html("");
		$(".countryTitle").html("");
	}
	else{		
		$(".streetTitle").html("Address: " + userInfo.address.street);
		$(".cityTitle").html(userInfo.address.postalcode+" "+userInfo.address.city);
		$(".countryTitle").html(userInfo.address.country);
		if(userInfo.address.street == "") {
			$(".streetTitle").html("Adress: Not saved yet");
			$(".cityTitle").html("");
			$(".countryTitle").html("");
		}
		
		$('.inputStreet').val(userInfo.address.street);
		$('.inputPostalcode').val(userInfo.address.postalcode);
		$('.inputCity').val(userInfo.address.city);
		$('.inputCountry').val(userInfo.address.country);
	}
}

function doToggleEmail() {

	if ($(".emailChange").css("display") == "none"){
		$(".emailChange").show("slow");
		$('.menuArrowEmail').css("-webkit-transform","rotate(90deg)");		
	}
	else {
		$('.menuArrowEmail').css("-webkit-transform","none");
		$('.emailChange').hide("slow");
	}
}

function doToggleTitle() {

	if ($(".titleChange").css("display") == "none"){
		$(".titleChange").show("slow");
		$('.menuArrowTitle').css("-webkit-transform","rotate(90deg)");		
	}
	else {
		$('.menuArrowTitle').css("-webkit-transform","none");
		$('.titleChange').hide("slow");
	}
}

function doToggleLastname() {

	if ($(".lastnameChange").css("display") == "none"){
		$(".lastnameChange").show("slow");
		$('.menuArrowLastname').css("-webkit-transform","rotate(90deg)");		
	}
	else {
		$('.menuArrowLastname').css("-webkit-transform","none");
		$('.lastnameChange').hide("slow");
	}
}

function doToggleFirstname() {

	if ($(".firstnameChange").css("display") == "none"){
		$(".firstnameChange").show("slow");
		$('.menuArrowFirstname').css("-webkit-transform","rotate(90deg)");		
	}
	else {
		$('.menuArrowFirstname').css("-webkit-transform","none");
		$('.firstnameChange').hide("slow");
	}
}

function doToggleGender() {

	if ($(".genderChange").css("display") == "none"){
		$(".genderChange").show("slow");
		$('.menuArrowGender').css("-webkit-transform","rotate(90deg)");		
	}
	else {
		$('.menuArrowGender').css("-webkit-transform","none");
		$('.genderChange').hide("slow");
	}
}

function doToggleBirthdate() {

	if ($(".birthdateChange").css("display") == "none"){
		$(".birthdateChange").show("slow");
		$('.menuArrowBirthdate').css("-webkit-transform","rotate(90deg)");		
	}
	else {
		$('.menuArrowBirthdate').css("-webkit-transform","none");
		$('.birthdateChange').hide("slow");
	}
}

function doToggleAddress() {

	if ($(".addressChange").css("display") == "none"){
		$(".addressChange").show("slow");
		$('.menuArrowAddress').css("-webkit-transform","rotate(90deg)");		
	}
	else {
		$('.menuArrowAddress').css("-webkit-transform","none");
		$('.addressChange').hide("slow");
	}
}
function doToggleTopics() {

	if ($(".topicsChange").css("display") == "none"){
		if((!(userInfo.topics==null||userInfo.topics==undefined))&&userInfo.topics instanceof Array){
			for(var i=0;i<userInfo.topics.length;i++){
				if(userInfo.topics[i]!=undefined){
					if($('span[name=\"'+userInfo.topics[i].label+'\"]').size()== 0){ // bug : if there are more than one topic with the same label : all topics are not displayed
						displayTopics(userInfo.topics[i].label,userInfo.topics[i].env,userInfo.topics[i].source);
					}
					/*else if($('span[name=\"'+userInfo.topics[i].label+'\"]').origin != userInfo.topics[i].origin 
							|| $('span[name=\"'+userInfo.topics[i].label+'\"]').parent().parent().id != userInfo.topics[i].env ){
						
						displayTopics(userInfo.topics[i].label,userInfo.topics[i].env,userInfo.topics[i].source);
					}*/
					
					
				}
			}
		}
		
	/*	$('.tagsinput').droppable({
			accept: ".tag"
		});*/
		
		$(".topicsChange").show("slow");
		$('.menuArrowTopics').css("-webkit-transform","rotate(90deg)");		
	}
	else {
		$('.menuArrowTopics').css("-webkit-transform","none");
		$('.topicsChange').hide("slow");
	}
}


function checkUpdate(){
	
	var email = $('.inputEmail').val();
	
	if(!validEmail(email)){
		$('.stateEmail').html('This is not a valid email');
	}else{
		
		var query = JSON.stringify({
			user_email: email
		});
		$.ajax({
		   url: localStorage["API_BASE_URI"]+"api/v0/user/exists",
		   type: "POST",
		   contentType: "application/json;charset=UTF-8",
		   data: query,
		   complete: function(response) {	
			    var responseObject = JSON.parse(response.responseText);
				var taken = responseObject["hits"];
				if(taken==0) {
					doUpdate("Email");
				}
				else {
					$('.stateEmail').html('Email is already taken');
				}
		   }
		});
	}
}

function updateTitle(){
	doUpdate("Title");
}

function updateLastname(){
	doUpdate("Lastname");
}

function updateFirstname(){
	doUpdate("Firstname");
}

function updateGender(){
	doUpdate("Gender");
}

function updateBirthdate(){
	
	//First, we check the date
	var valid = 0;
	var longMonths = ["01","03","05","07","08","10","12"];
	
	if ($('.inputBirthdate3').val() == "31"){
		for (i=0;i<7;i++){
			if($('.inputBirthdate2').val() == longMonths[i]) {
				valid = 1; 
			}
		}
	}
	else {
		if ($('inputBirthdate2') == "02"){
			if ($('.inputBirthdate3') <= 28){
				valid = 1;
			}
			else {
				if($('.inputBirthdate3') == 29){
					if ((($('.inputBirthdate1')%4)==0) && ($('.inputBirthdate1') != "1900")){
						valid = 1;
					}
				}
			}
		}
		else{
			valid=1;
		}
	}
	
	if(valid){
		userInfo["birthdate"] = $('.inputBirthdate1').val()+"-"+$('.inputBirthdate2').val()+"-"+$('.inputBirthdate3').val();
	
		var userDataJSON = JSON.stringify(userInfo);

		
		$.ajax({
		   url: localStorage["API_BASE_URI"]+"api/v0/user/data",
		   type: "POST",
		   contentType: "application/json;charset=UTF-8",
		   data: userDataJSON,
		   beforeSend: function (request)
	       {
	           request.setRequestHeader("traceid", idUser);
	       },
		   complete: function(response) {
				$('.birthdateTitle').html("Birthdate: "+userInfo["birthdate"]);
				$('.stateBirthdate').html("Changes saved");
		   }
		});
	}
	else {
		$('.stateBirthdate').html("This date doesn't exist");
	}
}

function updateAddress(){
	
	userInfo["address"] = {};
	
	url = "http://api.geonames.org/postalCodeLookupJSON?postalcode="+$('.inputPostalcode').val()+"&country=FR&username=eexcess.insa";
	
	$.ajax({
	   url: url,
	   type: "GET",
	   contentType: "text/json;charset=UTF-8",
	   success: function(response) {
			userInfo.address["street"] = $('.inputStreet').val();
			userInfo.address["postalcode"] = $('.inputPostalcode').val();
			userInfo.address["city"] = $('.inputCity').val();
			userInfo.address["country"] = $('.inputCountry').val();
			userInfo.address["region"] = response.postalcodes[0].adminName1;
			userInfo.address["district"] = response.postalcodes[0].adminName3;
			
			var userDataJSON = JSON.stringify(userInfo);
			
			$.ajax({
			   url: localStorage["API_BASE_URI"]+"api/v0/user/data",
			   type: "POST",
			   contentType: "application/json;charset=UTF-8",
			   data: userDataJSON,
			   beforeSend: function (request)
			   {
			       request.setRequestHeader("traceid", idUser);
			   },
			   complete: function(response) {
				    $(".streetTitle").html("Address: " + userInfo.address.street);
					$(".cityTitle").html(userInfo.address.postalcode+" "+userInfo.address.city);
					$(".countryTitle").html(userInfo.address.country);
					$('.stateAddress').html("Changes saved");
			   }
			});
	   }
	});	
}

function doUpdate(field){
	
	userInfo[field.toLowerCase()] = $('.input'+field).val();
	if (userInfo["birthdate"] == "") {
		delete userInfo["birthdate"];
	}
	
	var userDataJSON = JSON.stringify(userInfo);
	
	$.ajax({
	   url: localStorage["API_BASE_URI"]+"api/v0/user/data",
	   type: "POST",
	   contentType: "application/json;charset=UTF-8",
	   data: userDataJSON,
	   beforeSend: function (request)
       {
           request.setRequestHeader("traceid", idUser);
       },
	   complete: function(response) {
			$('.'+field.toLowerCase()).html(field+": "+userInfo[field.toLowerCase()]);
			$('.state'+field).html("Changes saved");
			localStorage["privacy_email"] = userInfo["email"];
	   }
	});
}

function validEmail(mail)

{
	var reg = new RegExp('^[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*@[a-z0-9]+([_|\.|-]{1}[a-z0-9]+)*[\.]{1}[a-z]{2,6}$', 'i');

	if(reg.test(mail))
	{
		return(true);
	}
	else
	{
		return(false);
	}
}

function updateTopics(){
	var values=new Array();
	var tags = document.getElementsByClassName("tag");
	for(var i=0; i<tags.length;i++){
		var orig = tags[i].origin;
		var envi = tags[i].parentNode.id;
		envi = envi.split("_")[0];
		values[i]={label:tags[i].innerText,origin:orig,env:envi}; //*********************
	}
	userInfo.topics=values;
	var userDataJSON = JSON.stringify(userInfo);
	$.ajax({
	   url: localStorage["API_BASE_URI"]+"api/v0/user/data",
	   type: "POST",
	   contentType: "application/json;charset=UTF-8",
	   data: userDataJSON,
	   beforeSend: function (request)
       {
           request.setRequestHeader("traceid", idUser);
       },
	   complete: function(response) {
		   
		    $('#topicsTitle').html("Topics : "+getTopicsStr());
			$('.stateTopics').html("Changes saved");
			localStorage["privacy_email"] = userInfo["email"];
	   }
	});
}


function getTopicsStr()
{
	var topicsStr ="";
    if (userInfo.topics instanceof Array){
	for (var i = 0 ; i<userInfo.topics.length;i++){
		   if(topicsStr == ""){
			   topicsStr = topicsStr+userInfo.topics[i].label;
		   }
		   else{
			   topicsStr = topicsStr+", "+userInfo.topics[i].label;
		   }
	  }
    }
	return topicsStr;
}
function doAddTag (env){
	
	var newTag = document.createElement('span');
	newTag.setAttribute('class','tag');
	newTag.setAttribute('origin','eexcess');
	//newTag.setAttribute('origin','tag');
	var innerSpan = document.createElement('span');
	var tagValue = document.getElementById('tagsinput_tag_'+env).value;
	document.getElementById('tagsinput_tag_'+env).value="";
	newTag.setAttribute('name',tagValue);
	innerSpan.innerHTML='<img class="imgTag" src="media/icon.png">'+tagValue+'<a class="tagsinput-remove-link"></a>';
	newTag.appendChild(innerSpan);
	document.getElementById('tagsinput_tagsinput_'+env).insertBefore(newTag,document.getElementById('tagsinput_addTag_'+env));
}

function nothingTopic(){
	doAddTag("nothing");
}
function homeTopic(){
	doAddTag("home");
}
function workTopic(){
	doAddTag("work");
}
function allTopic(){
	doAddTag("all");
}


function doRemoveTag(){
	$(this).closest('.tag').remove();
	
}

function displayTopics( topic,env,source ){
	/*alert("."+env+"_tagsinput");
	$("."+env+"_tagsinput").addTag(topic);*/
	
	var newTag = document.createElement('span');
	newTag.setAttribute('class','tag');
	newTag.setAttribute('draggable',true);
	newTag.setAttribute('id',topic);
	newTag.setAttribute('name',topic);
	var innerSpan = document.createElement('span');
	$("."+env+"_tagsinput").value="";
	innerSpan.innerHTML="";
	if (source == "eexcess") {
		innerSpan.innerHTML='<img class="imgTag" src="media/icon.png">';
		newTag.setAttribute('origin','eexcess');
	}
	if (source == "mendeley"){
		innerSpan.innerHTML='<img class="imgTag" src="media/mendeley.png">';
		newTag.setAttribute('origin','mendeley');
	}
	innerSpan.innerHTML+=topic+'<a class="tagsinput-remove-link"></a>';
	newTag.appendChild(innerSpan);
	document.getElementById(env+'_tagsinput').insertBefore(newTag,document.getElementById(env+'_tagsinput').firstChild);
	
}

function drag(){
	event.dataTransfer.setData("Text", this.id);
}

function drop() {
	var id = event.dataTransfer.getData("Text");
	this.insertBefore(document.getElementById(id),this.firstChild);
	event.preventDefault();
}

function dragover(){
	
	return false;
}

function newtag(){
	alert('test');
}

$(document).ready(function(){
	
	var docUrl = $(document)[0].URL;
	var pluginUrl = docUrl.split('/')[0]+"//"+docUrl.split('/')[2]+'/'+docUrl.split('/')[3]+'/';
	
	$('.tabTraces').live("click",function(){document.location = pluginUrl+"traces.html"});
	$('.tabSettings').live("click",function(){document.location = pluginUrl+"privacySandbox.html"});

	$('.nothing_tagsinput').live("addTag",newtag);
	
	$('.tag').live("dragstart",drag);
	$('.tagsinput').live("drop",drop).live("dragover",dragover);
	
	$('.emailHandle').live("click",doToggleEmail);
	$('.titleHandle').live("click",doToggleTitle);
	$('.lastnameHandle').live("click",doToggleLastname);
	$('.firstnameHandle').live("click",doToggleFirstname);
	$('.genderHandle').live("click",doToggleGender);
	$('.birthdateHandle').live("click",doToggleBirthdate);
	$('.addressHandle').live("click",doToggleAddress);
	$('.topicsHandle').live("click",doToggleTopics);
	
	$('.nothing').live("click",nothingTopic);
	$('.home').live("click",homeTopic);
	$('.work').live("click",workTopic);
	$('.all').live("click",allTopic);
	$('.tagsinput-remove-link').live("click",doRemoveTag);
	
	$('.submitEmail').live("click",checkUpdate);
	$('.submitTitle').live("click",updateTitle);
	$('.submitLastname').live("click",updateLastname);
	$('.submitFirstname').live("click",updateFirstname);
	$('.submitGender').live("click",updateGender);
	$('.submitBirthdate').live("click",updateBirthdate);
	$('.submitAddress').live("click",updateAddress);
	$('.submitTopics').live("click",updateTopics);

	$('.mytagbuckets').tagsInput({
		onAddTag: function() {
			var name = $(this).attr("id");
			var lastTag = $('#'+name+'_tagsinput').find('.tag').last();
			var id = lastTag[0].innerText;
			lastTag.attr("draggable",true).attr("id",id);
			var htmlTag = lastTag.html();
			lastTag.html('<img class="imgTag" src="media/icon.png">'+htmlTag);
			
		}
	});
	/*$('.mytagbuckets').droppable({
		accept: ".tag",
		over: function ( event, ui ){
			alert("ach");
			$('#all_tagsinput').css('border-color','red');
		},
		drop: function (event, ui){
			alert("mg");
		}
	});*/

});

