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
//                    /*
//                     * Retrieves the text of dom-nodes, currently visible in the
//                     * viewport and sends it to the background script.
//                     * If a selection is present, this selection is sent as well.
//                     */
//                    // viewport
//                    var docViewTop = $(window).scrollTop();
//                    var docViewBottom = docViewTop + $(window).height();
//                    /*
//                     * Generic filtering, using only nodes inside the current
//                     * viewport, excluding 'style', 'script', 'noscript' and 
//                     * hidden nodes
//                     */
//                    var root = document;
//                    var filter = {acceptNode: function(node) {
//                            var parent = $(node).parent();
//                            var elemTop = parent.offset().top;
//                            var elemBottom = elemTop + $(node).parent().height();
//                            if ((elemBottom > docViewTop) && (elemTop < docViewBottom)) {
//                                var nodeName = parent.prop('nodeName');
//                                // exclude 'style', 'script' and 'noscript' nodes, as they 
//                                var dataElement = (nodeName === 'STYLE' || nodeName === 'SCRIPT' || nodeName === 'NOSCRIPT');
//                                if (!dataElement && !parent.is(':hidden')) {
//                                    return NodeFilter.FILTER_ACCEPT;
//                                }
//                            }
//                            return NodeFilter.FILTER_REJECT;
//                        }};
//
//                    /*
//                     * Specific filtering for wikipedia, considering only nodes
//                     * within the content part of the page, excluding navigational
//                     * menus.
//                     */
//                    var wikiContent = $('#mw-content-text').get()[0];
//                    if (typeof wikiContent !== 'undefined') {
//                        root = wikiContent;
//                        filter = {acceptNode: function(node) {
//                                if ($(node).parents('.dablink').length > 0) {
//                                    return NodeFilter.FILTER_REJECT;
//                                }
//                                if ($(node).parents('#toc').length > 0) {
//                                    return NodeFilter.FILTER_REJECT;
//                                }
//                                var parent = $(node).parent();
//                                var elemTop = parent.offset().top;
//                                var elemBottom = elemTop + parent.height();
//                                if ((elemBottom > docViewTop) && (elemTop < docViewBottom)) {
//                                    var nodeName = parent.prop('nodeName');
//                                    // exclude 'style', 'script' and 'noscript' nodes, as they 
//                                    var dataElement = (nodeName === 'STYLE' || nodeName === 'SCRIPT' || nodeName === 'NOSCRIPT');
//                                    if (!dataElement && !parent.is(':hidden')) {
//                                        return NodeFilter.FILTER_ACCEPT;
//                                    }
//                                } else {
//                                    return NodeFilter.FILTER_REJECT;
//                                }
//                            }};
//                    }
//                    // tree walker with generic or wikipedia filter
//                    var walker = document.createTreeWalker(
//                            root,
//                            NodeFilter.SHOW_TEXT,
//                            filter
//                            );
//                    // concatenate text of respective nodes
//                    var node;
//                    var viewPortText = '';
//                    while (node = walker.nextNode()) {
//                        viewPortText += node.nodeValue;
//                    }
//                    /*
//                     * The text inside the viewport is split into several 
//                     * paragraphs, in order to extract only those parts,
//                     * which contain relevant information (navigational items
//                     * should be ignored for example). There seem to be several
//                     * blank text nodes between dom elements (mostly linebreaks),
//                     * thus, the text is splitted at at least two consecutive
//                     * whitespace characters. Enforcing the extracted text parts
//                     * to have a certain minimum length increases the probability
//                     * to extract paragraphs, which consist of real sentences 
//                     * and thus reveal contextual information
//                     * TODO: do not apply filter here, but post filter the log?
//                     */
//                    var matches = viewPortText.match(/\s{2,}(\S*\s?\S)+/g);
//                    var paragraphs = [];
//                    for (var i = 0, len = matches.length; i < len; i++) {
//                        var tmp = matches[i].trim();
//                        if (tmp.length > 0) { // may be adjusted for filtering
//                            if (tmp !== 'Annotate') { // filter out annotator
//                                paragraphs.push(tmp);
//                            }
//                        }
//                    }
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

/**
 * Extends jquery by a function for serializing form contents into an array, 
 * while ignoring password input fields. The code is the same as in the 
 * jquery.serializeArray()-method, except for a filter property to ignore
 * input fields with the type 'password'
 * @memberOf EEXCESS
 */
