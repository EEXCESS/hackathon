var EEXCESS = EEXCESS || {};

EEXCESS.messaging = (function() {
    var _extID = chrome.i18n.getMessage('@@extension_id'); // chrome extension identifier

    /**
     * Sends a message to the background script
     *
     * @param {Object} message The message to send
     * @param {Function} callback Function to be called by the receiver
     */
    var _callBG = function(message, callback) {
        if (typeof callback !== 'undefined') {
            chrome.runtime.sendMessage(_extID, message, callback);
        } else {
            chrome.runtime.sendMessage(_extID, message);
        }
    };

    /**
     * Sends a message to a specific browsertab
     * @param {Integer} tabID Identifier of the tab, the message is to be sent to
     * @param {Object} msg The message to send
     * @param {Function} callback (optional) function to be called by the receiver
     */
    var _sendMsgTab = function(tabID, msg, callback) {
        if (typeof callback !== 'undefined') {
            chrome.tabs.sendMessage(tabID, msg, callback);
        } else {
            chrome.tabs.sendMessage(tabID, msg);
        }
    };

    /**
     * Sends a message to all tabs
     * @param {Object} msg The message to send
     * @param {Function} callback (optional) function to be called by the receivers
     */
    var _sendMsgAllTabs = function(msg, callback) {
        chrome.tabs.query({}, function(tabs) {
            for (var i = 0, len = tabs.length; i < len; i++) {
                if (typeof callback !== 'undefined') {
                    chrome.tabs.sendMessage(tabs[i].id, msg, callback);
                } else {
                    chrome.tabs.sendMessage(tabs[i].id, msg);
                }
            }
        });
    };

    /**
     * Sends a message to all tabs, except a single one, specified by its identifier
     * @param {Integer} tabID Identifier of the tab to be excluded from the receivers
     * @param {Object} msg The message to send
     * @param {Function} callback (optional) function to be called by the receivers
     */
    var _sendMsgOtherTabs = function(tabID, msg, callback) {
        chrome.tabs.query({}, function(tabs) {
            for (var i = 0, len = tabs.length; i < len; i++) {
                if (tabID !== tabs[i].id) {
                    if (typeof callback !== 'undefined') {
                        chrome.tabs.sendMessage(tabs[i].id, msg, callback);
                    } else {
                        chrome.tabs.sendMessage(tabs[i].id, msg);
                    }
                }
            }
        });
    };

    /**
     * Listens for incoming messages
     * @param {Function} callback a function that looks like this:
     function(any message, MessageSender sender, function sendResponse) {...};
     */
    var _listener = function(callback) {
        chrome.runtime.onMessage.addListener(callback);
    };

    return {
        sendMsgTab: _sendMsgTab,
        sendMsgAllTabs: _sendMsgAllTabs,
        sendMsgOtherTabs: _sendMsgOtherTabs,
        listener: _listener,
        callBG: _callBG
    };
})();

EEXCESS.inject = (function() {
    /**
     * Injects functionality for showing a fancybox overlay into the current tab
     * and forwards the request to it (request contains url to display)
     *
     * @param {Integer} tabID identifier of the tab, the fancybox should be injected
     * @param {Object} req request to be forwarded to the tab, with attributes "method"="fancybox" and "data"= the url to display
     */
    var _injectFancybox = function(tabID, req) {
        // inject functionality for showing a fancybox overlay into the current tab and forward the request to it (request contains url to display)
        chrome.tabs.insertCSS(tabID, {file: 'libs/fancybox/jquery.fancybox.css'}, function() {
            chrome.tabs.executeScript(tabID, {file: 'libs/fancybox/jquery.fancybox.pack.js'}, function() {
                EEXCESS.messaging.sendMsgTab(tabID, req);
            });
        });
    };
    return {
        fancybox: _injectFancybox
    };
})();

EEXCESS.utils = (function() {
    /**
     * Detects the language of the specified tab.
     *
     * @param {Integer} tabID identifier of the tab
     * @param {Function} success callback, which receives the country code as parameter
     */
    var _detectLanguage = function(tabID, success) {
        chrome.tabs.detectLanguage(tabID, success);
    };
    return {
        detectLanguage: _detectLanguage,
        extID: chrome.i18n.getMessage('@@extension_id')
    };
})();

