var EEXCESS = EEXCESS || {};

/**
 * Encapsulates functionality for the model of the eexcess widget
 * @namespace EEXCESS.model
 */
EEXCESS.model = (function() {
    // init location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var loc = [{
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                }];
            EEXCESS.storage.local('privacy.profile.currentLocation', JSON.stringify(loc));
        });
    } else {
        EEXCESS.storage.local('privacy.profile.currentLocation', JSON.stringify([]));
    }

    // general widget parameters
    var params = {
        visible: false,
        tab: 'results'
    };

    var currentQuery = {};

    var resultPage = false;
    /**
     * Represents the current query and according results
     */
    var results = {
        query: 'Search',
        data: null,
        weightedTerms: null
    };

    /*
     * retrieved results from automatic queries which are cached until the user activates them
     */
    var cachedResult = {};

    var openResult = null;

    EEXCESS.browserAction.clickedListener(function(tab) {
        EEXCESS.browserAction.getBadgeText({}, function(badgeText) {
            if (badgeText === '') {
                EEXCESS.model.toggleVisibility(tab.id, tab.url);
            } else {
                results = cachedResult;
                EEXCESS.browserAction.setBadgeText({text: ""});
                if (!params.visible) {
                    EEXCESS.model.toggleVisibility(tab.id, tab.url);
                }

                // log activated query
                if (results['weightedTerms'] !== null) {
                    EEXCESS.logging.logQuery(tab.id, results['weightedTerms'], new Date().getTime(), '');
                    EEXCESS.messaging.sendMsgAllTabs({
                        method: 'newSearchTriggered',
                        data: {query: cachedResult.query, results: cachedResult.data}
                    });
                }
            }
        });
    });

    // --- listeners for closing a result view --- //
    EEXCESS.tabs.activatedListener(function(activeInfo) {
        if (openResult !== null && activeInfo.tabId !== openResult.id) {
            EEXCESS.logging.closedRecommendation(openResult.url);
            openResult = null;
        }
    });
    EEXCESS.tabs.updateListener(function(tabId, changeInfo, tab) {
        if (openResult !== null && tabId === openResult.id) {
            if (typeof changeInfo['url'] !== 'undefined' && changeInfo.url !== openResult.url) {
                EEXCESS.logging.closedRecommendation(openResult.url);
                openResult = null;
            }
        }
    });
    EEXCESS.tabs.removedListener(function(tabId, removeInfo) {
        if (openResult !== null && tabId === openResult.id) {
            EEXCESS.logging.closedRecommendation(openResult.url);
            openResult = null;
        }
    });
    EEXCESS.windows.focusChangedListener(function(windowID) {
        if (openResult !== null && windowID === EEXCESS.windows.WINDOW_ID_NONE) {
            EEXCESS.logging.closedRecommendation(openResult.url);
            openResult = null;
        }
    });
    // -------------------------------------------- //

    var _handleResult = function(res) {
        var execute = function(items) {
            res.data.results = items;
            if (!params.visible || resultPage) {
                cachedResult = res;
                EEXCESS.browserAction.setBadgeText({text: "" + res.data.totalResults});
            } else {
                EEXCESS.browserAction.setBadgeText({text: ""});
                results = res;
                EEXCESS.messaging.sendMsgAllTabs({
                    method: 'newSearchTriggered',
                    data: {query: results.query, results: results.data, ne:results.NE}
                });
            }
        };

        // update ratings first
        EEXCESS.storage.getRatings(res.data.results, execute, function() {
            execute(res.data.results);
        });
    };


    /**
     * Update results to a query with ratings from the database and send each
     * updated result to all tabs
     * @memberOf EEXCESS.model
     * @param {Array.<Recommendation>} items The results, for which to retrieve 
     * ratings
     */
    var _updateRatings = function(items) {
        var offset = results.data.results.length - items.length;
        for (var i = 0, len = items.length; i < len; i++) {
            if (typeof items[i].uri !== 'undefined') {
                EEXCESS.annotation.getRating(items[i].uri, {query: results.query}, function(score) {
                    results.data.results[this.pos].rating = score;
                    EEXCESS.messaging.sendMsgAllTabs({
                        method: {parent: params.tab, func: 'rating'},
                        data: {uri: this.uri, score: score}
                    });
                }.bind({pos: i + offset, uri: items[i].uri}));
            }
        }
    };
    var _queryTimestamp;
    
    var _getDomain = function(hostname) {
        var domain = hostname.substring(0,hostname.lastIndexOf('.'));
        if(domain.indexOf('.') === -1) {
            return domain;
        } else {
            return domain.substr(domain.indexOf('.')+1);
        }
    };
    
    
    var _replayQuery = function(tabID, numResults, callback) {
            var replayData = {
                reason: 'replay',
                terms: currentQuery['terms'],
                numResults: numResults
            };
            console.log(replayData);
            var success = function(results) {
                _handleResult({query:currentQuery['query'],data: results});
                callback({query:currentQuery['query'],results:results});
            };
            var error = function(error) { // error callback
                EEXCESS.messaging.sendMsgTab(tabID, {method: {parent: 'results', func: 'error'}, data: error});
            };
            EEXCESS.backend.getCall()(replayData, 1, numResults, success, error);
        };
    
    return {
        /**
         * Toggles the visibility of the widget
         * @memberOf EEXCESS.model
         * @param {Integer} tabID identifier of the tab, the toggling request originates
         * @param {String} url the url of the current page
         * @returns {Boolean} true if visible, otherwise false
         */
        toggleVisibility: function(tabID, url) {
            var _finally = function(url) {
                params.visible = !params.visible;
                var xhr = $.ajax({
                    url: EEXCESS.config.LOG_SHOW_HIDE_URI,
                    data: JSON.stringify({visible: params.visible, uuid: EEXCESS.profile.getUUID(), currentPage: url}),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: 'json'
                });
                EEXCESS.messaging.sendMsgAllTabs({method: 'visibility', data: params.visible});
            };
            if (url === -1) {
                EEXCESS.tabs.get(tabID, function(tab) {
                    _finally(tab.url);
                });
            } else {
                _finally(url);
            }
        },
        /**
         * Executes the following functions:
         * - log the query
         * - set widget's tab to 'results'
         * - query API-endpoint
         * After a successful query to the endpoint, the obtained results will be
         * logged in the database and enriched with ratings from the database.
         * Furthermore they are set as the current results in the widget's model.
         * At logging the recommendations, query is added as context.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Object} data The query data 
         */
        query: function(tabID, data) {
            EEXCESS.browserAction.setBadgeText({text: ""});
            console.log(data);
            var tmp = {};
            _queryTimestamp = new Date().getTime();
            resultPage = false;
            if (data.hasOwnProperty('reason')) {
                tmp['weightedTerms'] = data['terms'];
                tmp['reason'] = data['reason'];

                // check if automatic query was triggered by viewing the detail page of a result
                if (data['reason'].hasOwnProperty('url')) {
                    var result_url = data.reason.url;
                    delete tmp.reason.url;
                    if (results.data !== null) {
                        for (var i = 0; i < results.data.results.length; i++) {
                            var parser = document.createElement('a');
                            parser.href = results.data.results[i].eexcessURI;
                            if (_getDomain(parser.hostname) === _getDomain(result_url)) {
                                resultPage = true;
                                break;
                            }
                        }
                    }
                }
            } else {
                tmp['weightedTerms'] = data;
            }
            tmp['query'] = '';
            for (var i = 0, len = tmp['weightedTerms'].length; i < len; i++) {
                tmp['query'] += tmp['weightedTerms'][i].text;
                if (i < len - 1) {
                    tmp['query'] += ' ';
                }
            }
            if (tmp['query'] === '') {
                EEXCESS.messaging.sendMsgTab(tabID, {method: {parent: 'results', func: 'error'}, data: 'query is empty...'});
                return;
            }

            // set how many results to retrieve
            var numResults = EEXCESS.config.NUM_RESULTS;
            if (data.hasOwnProperty('numResults')) {
                numResults = data.numResults;
            }

            if (tmp.hasOwnProperty('reason') && tmp['reason']['reason'] !== 'manual' && !resultPage) {
                EEXCESS.messaging.sendMsgAllTabs({method: 'loading', data: {query: tmp['query']}});
            }
            params.tab = 'results';
            // log all queries in 'queries_full'
            EEXCESS.logging.logQuery(tabID, tmp['weightedTerms'], _queryTimestamp, '_full');

            // cache current query
            currentQuery['terms'] = tmp['weightedTerms'];
            currentQuery['query'] = tmp['query'];


            var success = function(data2) { // success callback
                // TODO: search may return no results (although successful)
                tmp['data'] = data2;
                tmp['NE'] = data['contextNamedEntities'];
//                if (data.totalResults !== 0) {
                // create context
                var context = {query: tmp['query']};
                // log results
                EEXCESS.logging.logRecommendations(data2.results, context, _queryTimestamp);
                _handleResult(tmp);
//                }

            };
            var error = function(error) { // error callback
                var tmp_data = {
                    msg: error,
                    query: currentQuery['query']
                };
                EEXCESS.messaging.sendMsgTab(tabID, {method: {parent: 'results', func: 'error'}, data: tmp_data});
            };

            // log manual query and obtain selection
            if (tmp.hasOwnProperty('reason') && tmp['reason']['reason'] === 'manual') {
                EEXCESS.logging.logQuery(tabID, tmp['weightedTerms'], _queryTimestamp, '', 'manual');
                EEXCESS.messaging.sendMsgTab(tabID, {method: 'getTextualContext'}, function(ctxData) {
                    tmp['reason']['value'] = ctxData['selectedText'];
                    // call provider (resultlist should start with first item)
                    EEXCESS.backend.getCall()(data, 1, numResults, success, error);
                });
            } else {
                // call provider (resultlist should start with first item)
                EEXCESS.backend.getCall()(data, 1, numResults, success, error);
            }
        },
        /**
         * Sends the current model state to the specified callback
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Object} data not used
         * @param {Function} callback
         */
        widget: function(tabID, data, callback) {
            callback({params: params, results: results});
        },
        /**
         * Sends the current visibility state of the widget to the specified 
         * callback
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Object} data not used
         * @param {Function} callback
         */
        visibility: function(tabID, data, callback) {
            callback(params.visible);
        },
        /**
         * Sets the rating score of a resource in the resultlist to the 
         * specified value, stores the rating and informs all other tabs.
         * The query  is added to the rating as context.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Object} data rating of the resource
         * @param {String} data.uri URI of the rated resource
         * @param {Integer} data.score Score of the rating
         * @param {Integer} data.pos Position of the resource in the resultlist
         */
        rating: function(tabID, data) {
            var context = {query: results.query};
            EEXCESS.annotation.rating(data.uri, data.score, context, true);
            results.data.results[data.pos].rating = data.score;
            EEXCESS.messaging.sendMsgOtherTabs(tabID, {
                method: {parent: params.tab, func: 'rating'},
                data: data
            });
        },
        /**
         * Returns the model's current context. The context contains the current
         * query (if any) 
         * @memberOf EEXCESS.model
         * @returns {Object} the context
         */
        getContext: function() {
            var context = {};
            if (results.query !== 'Search') {
                context.query = results.query;
            }
            return context;
        },
        /**
         * Hands in the current query and corresponding results to the specified callback
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Object} data unused
         * @param {Function} callback
         */
        getResults: function(tabID, data, callback) {
            if(typeof data !== 'undefined' && data !== null) {
                if(data.numResults > results.data.totalResults) {
                    _replayQuery(tabID, data.numResults, callback);
                    return;
                }
            }
            callback({query: results.query, results: results.data});
        },
        replayQuery: _replayQuery,
        resultOpened: function(tabID, data, callback) {
            EEXCESS.windows.getCurrent({populate: true}, function(win) {
                for (var i = 0; i < win.tabs.length; ++i) {
                    if (win.tabs[i].url === data) {
                        openResult = {id: win.tabs[i].id, url: data};
                        EEXCESS.logging.openedRecommendation(data);
                        break;
                    }
                }
            });
        }
    };
}());

EEXCESS.NER = (function() {
    var _getParagraphEntities = function(tabID, paragraphs, callback) {
        var xhr = $.ajax({
            url: 'http://mics.fim.uni-passau.de/serverREL/RELEVANTICO/api/entities',
            data: JSON.stringify({paragraphs: paragraphs}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        });
        xhr.done(callback);
    };
    var _getParagraphEntityTypes = function(tabID, paragraphs, callback) {
        var xhr = $.ajax({
            url: 'http://zaire.dimis.fim.uni-passau.de:8999/doser-disambiguationserverstable/webclassify/entityAndCategoryStatistic',
            data: JSON.stringify({paragraphs: paragraphs}),
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json'
        });
        xhr.done(callback);
    };
    return {
        getParagraphEntities: _getParagraphEntities,
        getParagraphEntityTypes: _getParagraphEntityTypes
    };
}());