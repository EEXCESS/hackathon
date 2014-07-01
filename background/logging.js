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
 * Encapsulates functionality for logging user actions.
 * @namespace EEXCESS.logging
 * @type {Object}
 * @returns {Object} Returns a set of functions for logging user actions
 */
EEXCESS.logging = (function() {
    return {
        /**
         * Stores recommendations which were retrieved from a partner's datastore
         * into the database along with the context, the items were recommended
         * @memberOf EEXCESS.logging
         * @param {Array.<Recommendation>} recommendations Recommendations as returned by a query on a partner's datastore
         * @param {Object} context The context in which the recommendations were provided (can e.g. contain a query term)
         * @param {long} timestamp The timestamp, when the recommendations were retrieved
         */
        logRecommendations: function(recommendations, context, timestamp) {
            EEXCESS.storage.storeRecommendations(recommendations, context, timestamp);
        },
        /**
         * Stores the term of a user-initiated query in the database along with its context.
         * If the user selected a piece of text, this is assumed to be the context, otherwise
         * the text currently in the viewport makes the context. (if a paragraph starts in the viewport, 
         * but ends outside, while still contained in the same DOM-node, the whole paragraph is stored
         * @memberOf EEXCESS.logging
         * @param {Integer} tabID Identifier of the browsertab, the query was executed in
         * @param {String} query The query term
         * @param {long} timestamp The timestamp, when the recommendations were retrieved
         */
        logQuery: function(tabID, query, timestamp) {
            /**
             * request the context from the browsertab, the query was sent and
             * execute database transaction on callback
             */
            EEXCESS.sendMessage(tabID, {method: 'getTextualContext'}, function(data) {
                EEXCESS.storage.put('queries', {query: query, timestamp: timestamp, context: data});
            });
        },
        /**
         * Stores the user interaction of starting to view a recommended resource
         * @memberof EEXCESS.logging
         * @param {Integer} tabID Identifier of the browsertab, the request originated
         * @param {String} resource URI of the viewed resource
         */
        openedRecommendation: function(tabID, resource) {
            var tmp = {
                resource: resource,
                timestamp: new Date().getTime(),
                type: 'view',
                context: EEXCESS.model.getContext(),
                beenRecommended: true
            };
            EEXCESS.storage.add('resource_relations', tmp);
            tmp['action'] = 'result-view';
            tmp['uuid'] = EEXCESS.profile.getUUID();
            var xhr = $.ajax({
                url: EEXCESS.storage.local('PP_BASE_URI') + 'api/v1/log/rview',
                data: JSON.stringify(tmp),
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'json'
            });

        },
        /**
         * Logs the duration of a user viewing a recommended resource on closing its view
         * @memberof EEXCESS.logging
         * @param {Integer} tabID Identifier of the browsertab, the request originated
         * @param {String} resource URI of the viewed resource
         */
        closedRecommendation: function(tabID, resource) {
            EEXCESS.storage.closedRecommendation(resource, function(view) {
                view['action'] = 'result-close';
                view['uuid'] = EEXCESS.profile.getUUID();
                var xhr = $.ajax({
                    url: EEXCESS.storage.local('PP_BASE_URI') + 'api/v1/log/rclose',
                    data: JSON.stringify(view),
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',
                    dataType: 'json'
                });
            });
        }
    };
}());

/**
 * Encapsulates functionality for logging history events
 * @namespace EEXCESS.logging.history
 */
EEXCESS.logging.history = (function() {
    // represents the current visit
    var current = {
        url: '',
        windowId: -1,
        start: 0,
        tabId: -1,
        reset: function() {
            this.url = '';
            this.windowId = -1;
            this.start = 0;
            this.tabId = -1;
        }
    };

    /**
     * Sets the variable 'current' to the current visit with the current point of
     * time as starting timestamp. If the variable already contained another visit, the
     * contained visit is stored to the database with the current point of time
     * as ending timestamp. If the current url is the same as in the 'current'-
     * variable, the content of this variable remains unchanged.
     * @memberOf EEXCESS.logging.history
     * @param {String} url The url of the current visit
     * @param {Integer} windowId Identifier of the current window
     * @param {Integer} tabId Identifier of the current browsertab
     */
    var _updateChange = function(url, windowId, tabId) {
        if (current.url !== url) {
            if (current.url !== '') {
                _updateDB({url: current.url, start: current.start, end: new Date().getTime()});
            }
            if (!url.startsWith('chrome') && !url.startsWith('https://www.google.de/webhp?sourceid=chrome')) {
                current.url = url;
                current.windowId = windowId;
                current.start = new Date().getTime();
                current.tabId = tabId;
            } else {
                current.reset();
            }
        }
    };

    /**
     * Adds additional information to a visit and stores it in the database.
     * The information added covers:
     * - transition (as obtained by chrome API)
     * - chrome_visitId (a corresponding identifier in chrome's history)
     * - referrer (url of the referrer, may be empty)
     * @memberOf EEXCESS.logging.history
     * @param {Object} item A visit item
     * @param {String} item.url The visit's url
     * @param {Number} item.start Start of the visit in milliseconds from the epoch
     * @param {Number} item.end End of the visit in milliseconds from the epoch
     */
    var _updateDB = function(item) {
        chrome.history.getVisits({url: item.url}, function(visitItems) {
            var chromeVisit = visitItems[visitItems.length - 1];
            item.transition = chromeVisit.transition;
            item.chrome_visitId = chromeVisit.visitId;
            EEXCESS.storage.updateVisit(item, chromeVisit.referringVisitId);
        });
    };

    // update the current visit on changes in the active tab
    chrome.tabs.onUpdated.addListener(function(tabID, changeInfo, tab) {
        if (tab.active) {
            _updateChange(tab.url, tab.windowId, tabID);
        }
    });

    // tab activated -> start of visit
    chrome.tabs.onActivated.addListener(function(activeInfo) {
        chrome.tabs.get(activeInfo.tabId, function(tab) {
            _updateChange(tab.url, activeInfo.windowId, activeInfo.tabId);
        });
    });

    // update/store the current visit on changes of the window focus
    chrome.windows.onFocusChanged.addListener(function(windowId) {
        if (windowId === chrome.windows.WINDOW_ID_NONE && current.url !== '') {
            // window has lost focus -> end of visit
            _updateDB({url: current.url, start: current.start, end: new Date().getTime()});
            current.reset();
        } else {
            // window has obtained focus -> start of visit with url of currently active tab
            chrome.tabs.query({currentWindow: true, active: true}, function(tabs) {
                if (tabs.length > 0) {
                    _updateChange(tabs[0].url, tabs[0].windowId, tabs[0].id);
                }
            });
        }
    });

    // if removed tab corresponds to current visit -> visit ended
    chrome.tabs.onRemoved.addListener(function(tabID) {
        if (current.tabId === tabID) {
            _updateDB({url: current.url, start: current.start, end: new Date().getTime()});
            current.reset();
        }
    });
})();



