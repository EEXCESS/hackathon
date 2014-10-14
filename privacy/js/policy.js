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
	var topics = $(this).closest(".panel").find(".list-group .progress");
	if (topics.size() > 0) {
		// Topics case
		topics.each(function() {
			if($(this).find(".progress-bar:eq(0)").hasClass("disable")) {
				value += 1;
			}
		});
	} else {
		// General case
		if($(this).find(".progress-bar").size() <= 2) {
			if($(this).find(".progress-bar:eq(0)").hasClass("disable")) {
				value += 1;
			}
		} else {
			value += $(this).find(".progress-bar:not(.disable)").size();
		}
	}

	$(this).closest(".panel").find(".setting").html(value);
	
	$(this).each(updatePolicy);
}

function updatePolicy() {
	var value = 0;
	var fieldName = $(this).closest(".container").attr("data-eexcess-policy-field");
	if (fieldName) {
		// topics case
		if($(this).find(".progress-bar:eq(0)").hasClass("disable")) {
			value = 1;
		}
		
		var jsonTopicsPolicy = EEXCESS.storage.local('privacy.profile.topics');
        var topics = [];
        if(jsonTopicsPolicy) {
            topics = JSON.parse(jsonTopicsPolicy);
        }
        for (var i=0 ; i < topics.length ; i++) {
        	if(topics[i]['label'] === fieldName) {
        		topics[i]['policy'] = value;
                break;
        	}
        }
        EEXCESS.storage.local('privacy.profile.topics', JSON.stringify(topics));
        updateDisclosedValue("topics");
	} else {
		// general case
		fieldName = $(this).closest(".panel").attr("data-eexcess-policy-field");

		if($(this).find(".progress-bar").size() <= 2) {
			if($(this).find(".progress-bar:eq(0)").hasClass("disable")) {
				value = 1;
			}
		} else {
			value = $(this).find(".progress-bar:not(.disable)").size();
		}
		
		EEXCESS.storage.local("privacy.policy."+fieldName,value);
		updateDisclosedValue(fieldName);
	}
	
	
/* 	var rawValue = EEXCESS.storage.local("profile.private."+fieldValue);	
	privacy.apply(fieldName,rawValue, value);
	*/
}

