/*************************************************************
*    This script saves the user email in the localStorage.   *
*    More informations may be add later.                     *
*************************************************************/


function valideIDs(){

	var username = document.forms["register"].elements[0].value;
	var email = document.forms["register"].elements[1].value;
	
	var query = JSON.stringify({
		user_email: email,
		user_username: username
	});
	
	if(validEmail(email)){
		$.ajax({
		   url: localStorage["API_BASE_URI"]+"api/v0/user/exists",
		   type: "POST",
		   contentType: "application/json;charset=UTF-8",
		   data: query,
		   success: function(response) {	
				var taken = response["hits"];
				if(taken==0) {
					register();
				}
				else {
					document.getElementById('successSignup').innerHTML='Username or Email is already taken';
				}
		   },
		   error: function(response){
		   		alert('error: '+response.status);
		   }
		});
	}
	else {
		document.getElementById('successSignup').innerHTML='Invalid Email';
	}

}

function register(){

	/*
	* TODO : verifier la disponibilite  document.forms["register"].elements[0].value
	* Already done in valideIDs
	*/
	
	var username = document.forms["register"].elements[0].value;
	var email = document.forms["register"].elements[1].value;
	var password = MD5(document.forms["register"].elements[2].value);	
	
	localStorage["privacy_email"] = email;
	localStorage["username"] = username;
	
	var userData = {	
		username: username,
		email: email,
		password: password		
	};
	
	var userDataJSON = JSON.stringify(userData);
	
	$.ajax({
	   url: localStorage["API_BASE_URI"]+"api/v0/user/data",
	   type: "POST",
	   contentType: "application/json;charset=UTF-8",
	   data: userDataJSON,
	   success: function(response, status, xhr) {
			document.getElementById('successSignup').innerHTML='Registration Successfull';
			document.getElementById("successLogin").innerHTML = "Successful Sign in";
			localStorage["user_id"] = xhr.getResponseHeader("traceId");
			document.location.href="traces.html";
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


function login() {
	
	var id = document.forms["login"].elements[0].value;
	var password = MD5(document.forms["login"].elements[1].value);	

	if(validEmail(id)) {
		var field = "email";
	}
	else {
		var field = "username";
	}
	
	if(id != ''){
		var userData = "{\"term\":{\"data."+field+"\":\""+id+"\"}},{\"term\":{\"data.password\":\""+password+"\"}}";
	
		$.ajax({
		   	url: localStorage["API_BASE_URI"]+"api/v0/user/authenticate",
		    type: "POST",
		    contentType: "application/json;charset=UTF-8",
		    data: userData,
		    success: function(response) {	
				var loginValid = response["loginValid"];
				if(loginValid==0) {
					document.getElementById("successLogin").innerHTML = "Wrong identification";
				}
				else {
					localStorage["privacy_email"] = response["email"];
					localStorage["username"] = response["username"];
					localStorage["user_id"] = response["id"];
					document.getElementById("successLogin").innerHTML = "Successful Sign in";
					document.location.href="traces.html";
				}
		    }
		});
	}
	
}

function oauthMendeley(){
	$.ajax({
		   	url: localStorage["API_BASE_URI"]+"api/v0/connect/mendeley/init",
		    type: "POST",
		    contentType: "application/json;charset=UTF-8",
		    success:function(response, status, xhr){
		    	var token = xhr.getResponseHeader("oauth_token");
		    	localStorage["token_secret"] = xhr.getResponseHeader("oauth_token_secret");
		    	window.location = "http://api.mendeley.com/oauth/authorize/?oauth_token="+token;
		    }
		});
}

function click_btn() {
	document.getElementById("sign_up").addEventListener('click',valideIDs);
	document.getElementById("sign_in").addEventListener('click',login);
	
	document.getElementById("passwordSignin").addEventListener('focus',function(){
		if(this.type=='text') this.type='password';
		if(this.value=='Password') this.value='';
	});
	
	document.getElementById("passwordSignin").addEventListener('blur',function(){
		if(this.value==''){
			this.type='text';
			this.value='Password';
		}
	});
	
	document.getElementById("idSignin").addEventListener('focus',function(){
		if(this.value=='Username/Email')document.getElementById("idSignin").value='';
	});
	
	document.getElementById("idSignin").addEventListener('blur',function(){
		if(this.value==''){
			this.value='Username/Email';
		}
	});
	
	document.getElementById("passwordSignup").addEventListener('focus',function(){
		if(this.type=='text')document.getElementById("passwordSignup").type='password';
		if(this.value=='Password')document.getElementById("passwordSignup").value='';
	});
	
	document.getElementById("passwordSignup").addEventListener('blur',function(){
		if(this.value==''){
			this.value='Password';
			this.type='text';
		}
	});
	
	document.getElementById("emailSignup").addEventListener('focus',function(){
		if(this.value=='Email')document.getElementById("emailSignup").value='';
	});
	
	document.getElementById("emailSignup").addEventListener('blur',function(){
		if(this.value==''){
			this.value='Email';
		}
	});
	
	document.getElementById("fullName").addEventListener('focus',function(){
		if(this.value=='Username')document.getElementById("fullName").value='';
	});

	document.getElementById("fullName").addEventListener('blur',function(){
		if(this.value==''){
			this.value='Username';
		}
	});
	
	$('.mendeleyConnect').click(oauthMendeley);

}


document.addEventListener('DOMContentLoaded', function () {
  click_btn();
});
