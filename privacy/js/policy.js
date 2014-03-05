function doProgressClick() {
	if($(this).siblings().size() <= 1) {
		$(this).siblings().andSelf().toggleClass("disable");
	} else {
		$(this).removeClass("disable");
		$(this).nextAll().addClass("disable");
		$(this).prevAll().removeClass("disable");
	}
	$(this).closest(".progress").trigger("change");
}

function doChangeProgress() {
	var value = 0;
	if($(this).find(".progress-bar").size() <= 2) {
		if($(this).find(".progress-bar:eq(0)").hasClass("disable")) {
			value = 1;
		} else {
			value = 0;
		}
	} else {
		value = $(this).find(".progress-bar:not(.disable)").size();
	}
	$(this).closest(".panel").find(".setting").html(value);
	
	$(this).each(updatePolicy);
}

function updatePolicy() {
	var fieldName = $(this).closest(".panel").attr("data-eexcess-policy-field");
	var value = $(this).closest(".panel").find(".setting").html();
	console.log("Updating policy setting for '"+fieldName+"' to "+value);
	
	localStorage["privacy.policy."+fieldName] = value;
	
/* 	var rawValue = localStorage["profile.private."+fieldValue];	
	privacy.apply(fieldName,rawValue, value);
	*/
}

function initPolicyPanel() {
	var fieldName = $(this).closest(".panel").attr("data-eexcess-policy-field");
	var value =	localStorage["privacy.policy."+fieldName];
	console.log("Reloadig policy setting for '"+fieldName+"' as "+value);
	if($(this).find(".progress-bar").size() <= 2) {
		$(this).find(".progress-bar").eq(value).each(doProgressClick);
		if(value == 0) {
			// Hack, simulate 2 clicks to get zero and update other info
			$(this).find(".progress-bar").eq(value).each(doProgressClick);
		}
	} else {
		$(this).find(".progress-bar").eq(value - 1).each(doProgressClick);
	}
}

(function($) {
  $(".progress-bar").click(doProgressClick);
  $(".progress").live("change",doChangeProgress);
  $(".progress").each(initPolicyPanel);
})(jQuery);

