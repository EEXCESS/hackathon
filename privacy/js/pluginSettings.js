/*
document.getElementById("apiBaseUri").addEventListener('focus',function(){
	if(this.value=='API base URI'||this.value==localStorage["API_BASE_URI"])document.getElementById("apiBaseUri").value='';
});
*/

$("#apiBaseUri").live('blur',function(){
	if($(this).val()==''){
		$(this).val(localStorage["API_BASE_URI"]);
	}
});

$("#apiBaseUri").val(localStorage["API_BASE_URI"]);
$("#updateURI").live("click",function(){
	localStorage["API_BASE_URI"]=$("#apiBaseUri").val();
	$('#successURIUpdate').text('API base URI updated');
});
