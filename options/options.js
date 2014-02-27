
var EEXCESS = EEXCESS || {};

function serviceSelector() {



$('#frserver').append($('<option>', { html: 'federated recommender STABLE', value: 'fr-stable', 'data-class': 'fr-stable' } ));
$('#frserver').append($('<option>', { html: 'federated recommender DEVEL', value: 'fr-devel', 'data-class': 'fr-devel' } ));
$('#frserver').append($('<option>', { html: 'europeana', value: 'eu', 'data-class': 'eu' } ));
$('#frserver').append($('<option>', { html: 'local', value: 'self', 'data-class': 'self' } ));
$('#frserver').append($('<option>', { html: 'file', value: 'file', 'data-class': 'file' } ));

// should first read from database which is the one already chosen
if(typeof(Storage) !== 'undefined') {
    $('#frserver option[value="'+ localStorage.getItem('backend') +'"]').prop('selected', true);
}

$('#frserver').change(function () {
    console.log($('#frserver option:selected').val());
    chrome.runtime.sendMessage(chrome.i18n.getMessage('@@extension_id'),{method:{parent:'backend',func:'setProvider'},data:$('#frserver option:selected').val()});
});
}

serviceSelector();
