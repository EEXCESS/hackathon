var EEXCESS = EEXCESS || {};

/**
 * Encapsulates functionality for the model of the eexcess widget
 * @namespace EEXCESS.model
 */
EEXCESS.model = (function() {
    // general widget parameters
    var params = {
        visible: true,
        tab: 'results'
    };
    /**
     * Represents the current query, according results and the scroll position 
     * in the result list
     */
    var results = {
        query: 'search text...',
        data: null,
        weightedTerms: null,
        scroll: 0
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
                    EEXCESS.sendMsgAll({
                        method: {parent: params.tab, func: 'rating'},
                        data: {uri: this.uri, score: score}
                    });
                }.bind({pos: i + offset, uri: items[i].uri}));
            }
        }
    };
    var _queryTimestamp;
    return {
        /**
         * Sets the scroll position of the current resultlist to the specified 
         * value
         * @memberOf EEXCESS.model
         * @param {Integer} value The scroll position
         */
        scroll: function(value) {
            results.scroll = value;
        },
        /**
         * Toggles the visibility of the widget
         * @memberOf EEXCESS.model
         * @returns {Boolean} true if visible, otherwise false
         */
        toggleVisibility: function(url) {
            params.visible = !params.visible;
            var xhr = $.ajax({
                url: EEXCESS.storage.local('PP_BASE_URI') + 'api/v1/log/show_hide',
                data: JSON.stringify({visible:params.visible, uuid:EEXCESS.profile.getUUID(), currentPage:url}),
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json'
            });
            return params.visible;
        },
        quietQuery: function(tabID, data, callback) {
            _queryTimestamp = new Date().getTime();
            var simpleQuery = '';
            for (var i = 0, len = data.length; i < len; i++) {
                simpleQuery += data[i].text;
                if (i < len - 1) {
                    simpleQuery += ' ';
                }
            }
            EEXCESS.logging.logQuery(tabID, data, _queryTimestamp);
            var success = function(res) { // success callback
                if (res.totalResults !== 0) {
                    // update results with ratings
                    _updateRatings(res.results);
                    // provide searchResults to callback
                    callback(res);
                    // create context
                    var context = {query: simpleQuery};
                    // log results
                    EEXCESS.logging.logRecommendations(res.results, context, _queryTimestamp);
                }
            };
            var error = function(error) { // error callback
                EEXCESS.sendMessage(tabID, {method: {parent: 'results', func: 'error'}, data: error});
            };
            // call provider (resultlist should start with first item)
            EEXCESS.backend.getCall()(data, 1, success, error);
        },
        quietQueryNoHistory: function(tabID, data, callback) {
            var success = function(res) { // success callback
                if (res.totalResults !== 0) {
                    // update results with ratings
                    _updateRatings(res.results);
                    // provide searchResults to callback
                    callback(res);
                }
            };
            var error = function(error) { // error callback
                EEXCESS.sendMessage(tabID, {method: {parent: 'results', func: 'error'}, data: error});
            };
            // call provider (resultlist should start with first item)
            EEXCESS.backend.getCall()(data, 1, success, error);
        },
        /**
         * Executes the following functions:
         * - log the query
         * - set widget's tab to 'results' and reset scroll position
         * - query europeana
         * After a successful query to europeana, the obtained results will be
         * logged in the database and enriched with ratings from the database.
         * Furthermore they are set as the current results in the widget's model.
         * At logging the recommendations, query is added as context.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {String} data The query term 
         */
        query: function(tabID, data) {
            // send query only if the widget is visible
            if(!params.visible) {
                return;
            }
            console.log(data);
            _queryTimestamp = new Date().getTime();
            if (data.hasOwnProperty('reason')) {
                results.weightedTerms = data['terms'];
            } else {
                results.weightedTerms = data;
            }
            results.query = '';
            for (var i = 0, len = results.weightedTerms.length; i < len; i++) {
                results.query += results.weightedTerms[i].text;
                if (i < len - 1) {
                    results.query += ' ';
                }
            }
            if(results.query === '') {
                EEXCESS.sendMessage(tabID, {method: {parent: 'results', func: 'error'}, data: 'query is empty...'});
                return;
            }
            params.tab = 'results';
            results.scroll = 0;
            EEXCESS.logging.logQuery(tabID, results.weightedTerms, _queryTimestamp);
            var success = function(data) { // success callback
                // TODO: search may return no results (although successful)
                results.data = data;
                if (data.totalResults !== 0) {
                    // update results with ratings
                    _updateRatings(data.results);
                    // create context
                    var context = {query: results.query};
                    // log results
                    EEXCESS.logging.logRecommendations(data.results, context, _queryTimestamp);
                }
                EEXCESS.sendMsgAll({
                    method: 'newSearchTriggered',
                    data: {query: results.query, results: results.data}
                });
            };
            var error = function(error) { // error callback
                EEXCESS.sendMessage(tabID, {method: {parent: 'results', func: 'error'}, data: error});
            };
            // call provider (resultlist should start with first item)
            EEXCESS.backend.getCall()(data, 1, success, error);
        },
        /**
         * Obtains more results for the current query from europeana.
         * On success, the obtained results are appended to the model's 
         * resultlist, with the further steps executed equal to 
         * {@link EEXCESS.model.query}
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Integer} data Position in the search result list to start 
         * with (the first is 1)
         */
        moreResults: function(tabID, data) {
            var success = function(data) {
                results.data.results = results.data.results.concat(data.results);
                EEXCESS.sendMsgAll({
                    method: {parent: params.tab, func: 'moreResults'},
                    data: data.results
                });
                // update results with ratings
                _updateRatings(data.results);
                // create context
                var context = {query: results.query};
                // log results
                EEXCESS.logging.logRecommendations(data.results, context, _queryTimestamp);
            };
            var error = function(error) {
                EEXCESS.sendMessage(tabID, {method: {parent: 'results', func: 'error'}, data: error});
            };
            EEXCESS.backend.getCall()(results.weightedTerms, data, success, error);
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
         * specified value, logs the rating and informs all other tabs.
         * The query  is added to the rating as 
         * context in the log.
         * @memberOf EEXCESS.model
         * @param {Integer} tabID Identifier of the browsertab, the request 
         * originated
         * @param {Object} data rating of the resource
         * @param {String} data.uri URI of the rated resource
         * @param {Integer} data.score Score of the rating
         * @param {Integer} data.pos Position of the resource in the resultlist
         */
        rating: function(tabID, data) {
            console.log(data);
            var context = {query: results.query};
            EEXCESS.annotation.rating(data.uri, data.score, context, true);
            results.data.results[data.pos].rating = data.score;
            EEXCESS.sendMsgOthers(tabID, {
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
            if (results.query !== 'search text...') {
                context.query = results.query;
            }
            return context;
        },
        /**
         * Returns the visibility state of the eexcess widget
         * @memberOf EEXCESS.model
         * @returns {Boolean} true if visible, false otherwise
         */
        getVisibility: function() {
            return params.visible;
        },
        getResults: function(tabID, data, callback) {
            callback({query: results.query, results: results.data});
        }

    };
}());

