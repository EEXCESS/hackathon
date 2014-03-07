var EEXCESS = EEXCESS || {};
EEXCESS.extID = chrome.i18n.getMessage('@@extension_id');

/**
 * Sends a message to the background script
 * @memberOf EEXCESS
 * @param {Object} message The message to send
 * @param {Function} callback Function to be called by the receiver
 */
EEXCESS.callBG = function(message, callback) {
    if (typeof callback !== 'undefined') {
        chrome.runtime.sendMessage(EEXCESS.extID, message, callback);
    } else {
        chrome.runtime.sendMessage(EEXCESS.extID, message);
    }
};

/**
 * Listens for incoming messages
 * @param {Function} callback a function that looks like this: 
function(any message, MessageSender sender, function sendResponse) {...};
 */
EEXCESS.messageListener = function(callback) {
    chrome.runtime.onMessage.addListener(callback);
};