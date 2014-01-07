var url = document.location.href;
var query = url.split('?')[1];

var queryComponents = query.split("&");

var token, verifier;

queryComponents.forEach(function(element){
	var component = element.split("=");
	var compName = component[0];
	var compValue = component[1];
	if(compName == "oauth_token"){
		token = compValue;
	};
	if(compName == "oauth_verifier"){
		verifier = compValue;
	}
});

$.ajax({
   	url: localStorage["API_BASE_URI"]+"api/v0/connect/mendeley/validate",
    type: "GET",
    contentType: "application/json;charset=UTF-8",
    beforeSend: function (request)
    {
        request.setRequestHeader("oauth_verifier", verifier);
        request.setRequestHeader("oauth_token", token);
        request.setRequestHeader("oauth_token_secret", localStorage["token_secret"]);
        request.setRequestHeader("user_id", localStorage["user_id"]);
    },
    complete: function(response, status, xhr){
    	var idJSON = JSON.parse(response.responseText);
    	var id = idJSON["_id"];
    	localStorage["user_id"] = id;
    	localStorage["mendeley_enabled"]='true';
    	var redirect = url.split("oauth/index.html")[0];
    	redirect += "traces.html";
    	document.location.href = redirect;
    }
});