function updateDisclosedValue(fieldName) {
	switch(fieldName) {
    case "topics":
    	if ($("div[data-eexcess-policy-field='topics']").find(".panel-body .progress-bar:eq(0)").hasClass("disable")) {
    		var jsonTopicsPolicy = EEXCESS.storage.local("privacy.profile.topics");
    		var topics = [];
            if(jsonTopicsPolicy) {
                topics = JSON.parse(jsonTopicsPolicy);
            }
            var value = 0;
            for (var i=0 ; i < topics.length ; i++) {
            	if (topics[i]['policy'] === 1) {
            		value += 1;
            	}
            }
            $("div[data-eexcess-policy-field='topics']").find("#disclosed").html(value);
		} else {
			$("div[data-eexcess-policy-field='topics']").find("#disclosed").html(0);
		}
    	break;
    case "history":
		var today = new Date();
    	switch(EEXCESS.storage.local("privacy.policy.history")) {
    	case '1':
			$("div[data-eexcess-policy-field='history']").find("#disclosed").html(0);
			break;
    	case '2':
    		var data = today.getTime() - 1000*60*60;
    		EEXCESS.messaging.callBG({method: {parent:'profile', func: 'getHistorySize'}, data: data}, function(results) {
    			$("div[data-eexcess-policy-field='history']").find("#disclosed").html(results.length);
    		});
    		break;
    	case '3':
    		var data = today.getTime() - 1000*60*60*24;
    		EEXCESS.messaging.callBG({method: {parent:'profile', func: 'getHistorySize'}, data: data}, function(results) {
    			$("div[data-eexcess-policy-field='history']").find("#disclosed").html(results.length);
    		});
    		break;
    	case '4':
    		var data = today.getTime() - 1000*60*60*24*7;
    		EEXCESS.messaging.callBG({method: {parent:'profile', func: 'getHistorySize'}, data: data}, function(results) {
    			$("div[data-eexcess-policy-field='history']").find("#disclosed").html(results.length);
    		});
    		break;
    	case '5':
    		var data = today.getTime() - 1000*60*60*24*30;
    		EEXCESS.messaging.callBG({method: {parent:'profile', func: 'getHistorySize'}, data: data}, function(results) {
    			$("div[data-eexcess-policy-field='history']").find("#disclosed").html(results.length);
    		});
    		break;
    	case '6':
    		var data = today.getTime() - 1000*60*60*24*365;
    		EEXCESS.messaging.callBG({method: {parent:'profile', func: 'getHistorySize'}, data: data}, function(results) {
    			$("div[data-eexcess-policy-field='history']").find("#disclosed").html(results.length);
    		});
    		break;
    	case '7':
    		EEXCESS.messaging.callBG({method: {parent:'profile', func: 'getHistorySize'}, data: null	}, function(results) {
    			$("div[data-eexcess-policy-field='history']").find("#disclosed").html(results.length);
    		});
			break;
    	}
        break;
    case "address":
		var value = '<address>\n';
    	if (EEXCESS.storage.local("privacy.policy.address") >= 5) {
    		if (EEXCESS.storage.local("privacy.profile.address.line1")) {
    			value += EEXCESS.storage.local("privacy.profile.address.line1") + '<br>\n';
    		} 
    		if (EEXCESS.storage.local("privacy.profile.address.line2")) {
    			value += EEXCESS.storage.local("privacy.profile.address.line2") + '<br>\n';
    		}
    	}
    	if (EEXCESS.storage.local("privacy.policy.address") >= 4) {
    		if (EEXCESS.storage.local("privacy.profile.address.zipcode") && EEXCESS.storage.local("privacy.profile.address.city")) {
    			value += EEXCESS.storage.local("privacy.profile.address.zipcode") + ' ' + EEXCESS.storage.local("privacy.profile.address.city") + '<br>\n';
    		} else if (EEXCESS.storage.local("privacy.profile.address.city")){
    			value += EEXCESS.storage.local("privacy.profile.address.city") + '<br>\n';
    		}
    	} else if (EEXCESS.storage.local("privacy.policy.address") >= 3) {
    		if (EEXCESS.storage.local("privacy.profile.address.zipcode")) {
    			value += EEXCESS.storage.local("privacy.profile.address.zipcode") + '<br>\n';
    		}
    	}
    	if (EEXCESS.storage.local("privacy.policy.address") >= 2) {
    		if (EEXCESS.storage.local("privacy.profile.address.country")) {
    			value += EEXCESS.storage.local("privacy.profile.address.country") + '\n';
    		}
    	}
    	if (value == '<address>\n') {
    		value = 'Nothing';
    	} else {
    		value += '</address>';
    	}	
		$("div[data-eexcess-policy-field='address']").find("#disclosed").html(value);
    	break;
    case "birthdate":
    	var value = 'Nothing';;
    	switch (EEXCESS.storage.local("privacy.policy.birthdate")) {
    	case '2':
    		if (EEXCESS.storage.local("privacy.profile.birthdate")) {
    			value = EEXCESS.storage.local("privacy.profile.birthdate").split("-")[0].substr(0, 3) + '0s';
    		}
    		break;
    	case '3':
    		if (EEXCESS.storage.local("privacy.profile.birthdate")) { 
    			value = EEXCESS.storage.local("privacy.profile.birthdate").split("-")[0];
    		}
    		break;
    	case '4':
    		if (EEXCESS.storage.local("privacy.profile.birthdate")) {
    			var tmp = EEXCESS.storage.local("privacy.profile.birthdate").split("-");
    			value = tmp[0] + '-' + tmp[1];
    		}
    		break;
    	case '5':
    		if (EEXCESS.storage.local("privacy.profile.birthdate")) {
    			value = EEXCESS.storage.local("privacy.profile.birthdate");
    		}
    		break;
    	}
		$("div[data-eexcess-policy-field='birthdate']").find("#disclosed").html(value);
    	break;
    default:
    	if (EEXCESS.storage.local("privacy.policy."+fieldName) == 1) {
    		var value = EEXCESS.storage.local("privacy.profile."+fieldName);
    		if (value) {
        		$("div[data-eexcess-policy-field='" + fieldName + "']").find("#disclosed").html(value);
    		} else {
    			$("div[data-eexcess-policy-field='" + fieldName + "']").find("#disclosed").html("Undefined");
    		}
    	} else {
    		$("div[data-eexcess-policy-field='" + fieldName + "']").find("#disclosed").html("Nothing");
    	}
    	break;
    }
}

