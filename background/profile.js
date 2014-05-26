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

    var _interests = function() {
        // TODO: privacy policy
        if (typeof (Storage) !== 'undefined') {
            var interests = JSON.parse(localStorage.getItem('privacy.profile.topics'));
            if ($.isArray(interests)) {
                // TODO: real weights
                var weighted = [];
                for (var i = 0, len = interests.length; i < len; i++) {
                    if (typeof interests[i]['uri'] !== undefined && interests[i]['uri'] !== '') {
                        weighted.push({"text": interests[i]['label'], "weight": "1.0", "uri": interests[i]['uri']});
                    } else {
                        weighted.push({"text": interests[i]['label'], "weight": "1.0"});
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
        var level = localStorage['privacy.policy.geolocation'];
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
        }
        if (level > 5) {
            setAddressValue('line2', address);
        }
        return address;
    };

    var applyGenderPolicy = function() {
        if (localStorage['privacy.policy.gender'] > 0) {
            return localStorage['privacy.profile.gender'];
        }
        return "";
    };


    return {
        getUUID: function() {
            return _uuid;
        },
        getProfile: function(callback) {
            chrome.history.search({'text': '', 'maxResults': parseInt(localStorage['privacy.policy.history'])}, function(results) {
                var profile = {
                    "eexcess-user-profile": {
                        "history": results,
                        "firstname": localStorage['privacy.profile.firstname'],
                        "lastname": localStorage['privacy.profile.lastname'],
                        "gender": applyGenderPolicy(),
                        "birthdate": localStorage['privacy.profile.birthdate'],
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