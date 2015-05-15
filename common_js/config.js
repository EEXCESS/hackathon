var EEXCESS = EEXCESS || {};

EEXCESS.config = (function() {
    // init privacy policy
    if(typeof EEXCESS.storage.local('privacy.policy.address') === 'undefined') {
        EEXCESS.storage.local('privacy.policy.address', 2);
    }
    if(typeof EEXCESS.storage.local('privacy.policy.birthdate') === 'undefined') {
        EEXCESS.storage.local('privacy.policy.birthdate', 1);
    }
    if(typeof EEXCESS.storage.local('privacy.policy.firstname') === 'undefined') {
        EEXCESS.storage.local('privacy.policy.firstname', 0);
    }
    if(typeof EEXCESS.storage.local('privacy.policy.gender') === 'undefined') {
        EEXCESS.storage.local('privacy.policy.gender', 0);
    }
    if(typeof EEXCESS.storage.local('privacy.policy.history') === 'undefined') {
        EEXCESS.storage.local('privacy.policy.history', 2);
    }
    if(typeof EEXCESS.storage.local('privacy.policy.lastname') === 'undefined') {
        EEXCESS.storage.local('privacy.policy.lastname', 0);
    }
    if(typeof EEXCESS.storage.local('privacy.policy.topics') === 'undefined') {
        EEXCESS.storage.local('privacy.policy.topics', 1);
    }
    if(typeof EEXCESS.storage.local('privacy.policy.uuid') === 'undefined') {
        EEXCESS.storage.local('privacy.policy.uuid', 1);
    }
    if(typeof EEXCESS.storage.local('privacy.policy.searchContextPage') === 'undefined') {
        EEXCESS.storage.local('privacy.policy.searchContextPage', 1);
    }
    if(typeof EEXCESS.storage.local('privacy.policy.currentLocation') === 'undefined') {
        EEXCESS.storage.local('privacy.policy.currentLocation', 0);
    }

    var _PP_BASE_URI = 'http://eexcess-dev.joanneum.at/eexcess-privacy-proxy-1.0-SNAPSHOT/api/v1/';
    var _LOG_RATING_URI = _PP_BASE_URI + 'log/rating';
    var _LOG_RVIEW_URI = _PP_BASE_URI + 'log/rview';
    var _LOG_RCLOSE_URI = _PP_BASE_URI + 'log/rclose';
    var _LOG_SHOW_HIDE_URI = _PP_BASE_URI + 'log/show_hide';
    var _LOG_FACETSCAPE_URI = _PP_BASE_URI + 'log/facetScape';
    var _DISAMBIGUATE_URI = _PP_BASE_URI + 'disambiguate';
    var _LOG_QUERY_ACTIVATED_URI = _PP_BASE_URI + 'log/query_activated';
    var _NUM_RESULTS = 40;
    var _NUM_RESULTS_FACET_SCAPE = 100;
    var _TIMEOUT = function(param) {
        if(typeof param !== 'undefined') {
            // TODO add specific timeouts
            return 10000;
        }
        return 10000;
    };

    return {
        PP_BASE_URI: _PP_BASE_URI,
        LOG_RATING_URI: _LOG_RATING_URI,
        LOG_RVIEW_URI: _LOG_RVIEW_URI,
        LOG_RCLOSE_URI: _LOG_RCLOSE_URI,
        LOG_SHOW_HIDE_URI: _LOG_SHOW_HIDE_URI,
        DISAMBIGUATE_URI:_DISAMBIGUATE_URI,
        LOG_FACETSCAPE_URI:_LOG_FACETSCAPE_URI,
        LOG_QUERY_ACTIVATED_URI: _LOG_QUERY_ACTIVATED_URI,
        NUM_RESULTS: _NUM_RESULTS,
        NUM_RESULTS_FACET_SCAPE:_NUM_RESULTS_FACET_SCAPE,
        TIMEOUT: _TIMEOUT
    };
})();