function loadTopics(topicList) {
	var jsonTopics = EEXCESS.storage.local('privacy.profile.topics');
    var topics = [];
    if(jsonTopics) {
        topics = JSON.parse(jsonTopics);
    }
    topicList.closest(".panel").find("#available").html(topics.length);
    for (var i=0;i<topics.length;i++) {
    	topicList.append('<li class="list-group-item">'
    		+ '		<div class="container" data-eexcess-policy-field="' + topics[i]['label'] + '">'
    		+ '			<span class="progress-label" style="width: 30%">' + topics[i]['label'] + '</span>'
			+ '			<div class="progress" style="width: 20%">'
			+ '				<div class="progress-bar progress-bar-success" style="width: 50%">'
			+ '					<span>Off</span>'
			+ '				</div>'
			+ '				<div class="progress-bar progress-bar-danger disable" style="width: 50%">'
			+ '					<span>On</span>'
			+ '				</div>'
			+ '			</div>'
			+ '		</div>'
			+ '</li>'
			);
    }
}

function initAvailableValue(fieldName) {
	switch (fieldName) {
	case "topics":
		var jsonTopics = EEXCESS.storage.local('privacy.profile.topics');
	    var topics = [];
	    if(jsonTopics) {
	        topics = JSON.parse(jsonTopics);
	    }
		$("div[data-eexcess-policy-field='topics']").find("#available").html(topics.length);
		break;
	case "address":
		var value = '<address>\n';
		  if (EEXCESS.storage.local("privacy.profile.address.line1")) {
			  value += EEXCESS.storage.local("privacy.profile.address.line1") + '<br>\n';
		  } 
		  if (EEXCESS.storage.local("privacy.profile.address.line2")) {
			  value += EEXCESS.storage.local("privacy.profile.address.line2") + '<br>\n';
		  }
		  if (EEXCESS.storage.local("privacy.profile.address.zipcode") && EEXCESS.storage.local("privacy.profile.address.city")) {
			  value += EEXCESS.storage.local("privacy.profile.address.zipcode") + ' ' + EEXCESS.storage.local("privacy.profile.address.city") + '<br>\n';
		  } else if (EEXCESS.storage.local("privacy.profile.address.city")){
			  value += EEXCESS.storage.local("privacy.profile.address.city") + '<br>\n';
		  }
		  if (EEXCESS.storage.local("privacy.profile.address.country")) {
			  value += EEXCESS.storage.local("privacy.profile.address.country") + '\n';
		  }
		  if (value == '<address>\n') {
			  value = 'Undefined';
		  } else {
			  value += '</address>';
		  }

  		  $("div[data-eexcess-policy-field='address']").find("#available").html(value);
		break;
	case "history":
		EEXCESS.messaging.callBG({method: {parent:'profile', func: 'getHistorySize'}, data: null}, function(results) {
			$("div[data-eexcess-policy-field='history']").find("#available").html(results.length);
		});
		break;
	default:
		var value = EEXCESS.storage.local("privacy.profile."+fieldName);
		if (value) {
			$("div[data-eexcess-policy-field='" + fieldName + "']").find("#available").html(value);
		} else {
			$("div[data-eexcess-policy-field='" + fieldName + "']").find("#available").html("Undefined");
		}
	}
} 

function initPolicyPanel() {
	var fieldName = $(this).closest(".panel").attr("data-eexcess-policy-field");
	var value =	EEXCESS.storage.local("privacy.policy."+fieldName);
    // init policy
	if (!value) {
		value = 0;
	}
	if (fieldName == "topics") {
		var jsonTopicsPolicy = EEXCESS.storage.local('privacy.profile.topics');
        var topics = [];
        if(jsonTopicsPolicy) {
            topics = JSON.parse(jsonTopicsPolicy);
        }
        for (var i=0;i<topics.length;i++) {
        	$("div[class='container'][data-eexcess-policy-field]").each(
        		function() {
        			if ($(this).attr("data-eexcess-policy-field") === topics[i]['label']) {
        				$(this).find(".progress-bar").eq(topics[i]['policy']).each(doProgressClick);
        				if(topics[i]['policy'] == 0) {
        					// Hack, simulate 2 clicks to get zero and update other info
        					$(this).find(".progress-bar").eq(topics[i]['policy']).each(doProgressClick);
        				}
        			}
        		}
        	);
        }
	}
	if($(this).find(".progress-bar").size() <= 2) {
		$(this).find(".progress-bar").eq(value).each(doProgressClick);
		if(value == 0) {
			// Hack, simulate 2 clicks to get zero and update other info
			$(this).find(".progress-bar").eq(value).each(doProgressClick);
		}
	} else {
	    // init policy
		if (value == 0) {
			value = 1;
		}
		$(this).find(".progress-bar").eq(value-1).each(doProgressClick);
	}
	initAvailableValue(fieldName);
}

(function($) {
  loadTopics($('#topicInput'));
  $(".progress-bar").click(doProgressClick);
  $(".progress").live("change",doChangeProgress);
  $(".panel-body > .progress").each(initPolicyPanel);
})(jQuery);

