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
 * Creates an XPath for the provided node
 * @memberOf EEXCESS
 * @param {DOM-Node} elm The node for which to create an XPath
 * @returns {String} XPath of the provided node
 */
EEXCESS.createXPathFromElement = function(elm) {
    var allNodes = document.getElementsByTagName('*');
    for (segs = []; elm && elm.nodeType === 1; elm = elm.parentNode) {
        if (elm.hasAttribute('id')) {
            var uniqueIdCount = 0;
            for (var n = 0; n < allNodes.length; n++) {
                if (allNodes[n].hasAttribute('id') && allNodes[n].id === elm.id)
                    uniqueIdCount++;
                if (uniqueIdCount > 1)
                    break;
            }
            if (uniqueIdCount === 1) {
                segs.unshift('id("' + elm.getAttribute('id') + '")');
                return segs.join('/');
            } else {
                segs.unshift(elm.localName.toLowerCase() + '[@id="' + elm.getAttribute('id') + '"]');
            }
        } else if (elm.hasAttribute('class')) {
            if (!elm.getAttribute('class').startsWith('annotator')) {
                segs.unshift(elm.localName.toLowerCase() + '[@class="' + elm.getAttribute('class') + '"]');
            }
        } else {
            for (i = 1, sib = elm.previousSibling; sib; sib = sib.previousSibling) {
                if (sib.localName === elm.localName)
                    i++;
            }
            segs.unshift(elm.localName.toLowerCase() + '[' + i + ']');
        }
    }
    return segs.length ? '/' + segs.join('/') : null;
};


/**
 * Encapsulates functionality to detect user (inter-)actions (such as mouse 
 * clicks and form input) in the current webpage and send them to the background
 * script for logging.
 * @namespace EEXCESS.detectUserActions
 */
EEXCESS.detectUserActions = (function() {
    /**
     * Flag, indicating if there is a currently active timer
     * @memberOf EEXCESS.detectUserActions
     */
    var _activeTimer = false;
    /**
     * Identifier for the currently active timer
     * @memberOf EEXCESS.detectUserActions
     */
    var _timer;
    /**
     * Handler to be called, when an input field loses the focus.
     * Stops the timer and sends the field's value to the background script
     * @memberOf EEXCESS.detectUserActions
     */
    var _blurHandler = function() {
        var input = $(this).val();
        clearTimeout(_timer);
        _activeTimer = false;
        if (input === '') {
            input = $(this).text();
        }
        if (input !== '') {
            var tmp = {
                text: input,
                url: document.URL,
                timestamp: new Date().getTime()
            };
            EEXCESS.callBG({method: {parent: 'logging', func: 'logInput'}, data: tmp});
        }
    };

    /**
     * Handler for sending user input to the background script. 
     * Password fields are ignored, since they should not be logged.
     * If no active timer is present, the {@link blurHandler} is attached. 
     * Otherwise, the active timer is cleared and a new one added, which will
     * send the input's value to the background script after timeout. The timer
     * resetting/restarting is due to the input event being thrown for each
     * character and only a single timer is required for the last input.
     * @memberOf EEXCESS.detectUserActions
     * @param {Event} evt The event to handle
     */
    var _inputHandler = function(evt) {
        if ($(evt.target).parents('.annotator-widget').length > 0) {
            return;
        }
        if (evt.target.type !== 'password') {
            if (!_activeTimer) {
                $(evt.target).off('.eexcess');
                $(evt.target).on('blur.eexcess', _blurHandler);
            } else {
                clearTimeout(_timer);
            }
            _timer = setTimeout(function() {
                _activeTimer = false;
                $(evt.target).off('.eexcess');
                var input = $(evt.target).val();
                if (input === '') {
                    input = $(evt.target).text();
                }
                if (input !== '') {
                    var tmp = {
                        text: input,
                        url: document.URL,
                        timestamp: new Date().getTime()
                    };
                    EEXCESS.callBG({method: {parent: 'logging', func: 'logInput'}, data: tmp});
                }
            }, 1000);
            _activeTimer = true;
        }
    };
    /**
     * Handler for sending user submitted form fields to the background script
     * for logging. The fields are serialized as name/value pairs, with 
     * password fields being ignored.
     * @memberOf EEXCESS.detectUserActions
     * @param {Event} evt The event to handle
     */
    var _submitHandler = function(evt) {
        if ($(evt.target).parents('.annotator-widget').length > 0) {
            return;
        }
        EEXCESS.callBG({method: {parent: 'logging', func: 'logSubmit'}, data: {
                parameters: $(evt.target).serializeArrayWithoutPwd(),
                target: EEXCESS.createXPathFromElement(evt.target),
                url: document.URL,
                timestamp: new Date().getTime()
            }});
    };
    /**
     * Handler to send information about mouseclicks to the background script
     * for logging. The information sent contains the click position, dimensions
     * of the body-element, the current url, an xpath of the target element of
     * the click and a timestamp.
     * @memberOf EEXCESS.detectUserActions
     * @param {Event} evt The event to handle
     */
    var _clickHandler = function(evt) {
        if ($(evt.target).parents('.annotator-widget').length > 0 || $(evt.target).parent('.annotator-adder').length > 0) {
            return;
        }
        EEXCESS.callBG({method: {parent: 'logging', func: 'logClick'}, data: {
                pageX: evt.pageX,
                pageY: evt.pageY,
                bodyWidth: $('body').width(),
                bodyHeight: $('body').height(),
                url: document.URL,
                target: EEXCESS.createXPathFromElement(evt.target),
                timestamp: evt.timeStamp
            }});
    };
    // attach handlers for input, submit, click
    $(document).on('input', _inputHandler);
    $(document).on('submit', _submitHandler);
    //$(document).on('click', _clickHandler);

    // attach handlers to iframes as well
    $(document).ready(function() {
        /*
         * use timeout to increase probability of frames being loaded
         * (on instablogg.com, $(window).load() fired sometimes and sometimes
         * not. Even injecting the content scripts at "document_end" and thus
         * before the window.onload event fires didn't solve this.
         */
        window.setTimeout(function() {
            for (var i = 0, len = window.frames.length; i < len; i++) {
                try {
                    $(window.frames[i].document).on('input', _inputHandler);
                    $(window.frames[i].document).on('submit', _submitHandler);
                    $(window.frames[i].document).on('click', _clickHandler);
                } catch (e) {
                    // cross origin exception
                }
            }
        }, 1000);
    });

})();