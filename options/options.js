
var EEXCESS = EEXCESS || {};

function serviceSelector() {



$('#frserver').append($('<option>', { html: 'federated recommender STABLE', value: 'fr-stable', 'data-class': 'fr-stable' } ));
$('#frserver').append($('<option>', { html: 'federated recommender DEVEL', value: 'fr-devel', 'data-class': 'fr-devel' } ));
$('#frserver').append($('<option>', { html: 'europeana', value: 'eu', 'data-class': 'eu' } ));
$('#frserver').append($('<option>', { html: 'local', value: 'self', 'data-class': 'self' } ));
$('#frserver').append($('<option>', { html: 'file', value: 'file', 'data-class': 'file' } ));
// should first read from database which is the one already chosen
$('#frserver option[value="fr-stable"]').prop('selected', true);

$('#frserver').change(function () {

//var test1 = localStorage['DBCall'];


    switch($('#frserver option:selected').val()){
    case 'eu':
        console.log("changing rCall to europeana");
		/*
		EEXCESS.frCall = EEXCESS.euCall;
		//////////////
		EEXCESS.frUrl  = 'http://digv536.joanneum.at/eexcess-privacy-proxy/api/v1/recommend';
		*/
		//localStorage['DBCall'] = "euCall";
		localStorage['DBCall'] = JSON.stringify({call:"euCall",url:'http://digv536.joanneum.at/eexcess-privacy-proxy/api/v1/recommend'});
	break;
    case 'fr-devel':
        console.log("changing rCall to fr-devel");
		/*
		EEXCESS.frCall = EEXCESS.frCall_impl;
		EEXCESS.frUrl  = 'http://digv539.joanneum.at/eexcess-privacy-proxy/api/v1/recommend';
		*/
		
		//localStorage['DBCall'] = "frCall_impl";
		localStorage['DBCall'] = JSON.stringify({call:"frCall_impl",url:'http://digv539.joanneum.at/eexcess-privacy-proxy/api/v1/recommend'});
	break;
    case 'file':
    case 'local':
    case 'fr-stable':
        console.log("changing rCall to fr-stable");
		/// should set this in the DB
		/*
		EEXCESS.frCall = EEXCESS.frCall_impl;
		EEXCESS.frUrl  = 'http://digv536.joanneum.at/eexcess-privacy-proxy/api/v1/recommend';
		*/
		localStorage['DBCall'] = JSON.stringify({call:"frCall_impl",url:'http://digv536.joanneum.at/eexcess-privacy-proxy/api/v1/recommend'});
	break;
    }
});
}

serviceSelector();
