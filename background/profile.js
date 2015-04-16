var EEXCESS = EEXCESS || {};

EEXCESS.profile = (function() {
    // retrieve UUID from local storage or create a new one
    var _uuid;
    _uuid = EEXCESS.storage.local('privacy.profile.uuid');
    if (typeof _uuid === 'undefined' || _uuid === null) {
        _uuid = randomUUID();
        EEXCESS.storage.local('privacy.profile.uuid', _uuid);
    }

    var applyFirstnamePolicy = function() {
        if (EEXCESS.storage.local('privacy.policy.firstname') === 1 || "1") {
            return EEXCESS.storage.local('privacy.profile.firstname');
        }
        return "";
    };

    var applyLastnamePolicy = function() {
        if (EEXCESS.storage.local('privacy.policy.lastname') === 1 || "1") {
            return EEXCESS.storage.local('privacy.profile.lastname');
        }
        return "";
    };

    var _interests = function() {
        if (EEXCESS.storage.local("privacy.policy.topics") !== 1 && typeof EEXCESS.storage.local("privacy.profile.topics") !== 'undefined') {
            var interests = JSON.parse(EEXCESS.storage.local('privacy.profile.topics'));
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
        if (EEXCESS.storage.local('privacy.policy.gender') === 1 || "1") {
            return EEXCESS.storage.local('privacy.profile.gender');
        }
        return "";
    };

    var applyUuidPolicy = function() {
        if (JSON.parse(EEXCESS.storage.local('privacy.policy.uuid')) === 1) {
            return _uuid;
        }
        return "";
    };

    var applyBirthdayPolicy = function() {
        switch (EEXCESS.storage.local("privacy.policy.birthdate")) {
            case '2':
                if (EEXCESS.storage.local("privacy.profile.birthdate")) {
                    return EEXCESS.storage.local("privacy.profile.birthdate").split("-")[0].substr(0, 3) + '0';
                }
                break;
            case '3':
                if (EEXCESS.storage.local("privacy.profile.birthdate")) {
                    return EEXCESS.storage.local("privacy.profile.birthdate").split("-")[0];
                }
                break;
            case '4':
                if (EEXCESS.storage.local("privacy.profile.birthdate")) {
                    var tmp = EEXCESS.storage.local("privacy.profile.birthdate").split("-");
                    return tmp[0] + '-' + tmp[1] + '-01';
                }
                break;
            case '5':
                if (EEXCESS.storage.local("privacy.profile.birthdate")) {
                    return EEXCESS.storage.local("privacy.profile.birthdate");
                }
                break;
        }
        return "";
    };

    var setAddressValue = function(field, address) {
        address[field] = EEXCESS.storage.local('privacy.profile.address.' + field);
    };

    var applyAddressPolicy = function() {
        var address = {
            country: "",
            zipCode: "",
            city: "",
            line1: "",
            line2: ""
        };
        var level = EEXCESS.storage.local('privacy.policy.address');
        if (level > 1) {
            setAddressValue('country', address);
        }
        if (level > 2) {
            setAddressValue('zipCode', address);
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
    
    // obtain list of selected sources
    var getPartnerList = function() {
        var partners = EEXCESS.storage.local('selected_sources');
        if(typeof partners === 'undefined') {
            return [{"systemId":"Europeana"},{"systemId":"Mendeley"},{"systemId":"ZBW"},{"systemId":"KIMCollect"}];
        } else {
            partners = JSON.parse(partners);
            var partnerList = [];
            $.each(partners, function(index,value) {
                partnerList.push({"systemId":value});
            });
            return partnerList;
        }
    };
    
    var applyLocationPolicy = function() {
        if(JSON.parse(EEXCESS.storage.local('privacy.policy.currentLocation')) === 1) {
            return JSON.parse(EEXCESS.storage.local('privacy.profile.currentLocation'));
        } else {
            return [];
        }
    };


    return {
        getUUID: function() {
            return applyUuidPolicy();
        },
        getHistorySize: function(tabID, data, callback) {
            if (data) {
                EEXCESS.history.search({'text': '', 'startTime': data, 'maxResults': 1999999999}, function(results) {
                    callback(results);
                });
            } else {
                EEXCESS.history.search({'text': '', 'startTime': 0, 'maxResults': 1999999999}, function(results) {
                    callback(results);
                });
            }
        },
        getProfile: function(callback) {
//            var today = new Date();
//            var startTime = 0;
//            var maxResults = 1999999999;
//            switch (EEXCESS.storage.local("privacy.policy.history")) {
//                case '1':
//                    startTime = 0
//                    maxResults = 0
//                    break;
//                case '2':
//                    startTime = today.getTime() - 1000 * 60 * 60;
//                    break;
//                case '3':
//                    startTime = today.getTime() - 1000 * 60 * 60 * 24;
//                    break;
//                case '4':
//                    startTime = today.getTime() - 1000 * 60 * 60 * 24 * 7;
//                    break;
//                case '5':
//                    startTime = today.getTime() - 1000 * 60 * 60 * 24 * 30;
//                    break;
//                case '6':
//                    startTime = today.getTime() - 1000 * 60 * 60 * 24 * 365;
//                    break;
//                case '7':
//                    startTime = 0;
//                    break;
//            }
//            EEXCESS.history.search({'text': '', 'startTime': startTime, 'maxResults': maxResults}, function(results) {
//                for(var i=0, len=results.length; i<len; ++i) {
//                    delete results[i]['id'];
//                    results[i]['lastVisitTime'] = results[i]['lastVisitTime'].toFixed(0);
//                }
                var profile = {
                    //"history": results,
//                    "partnerList": getPartnerList(),
                    "firstName": applyFirstnamePolicy(),
                    "lastName": applyLastnamePolicy(),
                    "gender": applyGenderPolicy(),
                    "birthDate": applyBirthdayPolicy(),
                    "address": applyAddressPolicy(),
                    "interests": _interests(),
                    "contextKeywords": {},
                    "uuid": applyUuidPolicy(),
                    "userLocations": applyLocationPolicy()
                };
                callback(profile);
//            });
        }
    };
}());
