// ====================== RESULT LIST ========================================//

/**
 * Create custom handlers for the results' preview
 * In this case, open a fancybox with the url provided in the result.
 * Please make sure to log opening/closing the preview properly (methods:
 * EEXCESS.callBG({method: {parent: 'logging', func: 'openedRecommendation'}, data: url});
 * EEXCESS.callBG({method: {parent: 'logging', func: 'closedRecommendation'}, data: url});
 */
var previewHandler = function(url) {
    $('<a href="' + url + '"></a>').fancybox({
        'type': 'iframe',
        'width': '90%',
        'height': '90%',
        afterShow: function() {
            // log opening the page's preview in the background script
            EEXCESS.callBG({method: {parent: 'logging', func: 'openedRecommendation'}, data: url});
        },
        afterClose: function(evt) {
            // log closing the page's preview in the background script
            EEXCESS.callBG({method: {parent: 'logging', func: 'closedRecommendation'}, data: url});
        }
    }).trigger('click');
};

/*
 * Creates a result list in the provided div-element with the provided handler
 * defined above and sets the correct paths (pathToMedia & pathToLibs)
 */
var rList = EEXCESS.searchResultList($('#test'), {previewHandler: previewHandler, pathToMedia: '../../media/', pathToLibs: '../../libs/'});

// populate query field initially
EEXCESS.callBG({method: {parent: 'model', func: 'getResults'}, data: null}, function(res) {
    $('#query').val(res.query);
});


// ================= CREATING NEW QUERIES (INPUT FORM FIELD) =================//

/*
 * Creates a new query, when the form is submitted.
 * Removes the current results from the list and adds the loading bar (will be
 * removed, when new results arrive).
 * Tokenizes the terms from the input field and sends them as query.
 */
$('#testForm').submit(function(evt) {
    evt.preventDefault();
    rList.loading(); // show loading bar, will be removed when new results arrive
    // split query terms
    var query_terms = $('#query').val().split(' ');
    var query = [];
    for (var i = 0; i < query_terms.length; i++) {
        var tmp = {
            weight: 1,
            text: query_terms[i]
        };
        query.push(tmp);
    }
    // send query for new results
    EEXCESS.callBG({method: {parent: 'model', func: 'query'}, data: query});
});


// update search input field on new query
EEXCESS.messageListener(
        function(request, sender, sendResponse) {
            if (request.method === 'newSearchTriggered') {
                $('#query').val(request.data.query);
            }
        }
);