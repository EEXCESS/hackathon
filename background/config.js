var EEXCESS = EEXCESS || {};

(function() {
    localStorage['PP_BASE_URI'] = 'http://eexcess.joanneum.at/eexcess-privacy-proxy/';

    // init profile
    if (!localStorage['profile.uuid']) {
        localStorage['profile.uuid'] = randomUUID();
    }

}());