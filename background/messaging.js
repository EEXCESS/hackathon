var EEXCESS = EEXCESS || {};

/**
 * Sends a message to a specific browsertab
 * @memberOf EEXCESS
 * @param {Integer} tabID Identifier of the tab, the message is to be sent to
 * @param {Object} msg The message to send
 * @param {Function} [callback] Function to be called by the receiver
 */
EEXCESS.sendMessage = function(tabID, msg, callback) {
    if (typeof callback !== 'undefined') {
        chrome.tabs.sendMessage(tabID, msg, callback);
    } else {
        chrome.tabs.sendMessage(tabID, msg);
    }
};

/**
 * Sends a message to all tabs
 * @memberOf EEXCESS
 * @param {Object} msg The message to send
 * @param {Function} [callback] Function to be called by the receiver
 */
EEXCESS.sendMsgAll = function(msg, callback) {
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
 * @memberOf EEXCESS
 * @param {Integer} tabID Identifier of the tab to be excluded from the receivers
 * @param {Object} msg The message to send
 * @param {Function} [callback] Function to be called by the receiver
 */
EEXCESS.sendMsgOthers = function(tabID, msg, callback) {
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
 * Toggle visibility of eexcess widget by clicks on the eexcess icon
 */
chrome.browserAction.onClicked.addListener(
        function() {
            EEXCESS.sendMsgAll({method: 'visibility', data: EEXCESS.model.toggleVisibility()});
        }
);

// listen for incoming messages
chrome.runtime.onMessage.addListener(
        function(req, sender, sendResponse) {
            if (typeof sender.tab === 'undefined') {
                // sender cannot be identified, exit
                console.log('no tab');
                return;
            }
            var tabID = sender.tab.id;
            if (req.method === 'scroll') {
                // update scroll position in model and inform other tabs
                if (sender.tab.active) {
                    EEXCESS.model.scroll(req.data);
                    EEXCESS.sendMsgOthers(tabID, {method: 'scroll', data: req.data});
                }
            } else if (req.method === 'fancybox') {
                // inject functionality for showing a fancybox overlay into the current tab and forward the request to it (request contains url to display)
                chrome.tabs.insertCSS(tabID, {file: 'media/lib/fancybox/jquery.fancybox.css'}, function() {
                    chrome.tabs.executeScript(tabID, {file: 'media/lib/fancybox/jquery.fancybox.pack.js'}, function() {
                        chrome.tabs.sendMessage(tabID, req);
                    });
                });
            } else if (req.method === 'useResource') {
                // forward message from eexcess widget to current page for adding a recommended resource to the tags of an annotation
                chrome.tabs.sendMessage(tabID, req);
            }
            else {
                // call function as specfied by the request
                EEXCESS[req.method.parent][req.method.func](tabID, req.data, sendResponse);
                return true;
            }
        }
);


