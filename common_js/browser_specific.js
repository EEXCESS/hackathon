var EEXCESS = EEXCESS || {};

EEXCESS.messaging = (function() {
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
        listener: _listener
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
                _sendMsgTab(tabID, req);
            });
        });
    };
    return {
        fancybox:_injectFancybox
    };
})();