function doProfileItemChange() {
	var fieldName = $(this).attr("data-eexcess-profile-field");
	var value = $(this).val();
	console.log("Updating profile entry '"+fieldName+"' to "+value);
	localStorage["privacy.profile."+fieldName] = value;
}

function loadProfileItem() {
	var fieldName = $(this).attr("data-eexcess-profile-field");
	var value = localStorage["privacy.profile."+fieldName];
	$(this).val(value);
}

function loadTopics() {
	var topicContainer = $(this);
	var jsonTopics = localStorage["privacy.profile.topics"];
	var topics =  [ "Dummy1", "Dummy2"];
	if(jsonTopics) {
		topics = JSON.parse(jsonTopics);
	}
	$.each(topics, function (i, v) {
		$(makeTopicHtml(v)).appendTo(topicContainer);
	});
}

function makeTopicHtml(v) {
	return '<span class="label label-default"><span class="glyphicon glyphicon-remove"></span> <span class="tag">'+v+'</span></span>';
}

function doTopicsChange() {
	var fieldName = "privacy.profile.topics";
	var topics = [];
	$(this).find("span.tag").each(function(){
		topics.push($(this).text());
	});
	
	var topicsJson = JSON.stringify(topics);
	
	console.log("Updating profile entry '"+fieldName+"' to "+topicsJson);
	localStorage[fieldName] = topicsJson;
}

function doTopicInputKeydown(event) {
	if(event.which == 13) {
		var topic = $(this).val();
		$(makeTopicHtml(topic)).appendTo($("#topics .label-container"));		
		$(this).val("");
		
		$("#topics .label-container").trigger("change");
	}
}

function doRemove() {
	var container = $(this).closest(".label-container");
	$(this).parent().remove();
	container.trigger("change");
}

(function($) {
	$('.datepicker').datepicker({viewMode: 2}).on('changeDate', function(ev) { $(this).trigger('change'); });

	$("input[data-eexcess-profile-field]").live("change",doProfileItemChange);
	$("select[data-eexcess-profile-field]").live("change",doProfileItemChange);
	
	$("*[data-eexcess-profile-field]").each(loadProfileItem);
	
	$("#topics .label-container").each(loadTopics);
	$("#topics .label-container .glyphicon-remove").live("click",doRemove);
	$("#topics .label-container").live("change",doTopicsChange);
	$("#topics input").live("keydown", doTopicInputKeydown);
})(jQuery);