EEXCESS.history = (function() {
    /**
     * Searches the history, see https://developer.chrome.com/extensions/history#method-search for documentation
     *
     * @param {Object} query the query object
     * @param {Function} callback callback function, receiving the search result as parameter
     */
    var _search = function(query, callback) {
        chrome.history.search(query, callback);
    };

    /**
     * Retrieve the visits to the specified url.
     *
     * @param {String} url the url for which to retrieve the visits
     * @param {Function} callback callback function, receiving an array of visit items corresponding to the supplied url
     */
    var _getVisits = function(url, callback) {
        var details = {
            url: url
        };
        chrome.history.getVisits(details, callback);
    };
    return {
        search: _search,
        getVisits: _getVisits
    };
})();

EEXCESS.tabs = (function() {
    /**
     * See https://developer.chrome.com/extensions/tabs#event-onUpdated for documentation
     *
     * @param {Function} callback
     */
    var _updateListener = function(callback) {
        chrome.tabs.onUpdated.addListener(callback);
    };

    /**
     *
     * See https://developer.chrome.com/extensions/tabs#event-onActivated for documentation
     *
     * @param {Function} callback
     */
    var _activatedListener = function(callback) {
        chrome.tabs.onActivated.addListener(callback);
    };

    /**
     * See https://developer.chrome.com/extensions/tabs#method-get for documentation
     *
     * @param {Integer} tabID identifier of the tab
     * @param {Object} callback
     */
    var _get = function(tabID, callback) {
        chrome.tabs.get(tabID, callback);
    };

    /**
     * See https://developer.chrome.com/extensions/tabs#method-query for documentation
     *
     * @param {Object} queryInfo
     * @param {Function} callback
     */
    var _query = function(queryInfo, callback) {
        chrome.tabs.query(queryInfo, callback);
    };

    /**
     * Listens to tab removed events
     *
     * @param {Function} callback callback function, receiving the identifier of the removed tab
     */
    var _removedListener = function(callback) {
        chrome.tabs.onRemoved.addListener(callback);
    };
    return {
        updateListener: _updateListener,
        activatedListener: _activatedListener,
        get: _get,
        query: _query,
        removedListener: _removedListener
    };
})();

EEXCESS.windows = (function() {
    /**
     * Listen to window focus change events
     *
     * @param {Function} callback callback function for event, receiving the window identifier as parameter
     */
    var _focusChangedListener = function(callback) {
        chrome.windows.onFocusChanged.addListener(callback);
    };

    /**
     * for documentation see https://developer.chrome.com/extensions/windows#method-getCurrent
     *
     * @param {Object} options
     * @param {Function} callback
     * @returns {undefined}
     */
    var _getCurrent = function(options, callback) {
        chrome.windows.getCurrent(options,callback);
    };

    var _WINDOW_ID_NONE = function() {
        if (chrome.windows) {
            return chrome.windows.WINDOW_ID_NONE;
        }
        return -1;
    };
    return {
        WINDOW_ID_NONE: _WINDOW_ID_NONE,
        focusChangedListener: _focusChangedListener,
        getCurrent: _getCurrent
    };
})();

EEXCESS.browserAction = (function() {
    /**
     * See https://developer.chrome.com/extensions/browserAction#event-onClicked for documentation
     * @param {Function} callback
     * @returns {undefined}
     */
    var _clickedListener = function(callback) {
        chrome.browserAction.onClicked.addListener(callback);
    };

    /**
     * See https://developer.chrome.com/extensions/browserAction#method-getBadgeText for documentation
     * @param {Object} details
     * @param {Function} callback
     * @returns {undefined}
     */
    var _getBadgeText = function(details, callback) {
        chrome.browserAction.getBadgeText(details, callback);
    };

    /**
     * See https://developer.chrome.com/extensions/browserAction#method-setBadgeText for documentation
     * @param {Object} details
     * @returns {undefined}
     */
    var _setBadgeText = function(details) {
        chrome.browserAction.setBadgeText(details);
    };

    return  {
        clickedListener: _clickedListener,
        getBadgeText: _getBadgeText,
        setBadgeText: _setBadgeText
    };
})();
