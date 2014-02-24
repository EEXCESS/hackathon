var previewHandler = function(url) {
    $('<a href="' + url + '"></a>').fancybox({
        'type': 'iframe',
        'width': '90%',
        'height': '90%',
        afterShow: function() {
            // log opening the page's preview in the background script
            chrome.runtime.sendMessage(EEXCESS.extID, {method: {parent: 'logging', func: 'openedRecommendation'}, data: url});
        },
        afterClose: function(evt) {
            // log closing the page's preview in the background script
            chrome.runtime.sendMessage(EEXCESS.extID, {method: {parent: 'logging', func: 'closedRecommendation'}, data: url});
        }
    }).trigger('click');
};

var rList = EEXCESS.searchResultList($('#test'),{previewHandler:previewHandler,pathToMedia:'../../media/', pathToLibs:'../../libs/'});

$('#testForm').submit(function(evt) {
    evt.preventDefault();
    rList.loading(); // show loading bar, will be removed when new results arrive
    // send query for new results
    chrome.runtime.sendMessage(EEXCESS.extID, {method: {parent: 'model', func: 'query'}, data: [{weight: 1, text: $('#query').val()}]});
});


// update search input field on new query
    chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                if (request.method === 'newSearchTriggered') {
                    $('#query').val(request.data.query);
                }
            }
    );