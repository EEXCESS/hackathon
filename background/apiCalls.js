var EEXCESS = EEXCESS || {};

EEXCESS.qXHR;

/**
 * Sends a query with the specified parameters to europeana and hands the results
 * to the success callback or the error message to the error callback.
 * @memberOf EEXCESS
 * @param {Object} queryData data containing the weighted query terms in queryData['terms'] and the reason for the query in queryData['reason']. The function accepts only a list of weighted query terms as well.
 * @param {Integer} start Item in the results to start with (first item is 1)
 * @param {querySuccess} success callback on success, receives the retrieved results as parameter
 * @param {queryError} error callback on error, receives the error message as parameter
 */
EEXCESS.euCall = function(queryData, start, numResults, success, error) {
    var weightedTerms;
    if (queryData.hasOwnProperty('reason')) {
        weightedTerms = queryData['terms'];
    } else {
        weightedTerms = queryData;
    }
    var query = '';
    for (i = 0; i < 3; i++) {
        if (typeof weightedTerms[i] !== 'undefined') {
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
            'dataProvider',
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
    if (EEXCESS.qXHR && EEXCESS.qXHR.readystate !== 4) {
        EEXCESS.qXHR.abort();
    }
    EEXCESS.qXHR = $.ajax(EEXCESS.backend.getURL()
            + '&query=' + query
            + '&start=' + start
            + '&rows=96&profile=standard');
    EEXCESS.qXHR.done(function(data) {
        console.log(data);
        if (data.totalResults !== 0) {
            $.map(data.items, function(n, i) {
                n.uri = n.guid;
                n.previewImage = n.edmPreview;
                delete n.edmPreview;
            });
            data.results = data.items;
            delete data.items;
            for (var i = 0, len = data.results.length; i < len; i++) {
                data.results[i].facets = _facets(data.results[i]);
                data.results[i].facets.provider = 'Europeana';
                if (data.results[i].title instanceof Array) {
                    data.results[i].title = data.results[i].title[0];
                }
            }
        } else {
            data.results = [];
        }
        console.log(data);
        success(data);
    });
    EEXCESS.qXHR.fail(function(jqxhr, textStatus, errorThrown) {
        if(textStatus !== 'abort') {
            console.log(jqxhr);
            console.log(textStatus);
            console.log(errorThrown);
            error(textStatus);
        } 
    });
};

/**
 * Sends a query with the specified parameters to an API-endpoint
 * @param {Object} queryData either the weighted query terms directly or containing the weighted query terms in "terms" and a reason for the query in "reason" 
 * @param {Integer} start pagination index to start with in the result list
 * @param {Function} success success callback, receives the retrieved results as parameter
 * @param {Function} error error callback, receives the error message as parameter
 */
EEXCESS.frCall_impl = function(queryData, start, numResults, success, error) {
    var weightedTerms;
    if (queryData.hasOwnProperty('reason')) {
        weightedTerms = queryData['terms'];
    } else {
        weightedTerms = queryData;
    }
    EEXCESS.profile.getProfile(function(profile) {
        profile['contextKeywords'] = weightedTerms;
        var q = '';
        for (var i = 0; i < weightedTerms.length; i++) {
            q += weightedTerms[i].text;
        }
        profile['queryID'] = '' + EEXCESS.djb2Code(q) + new Date().getTime();
        profile['numResults'] = numResults;

        if (queryData.hasOwnProperty('reason')) {
            profile['context'] = queryData['reason'];
            // apply query context policy
            if (profile['context']['reason'] === 'page' && JSON.parse(EEXCESS.storage.local("privacy.policy.searchContextPage")) !== 1) {
                profile['context']['value'] = 'disabled';
            }
        }
        
        if (queryData.hasOwnProperty('contextNamedEntities')) {
            profile['contextNamedEntities'] = queryData.contextNamedEntities;
        }
        if (EEXCESS.qXHR && EEXCESS.qXHR.readystate !== 4) {
            EEXCESS.qXHR.abort();
        }
        EEXCESS.qXHR = $.ajax({
            url: 'http://eexcess-dev.joanneum.at/eexcess-privacy-proxy-1.0-SNAPSHOT/api/v1/recommend',
            data: JSON.stringify(profile),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json',
            timeout: EEXCESS.config.TIMEOUT()
        });
        EEXCESS.qXHR.done(function(data) {
            console.log(data);
            data['results'] = data['result'];
            delete data['result'];
            success(data);
        });
        EEXCESS.qXHR.fail(function(jqXHR, textStatus, errorThrown) {
            if(textStatus !== 'abort') {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            error(textStatus);
            }
        });
    });
};


// set provider call function and url according to the provided value 
// if an inappropriate value is given, set it to fr-stable
EEXCESS.backend = (function() {
    return {
        getCall: function() {
            return EEXCESS.frCall_impl;
        }
    };
}());

