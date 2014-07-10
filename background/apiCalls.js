/**
 * Extend the String object with a 'startsWith' method
 */
if (typeof String.prototype.startsWith !== 'function') {
    /**
     * Checks, if a string-object starts with the provided term
     * @global
     * @param {String} str the term to check
     * @returns {Boolean} true, if the string starts with the provided term, otherwise false
     */
    String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) === str;
    };
}

var EEXCESS = EEXCESS || {};

/**
 * Sends a query with the specified parameters to europeana and hands the results
 * to the success callback or the error message to the error callback.
 * @memberOf EEXCESS
 * @param {Object} queryData data containing the weighted query terms in queryData['terms'] and the reason for the query in queryData['reason']. The function accepts only a list of weighted query terms as well.
 * @param {Integer} start Item in the results to start with (first item is 1)
 * @param {querySuccess} success callback on success, receives the retrieved results as parameter
 * @param {queryError} error callback on error, receives the error message as parameter
 */
EEXCESS.euCall = function(queryData, start, success, error) {
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
    var xhr = $.ajax(EEXCESS.backend.getURL()
            + '&query=' + query
            + '&start=' + start
            + '&rows=96&profile=standard');
    xhr.done(function(data) {
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
        }
        console.log(data);
        success(data);
    });
    xhr.fail(function(textStatus) {
        error(textStatus.statusText);
    });
};

/**
 * Sends a query with the specified parameters to an API-endpoint
 * @param {Object} queryData either the weighted query terms directly or containing the weighted query terms in "terms" and a reason for the query in "reason" 
 * @param {Integer} start pagination index to start with in the result list
 * @param {Function} success success callback, receives the retrieved results as parameter
 * @param {Function} error error callback, receives the error message as parameter
 */
EEXCESS.frCall_impl = function(queryData, start, success, error) {
    var weightedTerms;
    if (queryData.hasOwnProperty('reason')) {
        weightedTerms = queryData['terms'];
    } else {
        weightedTerms = queryData;
    }
    EEXCESS.profile.getProfile(function(profile) {
        profile['contextKeywords'] = weightedTerms;
        if (queryData.hasOwnProperty('reason')) {
            for(var i=0,len= weightedTerms.length; i < len; i++) {
                profile['contextKeywords'][i]['reason'] = queryData['reason']['reason'];
            }
        }
        var xhr = $.ajax({
            url: EEXCESS.backend.getURL(),
            data: JSON.stringify(profile),
            type: 'POST',
            contentType: 'application/json; charset=UTF-8',
            dataType: 'json'
        });
        xhr.done(function(data) {
            console.log(data);
            data['results'] = data['result'];
            delete data['result'];
            success(data);
        });
        xhr.fail(function(jqXHR, textStatus, errorThrown) {
            console.log(jqXHR);
            console.log(textStatus);
            console.log(errorThrown);
            error(textStatus);
        });
    });
};


// set provider call function and url according to the provided value 
// if an inappropriate value is given, set it to fr-stable
EEXCESS.backend = (function() {
    var call = EEXCESS.frCall_impl;
    var url = 'http://eexcess.joanneum.at/eexcess-privacy-proxy/api/v1/recommend';
    var fr_url = 'http://eexcess.joanneum.at/eexcess-privacy-proxy/api/v1/recommend';
    var backend = 'fr-stable';

    return {
        setProvider: function(tabID, provider) {
            backend = provider;
                EEXCESS.storage.local('backend', provider);
            switch (provider) {
                case 'eu':
                    console.log('eu');
                    call = EEXCESS.euCall;
                    url = 'http://europeana.eu/api//v2/search.json?wskey=HT6JwVWha';
                    break;
                case 'fr-devel':
                    console.log('fr-devel');
                    call = EEXCESS.frCall_impl;
                    url = 'http://eexcess-dev.joanneum.at/eexcess-privacy-proxy/api/v1/recommend';
                    break;
                case 'fr-stable':
                    console.log('fr-stable');
                    call = EEXCESS.frCall_impl;
                    url = 'http://eexcess.joanneum.at/eexcess-privacy-proxy/api/v1/recommend';
                    break;
                case 'self':
                    console.log('self');
                    call = EEXCESS.frCall_impl;
                    url = 'http://eexcess.joanneum.at/eexcess-privacy-proxy/api/v1/recommend';
                    fr_url = url;
                        var local_url = EEXCESS.storage.local('local_url');
                        if (typeof local_url !== 'undefined' && local_url !== null) {
                            url = local_url;
                        }
                        var local_fr_url = EEXCESS.storage.local('federated_url');
                        if (typeof local_fr_url !== 'undefined' && local_fr_url !== null) {
                            fr_url = local_fr_url;
                        }
            }
        },
        setURL: function(tabID, urls) {
            EEXCESS.storage.local('local_url', urls.pp);
            EEXCESS.storage.local('federated_url', urls.fr);
            url = urls.pp;
            fr_url = urls.fr;
        },
        getURL: function() {
            if (backend === 'self') {
                return (url + '?fr_url=' + fr_url);
            }
            return url;
        },
        getCall: function() {
            return call;
        }
    };
}());

// retrieve provider from local storage or set it to 'fr-stable'
if (typeof EEXCESS.storage.local('backend') !== 'undefined') {
    EEXCESS.backend.setProvider(-1, EEXCESS.storage.local('backend'));
} else {
    EEXCESS.backend.setProvider(-1, 'fr-stable');
}