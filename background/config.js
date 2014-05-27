var EEXCESS = EEXCESS || {};

(function() {
    if (!localStorage['PP_BASE_URI']) {
        localStorage['PP_BASE_URI'] = 'http://localhost:8080/eexcess-privacy-proxy/';
    }

    // init profile
    if (!localStorage['profile.uuid']) {
        localStorage['profile.uuid'] = randomUUID();
    }

    // init policy
    localStorage['privacy.policy.geolocation'] = 6;
    localStorage['privacy.policy.gender'] = 1;
    localStorage['privacy.policy.history'] = 20;
}());