EEXCESS.extendJQuerySerializeArrayWithoutPwd = (function() {
    var rCRLF = /\r?\n/g,
            rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
            rsubmittable = /^(?:input|select|textarea|keygen)/i,
            manipulation_rcheckableType = /^(?:checkbox|radio)$/i;

    jQuery.fn.extend({
        serializeArrayWithoutPwd: function() {
            return this.map(function() {
                var elements = jQuery.prop(this, "elements");
                return elements ? jQuery.makeArray(elements) : this;
            })
                    .filter(function() {
                        var type = this.type;
                        // added check for input type not being 'password'
                        return type !== 'password' && this.name && !jQuery(this).is(":disabled") &&
                                rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) &&
                                (this.checked || !manipulation_rcheckableType.test(type));
                    })
                    .map(function(i, elem) {
                        var val = jQuery(this).val();

                        return val == null ?
                                null :
                                jQuery.isArray(val) ?
                                jQuery.map(val, function(val) {
                                    return {name: elem.name, value: val.replace(rCRLF, "\r\n")};
                                }) :
                                {name: elem.name, value: val.replace(rCRLF, "\r\n")};
                    }).get();
        }
    });
})();

EEXCESS.sortTokens = function(corpus, sortFunc) {
    var sortedTokens = [];
    for (var k in corpus) {
        // do not inherit properties / include functions
        if (corpus.hasOwnProperty(k) && typeof corpus[k] !== 'function')
            sortedTokens.push({key: k, value: corpus[k]});
    }
    sortedTokens.sort(sortFunc);
    return sortedTokens;
};

EEXCESS.topKcorpus = function(corpus, k) {
//    var topK = '';
//    // sort corpus by word occurences
//    var sorted = EEXCESS.sortTokens(corpus, function(t1, t2) {
//        return t2.value['c'] - t1.value['c'];
//    });
//    // first word
//    if (typeof sorted[0] !== 'undefined') {
//        topK = sorted[0].key;
//    }
//    // add k more words
//    for (var i = 1; i < k; i++) {
//        if (typeof sorted[i] !== 'undefined') {
//            topK += ' ' + sorted[i].key;
//        } else {
//            break;
//        }
//    }
    topK = [];
    var divisor = 1;
    var sorted = EEXCESS.sortTokens(corpus, function(t1, t2) {
        return t2.value['c'] - t1.value['c'];
    });
    // first word
    if (typeof sorted[0] !== 'undefined') {
        divisor = sorted[0].value['c'];
        topK.push({
            "weight": 1,
            "text": sorted[0].key
        });
    }
    for (var i = 1; i < k; i++) {
        if (typeof sorted[i] !== 'undefined') {
            topK.push({
                "weight": (sorted[i].value['c'] / divisor),
                "text": sorted[i].key
            });
        } else {
            break;
        }
    }
    return topK;
};

EEXCESS.triggerQuery = function(textElements, reason) {
    EEXCESS.callBG({method: {parent: 'corpus', func: 'getCorpus'}, data: textElements}, function(result) {
        var query = EEXCESS.topKcorpus(result, 10);
        EEXCESS.callBG({method: {parent: 'model', func: 'query'}, data: {reason:reason,terms:query}});
    });
};

EEXCESS.initiateQuery = function() {
    // get all text elements
    var elements = [];
    var walker = document.createTreeWalker(
            document,
            NodeFilter.SHOW_ALL,
            {acceptNode: function(node) {
                    if (node.nodeType === 1 && node.getAttribute('id') === 'eexcess_sidebar') {
                        // filter out EEXCESS content
                        return NodeFilter.FILTER_REJECT;
                    } else if (node.nodeType !== 3) {
                        // accept only text nodes
                        return NodeFilter.FILTER_SKIP;
                    }
                    else {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                }},
    false
            );

    var node;
    while (node = walker.nextNode()) {
        var containsText = node.nodeValue.search(/\S+/);
        var parent = node.parentNode.nodeName;
        var cond1 = parent !== 'SCRIPT'; // exclude script areas
        var cond2 = parent !== 'STYLE';  // exclude style areas
        var cond3 = parent !== 'NOSCRIPT'; // exclude noscript areas
        if (containsText !== -1 && cond1 && cond2 && cond3) {
            elements.push({text: node.nodeValue, parent: parent});
        }
    }
    EEXCESS.triggerQuery(elements, {reason:'page',page: document.URL});
}();

EEXCESS.selectedText = '';

$(document).mouseup(function() {
    var text = window.getSelection().toString();
    if (text !== '') {
        if (text !== EEXCESS.selectedText) {
            EEXCESS.selectedText = text;
            var elements = [];
            elements.push({text: text});
            EEXCESS.triggerQuery(elements, {reason:'selection',selectedText: document.getSelection().toString()});
        }
    }
});

/*
 * privacy initialization stuff
 */
EEXCESS.handlePrivacyBoxVisibility = function() {
    console.log("We get here");
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
