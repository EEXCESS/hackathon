// ====================== RESULT LIST ========================================//

/*
 * Creates a result list in the provided div-element and sets the correct paths (pathToMedia & pathToLibs)
 */
var rList = EEXCESS.searchResultList($('#test'), {pathToMedia: '../../media/', pathToLibs: '../../libs/'});

// populate query field initially
EEXCESS.messaging.callBG({method: {parent: 'model', func: 'getResults'}, data: null}, function(res) {
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
    EEXCESS.messaging.callBG({method: {parent: 'model', func: 'query'}, data: {terms:query,reason:{reason:'manual'}}});
});


// update search input field on new query
EEXCESS.messaging.listener(
        function(request, sender, sendResponse) {
            if (request.method === 'newSearchTriggered') {
                $('#query').val(request.data.query);
            }
        }
);
