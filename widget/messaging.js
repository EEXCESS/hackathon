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
 * Listens for incoming messages and forwards them to the appropriate method.
 * Messages for methods:
 * - visibility
 * - fancybox
 * - useResource
 * - getTextualContext
 * are ignored, since they are intended for the content script injected into
 * the current webpage, not the eexcess widget
 */
chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.method !== 'visibility' && request.method !== 'fancybox' && request.method !== 'useResource' && request.method !== 'getTextualContext' && request.method !== 'taskStarted' && request.method !== 'taskStopped') {
                if (typeof request.method.parent !== 'undefined') {
                    EEXCESS[request.method.parent][request.method.func](request.data);
                } else {
                    EEXCESS[request.method](request.data);
                }
            }
        }
);