var EEXCESS = EEXCESS || {};

(function() {
    localStorage['PP_BASE_URI'] = 'http://localhost:8080/eexcess-privacy-proxy/';

    // init profile
    if (!localStorage['profile.uuid']) {
        localStorage['profile.uuid'] = randomUUID();
    }
}());