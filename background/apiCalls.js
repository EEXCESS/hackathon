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
EEXCESS.euCall = function(weightedTerms, start, success, error) {
    var query = '';
    for(i = 0; i < 3; i++) {
        if(typeof weightedTerms[i] !== 'undefined') {
            query += weightedTerms[i].text + ' ';
        } else {
            break;
        }
    }
    var x = [];
    console.log(typeof x);
    var _facets = function(item) {
        var facet_list = {};
        var facets = [
            'type',
            'subject',
            'year',
            'language',
            'provider',
            'contributor',
            'data_provider',
            'rights',
            'ugc',
            'usertags'
        ];
        for (var i = 0, len = facets.length; i < len; i++) {
            var key = facets[i];
            if (typeof item[key] !== "undefined") {
                if (typeof item[key] === "object") {
                    facet_list[key] = item[key][0];
                } else {
                    facet_list[key] = item[key];
                }
            }
        }
        return facet_list;
    };
    console.log('query: ' + query + ' start:' + start);
    var xhr = $.ajax('http://europeana.eu/api//v2/search.json?wskey='
            + EEXCESS.apiKeyEuropeana
            + '&query=' + query
            + '&start=' + start
            + '&rows=96&profile=standard');
    xhr.done(function(data) {
        console.log(data);
        if (data.totalResults !== 0) {
            $.map(data.items, function(n, i) {
                n.uri = n.guid;
            });
            data.results = data.items;
            delete data.items;
            for (var i = 0, len = data.results.length; i < len; i++) {
                data.results[i].facets = _facets(data.results[i]);
            }
        }
        console.log(data);
        success(data);
    });
    xhr.fail(function(textStatus) {
        error(textStatus.statusText);
    });
};

EEXCESS.frCall = function(weightedTerms, start, success, error) {
    console.log('start:' + start + 'query: ');
    console.log(weightedTerms);
    var profile = {
        "eexcess-user-profile": {
            "interests": {
                "interest": []
            },
            "context-list": {
                "context": weightedTerms
            }
        }
    };
    console.log(profile);
    var xhr = $.ajax({
        url: 'http://digv536.joanneum.at/eexcess-privacy-proxy/api/v1/recommend',
        data: JSON.stringify(profile),
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json'
    });
    xhr.done(function(data) {     
        console.log(data);
        success(data);
    });
    xhr.fail(function( jqXHR, textStatus, errorThrown) {
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
        error(textStatus.statusText);
    });
};