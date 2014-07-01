
var EEXCESS = EEXCESS || {};

function serviceSelector() {



$('#frserver').append($('<option>', { html: 'privacy proxy STABLE', value: 'fr-stable', 'data-class': 'fr-stable' } ));
$('#frserver').append($('<option>', { html: 'privacy proxy DEVEL', value: 'fr-devel', 'data-class': 'fr-devel' } ));
$('#frserver').append($('<option>', { html: 'europeana', value: 'eu', 'data-class': 'eu' } ));
$('#frserver').append($('<option>', { html: 'local', value: 'self', 'data-class': 'self' } ));
$('#frserver').append($('<option>', { html: 'file', value: 'file', 'data-class': 'file' } ));


// initialize urls
EEXCESS.federated_url = 'http://eexcess.joanneum.at/eexcess-privacy-proxy/api/v1/recommend';
EEXCESS.local_url = 'http://eexcess.joanneum.at/eexcess-privacy-proxy/api/v1/recommend';

// should first read parameters for backend from local storage
    var selected_backend = EEXCESS.storage.local('backend');
    $('#frserver option[value="'+ selected_backend +'"]').prop('selected', true);
    if(selected_backend === 'self') {
        $('#local_url').show();
    } else {
        $('#local_url').hide();
    }
    // federated recommender local
    var ls_federated_url = EEXCESS.storage.local('federated_url');
    if(typeof ls_federated_url !== 'undefined' && ls_federated_url !== null) {
        EEXCESS.federated_url = ls_federated_url;
    } else {
        EEXCESS.storage.local('federated_url', EEXCESS.federated_url);
    }
    
    // privacy proxy local
    var ls_local_url = EEXCESS.storage.local('local_url');
    if(typeof ls_local_url !== 'undefined' && ls_local_url !== null) {
        EEXCESS.local_url = ls_local_url;
    } else {
        EEXCESS.storage.local('local_url', EEXCESS.local_url);
    }

$('#custom_fr_url').val(EEXCESS.federated_url);
$('#custom_url').val(EEXCESS.local_url);

$('#frserver').change(function () {
    var option = $('#frserver option:selected').val();
    if(option === 'self') {
        $('#local_url').show();
    } else {
        $('#local_url').hide();
    }
    chrome.runtime.sendMessage(chrome.i18n.getMessage('@@extension_id'),{method:{parent:'backend',func:'setProvider'},data:$('#frserver option:selected').val()});
});
}

$('#local_url').submit(function() {
    chrome.runtime.sendMessage(chrome.i18n.getMessage('@@extension_id'),{method:{parent:'backend',func:'setURL'},data:{pp:$('#custom_url').val(),fr:$('#custom_fr_url').val()}});
    $('#info_msg').text('changes applied').show();
    window.setTimeout(function() {$('#info_msg').fadeOut();}, 1000);
    return false;
});

serviceSelector();
