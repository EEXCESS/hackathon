var EEXCESS = EEXCESS || {};
/**
 * @memberof EEXCESS
 * @type String
 */
EEXCESS.apiKeyEuropeana = 'HT6JwVWha';
/**
 * Sends a query with the specified parameters to europeana and hands the results
 * to the success callback or the error message to the error callback.
 * @memberOf EEXCESS
 * @param {String} query The query term 
 * @param {Integer} start Item in the results to start with (first item is 1)
 * @param {querySuccess} success callback on success
 * @param {queryError} error callback on error
 */
EEXCESS.euCall = function(query, start, success, error) {
    console.log('query: ' + query + ' start:' + start);
    var xhr = $.ajax('http://europeana.eu/api//v2/search.json?wskey='
            + EEXCESS.apiKeyEuropeana
            + '&query=' + query
            + '&start=' + start
            + '&rows=96&profile=standard');
    xhr.done(function(data) {;
        success(data);
    });
    xhr.fail(function(textStatus) {
        error(textStatus.statusText);
    });
};