var EEXCESS = EEXCESS || {};

EEXCESS.config = (function() {
    var _PP_BASE_URI = 'http://eexcess-dev.joanneum.at/eexcess-privacy-proxy/api/v1/';
    var _LOG_RATING_URI = _PP_BASE_URI + 'log/rating';
    var _LOG_RVIEW_URI = _PP_BASE_URI + 'log/rview';
    var _LOG_RCLOSE_URI = _PP_BASE_URI + 'log/rclose';
    var _LOG_SHOW_HIDE_URI = _PP_BASE_URI + 'log/show_hide';
    var _LOG_FACETSCAPE_URI = _PP_BASE_URI + 'log/facetScape';
    var _DISAMBIGUATE_URI = _PP_BASE_URI + 'disambiguate';
    var _LOG_QUERY_ACTIVATED_URI = _PP_BASE_URI + 'log/query_activated';

    return {
        PP_BASE_URI: _PP_BASE_URI,
        LOG_RATING_URI: _LOG_RATING_URI,
        LOG_RVIEW_URI: _LOG_RVIEW_URI,
        LOG_RCLOSE_URI: _LOG_RCLOSE_URI,
        LOG_SHOW_HIDE_URI: _LOG_SHOW_HIDE_URI,
        DISAMBIGUATE_URI:_DISAMBIGUATE_URI,
        LOG_FACETSCAPE_URI:_LOG_FACETSCAPE_URI,
        LOG_QUERY_ACTIVATED_URI: _LOG_QUERY_ACTIVATED_URI
    };
})();