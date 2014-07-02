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


EEXCESS.tabs.updateListener(function(tabId, changeInfo, tab) {
    if (typeof tab['url'] !== 'undefined') {
        if (tab['url'].startsWith('https://')) {
//            chrome.browserAction.disable(tabId);
            chrome.browserAction.setPopup({"tabId": tabId, "popup": "../popup.html"});
        } else {
            chrome.browserAction.setPopup({"tabId": tabId, "popup": ""});
//            chrome.browserAction.enable(tabId);
        }
    }
});

/**
 * Toggle visibility of eexcess widget by clicks on the eexcess icon
 */
chrome.browserAction.onClicked.addListener(
        function(tab) {
            if (!tab['url'].startsWith('https://')) {
                EEXCESS.messaging.sendMsgAllTabs({method: 'visibility', data: EEXCESS.model.toggleVisibility(tab.url)});
            } 
        }
);