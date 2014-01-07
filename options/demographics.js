var EEXCESS = EEXCESS || {};
EEXCESS.extID = chrome.i18n.getMessage('@@extension_id');

// obtain the current values for demographics from the background script and fill the form with them
chrome.runtime.sendMessage(EEXCESS.extID,{method: {parent:'logging',func:'getDemographics'}}, function(data) {
    for(var i=0,len=data.length; i<len;i++) {
        $('#'+data[i].name).val(data[i].value);
    }
});

// send demograhics to the background script for saving and display an according message on callback
$('#user_profile').on('submit', function(event) {
    event.preventDefault();
    console.log($(this).serializeArray());
    chrome.runtime.sendMessage(EEXCESS.extID, {method:{parent:'logging',func:'setDemographics'}, data:$(this).serializeArray()}, function(msg) {
        $('#save').text(msg).show(0,function(){
            setTimeout(function() {
                $('#save').fadeOut('slow');
            }, 1000);
        });
    });
});