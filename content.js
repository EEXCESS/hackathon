var EEXCESS = EEXCESS || {};
/**
 * Identifier of the chrome extension
 * @memberOf EEXCESS
 */
EEXCESS.extID = chrome.i18n.getMessage('@@extension_id');
/**
 * Flag for indicating the widget's current visibility state
 * @memberOf EEXCESS
 * @type Boolean
 */
EEXCESS.widgetVisible = false;

/**
 * Changes the widget's visibility to the provided value.
 * When the widget is to be shown, the width of the current page is reduced
 * by the widget's width and the widget is displayed at the right border.
 * Upon hiding the widget, the size limits for the current page are reset.
 * @memberOf EEXCESS
 * @param {Boolean} visible
 */
EEXCESS.handleWidgetVisibility = function(visible) {
    if (EEXCESS.widgetVisible !== visible) {
        if (visible) { // show widget
            var width = $(window).width() - 333;
            $('#eexcess_sidebar').show();
            $('html').css('overflow', 'auto').css('position', 'absolute').css('height', '100%').css('width', width + 'px');
            $('body').css('overflow-x', 'auto').css('position', 'relative').css('overflow-y', 'scroll').css('height', '100%');
        } else { // hide widget
            $('#eexcess_sidebar').hide();
            $('html').css('overflow', '').css('position', '').css('height', '').css('width', '');
            $('body').css('overflow-x', '').css('position', '').css('overflow-y', '').css('height', '');
        }
        EEXCESS.widgetVisible = visible;
    }
};

/*
 * Adds the eexcess widget as an iframe, calls the background script with 
 * visibility handler as callback, to determine the current state of 
 * visibility in the background's model.
 */

$('<iframe id="eexcess_sidebar" src="chrome-extension://' + EEXCESS.extID + '/widget/widget.html"></iframe>').appendTo('body');
chrome.runtime.sendMessage(EEXCESS.extID, {method: {parent: 'model', func: 'visibility'}}, EEXCESS.handleWidgetVisibility);

// Listen to messages from the background script
chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            switch (request.method) {
                case 'visibility':
                    // change widget's visibility
                    EEXCESS.handleWidgetVisibility(request.data);
                    break;
                case 'privacySandbox':
                    // change widget's visibility
                    console.log("Message recieved");
                    EEXCESS.handlePrivacyBoxVisibility(request.data);
                    break;
                case 'fancybox':
                    // open fancybox preview of the url provided in request.data
                    $('<a href="' + request.data + '"></a>').fancybox({
                        'autoSize': false,
                        'type': 'iframe',
                        'width': '90%',
                        'height': '90%',
                        afterShow: function() {
                            // log opening the page's preview in the background script
                            chrome.runtime.sendMessage(EEXCESS.extID, {method: {parent: 'logging', func: 'openedRecommendation'}, data: request.data});
                        },
                        afterClose: function(evt) {
                            // log closing the page's preview in the background script
                            chrome.runtime.sendMessage(EEXCESS.extID, {method: {parent: 'logging', func: 'closedRecommendation'}, data: request.data});
                        }
                    }).trigger('click');
                    break;
                case 'useResource':
                    /*
                     * Add url of a resource, recommended in the eexcess widget
                     * to the tags of the current annotation
                     */
                    var existingTags = $('#annotator-field-1').val();
                    if (existingTags.indexOf(request.data) === -1) {
                        // url is not yet present, add it
                        $('#annotator-field-1').val(existingTags + ' ' + request.data);
                    }
                    break;
                case 'getTextualContext':
                    sendResponse({selectedText: document.getSelection().toString(), url: document.URL});
                    break;
            }
        }
);


/**
 * Wrapper for sending a message to the background script
 * @memberOf EEXCESS
 * @param {Object} message The message to send
 * @param {Function} callback Function to be called after reception of the message
 */
EEXCESS.callBG = function(message, callback) {
    if (typeof callback !== 'undefined') {
        chrome.runtime.sendMessage(EEXCESS.extID, message, callback);
    } else {
        chrome.runtime.sendMessage(EEXCESS.extID, message);
    }
};


/*
 * privacy initialization stuff
 */
EEXCESS.handlePrivacyBoxVisibility = function() {
    var visible = !$('#eexcess_privacy').is(':visible');
    if (EEXCESS.privacyVisible !== visible) {
        if (visible) {
            $('#eexcess_privacy').show();
        } else {
            $('#eexcess_privacy').hide();
        }
        EEXCESS.privacyVisible = visible;
    }
};
$('<div style="border: 0; margin:0; padding: 0; display:none; position:fixed; bottom: 100px; right: 349px; width: 40%; height: 60%;" id="eexcess_privacy"><iframe style="border: 0; width:100%; height: 100%" id="eexcess_privacy_frame" src="chrome-extension://' + EEXCESS.extID + '/privacy/policy.html"></iframe></div>').appendTo('body');
