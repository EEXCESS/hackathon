var EEXCESS = EEXCESS || {};

EEXCESS.profile = (function() {
    // retrieve UUID from local storage or create a new one
    var _uuid;
    if (typeof (Storage) !== 'undefined') {
        _uuid = localStorage.getItem('profile.uuid');
        if (typeof _uuid === 'undefined' || _uuid === null) {
            _uuid = randomUUID();
            localStorage.setItem('profile.uuid', _uuid);
        }
    } else {
        _uuid = randomUUID();
    }

    var applyFirstnamePolicy = function() {
        if (localStorage['privacy.policy.firstname'] === 1) {
            return localStorage['privacy.profile.firstname'];
        }
        return "";
    };
    
    var applyLastnamePolicy = function() {
        if (localStorage['privacy.policy.lastname'] === 1) {
            return localStorage['privacy.profile.lastname'];
        }
        return "";
    };
    
    var _interests = function() {
        // TODO: privacy policy
        if (typeof (Storage) !== 'undefined' && localStorage["privacy.policy.topics"] !== 1) {
            var interests = JSON.parse(localStorage.getItem('privacy.profile.topics'));
            if ($.isArray(interests)) {
                // TODO: real weights
                var weighted = [];
                for (var i = 0, len = interests.length; i < len; i++) {
                	if (interests[i]['policy'] === 1) {
                		if (typeof interests[i]['uri'] !== undefined && interests[i]['uri'] !== '') {
                			weighted.push({"text": interests[i]['label'], "weight": "1.0", "uri": interests[i]['uri']});
                		} else {
                			weighted.push({"text": interests[i]['label'], "weight": "1.0"});
                		}
                	}
                }
                return weighted;
            }
        }
        return [];
    };

    var applyGenderPolicy = function() {
        if (localStorage['privacy.policy.gender'] === 1) {
            return localStorage['privacy.profile.gender'];
        }
        return "";
    };

    var applyBirthdayPolicy = function() {
    	switch (localStorage["privacy.policy.birthdate"]) {
    	case '2':
    		if (localStorage["privacy.profile.birthdate"]) {
    			return localStorage["privacy.profile.birthdate"].split("-")[0].substr(0, 3) + '0s';
    		}
    		break;
    	case '3':
    		if (localStorage["privacy.profile.birthdate"]) { 
    			return localStorage["privacy.profile.birthdate"].split("-")[0];
    		}
    		break;
    	case '4':
    		if (localStorage["privacy.profile.birthdate"]) {
    			var tmp = localStorage["privacy.profile.birthdate"].split("-");
    			return tmp[0] + '-' + tmp[1];
    		}
    		break;
    	case '5':
    		if (localStorage["privacy.profile.birthdate"]) {
    			return localStorage["privacy.profile.birthdate"];
    		}
    		break;
    	}
        return "";
    };
    
    var setAddressValue = function(field, address) {
        address[field] = localStorage['privacy.profile.address.' + field];
    };

    var applyAddressPolicy = function() {
        var address = {
            country: "",
            zipcode: "",
            city: "",
            line1: "",
            line2: ""
        };
        var level = localStorage['privacy.policy.address'];
        if (level > 1) {
            setAddressValue('country', address);
        }
        if (level > 2) {
            setAddressValue('zipcode', address);
        }
        if (level > 3) {
            setAddressValue('city', address);
        }
        if (level > 4) {
            setAddressValue('line1', address);
            setAddressValue('line2', address);
        }
        return address;
    };


    return {
        getUUID: function() {
            return _uuid;
        },
        getHistorySize: function(tabID,data,callback) {
        	if (data) {
        		chrome.history.search({'text': '', 'startTime': data, 'maxResults': 1999999999}, function(results) {
        			callback(results);
        		});
        	} else {
        		chrome.history.search({'text': '', 'startTime': 0, 'maxResults': 1999999999}, function(results) {
        			console.log(data);
        			callback(results);
        		});
        	}
        },
        getProfile: function(callback) {
    		var today = new Date();
        	var startTime = 0;
        	var maxResults = 1999999999;
        	switch(localStorage["privacy.policy.history"]) {
        	case '1':
        		startTime = 0
        		maxResults = 1
        		break;
        	case '2':
        		startTime = today.getTime() - 1000*60*60;
        		break;
        	case '3':
        		startTime = today.getTime() - 1000*60*60*24;
        		break;
        	case '4':
        		startTime = today.getTime() - 1000*60*60*24*7;
        	case '5':
        		startTime = today.getTime() - 1000*60*60*24*30;
        		break;
        	case '6':
        		startTime = today.getTime() - 1000*60*60*24*365;
        		break;
        	case '7':
        		startTime = 0;
    			break;
        	}
            chrome.history.search({'text': '', 'startTime': startTime, 'maxResults': maxResults}, function(results) {
                var profile = {
                    "eexcess-user-profile": {
                        "history": results,
                        "firstname": applyFirstnamePolicy(),
                        "lastname": applyLastnamePolicy(),
                        "gender": applyGenderPolicy(),
                        "birthdate": applyBirthdayPolicy(),
                        "address": applyAddressPolicy(),
                        "interests": {
                            "interest": _interests()
                        },
                        "context-list": {}
                    },
                    "uuid": _uuid
                };
                callback(profile);
            });
        }
    };
}());