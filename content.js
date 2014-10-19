var EEXCESS = EEXCESS || {};
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
            $('#eexcess_button').show();
            $('#eexcess_sidebar').show();
//            var width = $(window).width() - 333;
//            $('#eexcess_sidebar').show();
//            $('html').css('overflow', 'auto').css('position', 'absolute').css('height', '100%').css('width', width + 'px');
//            $('body').css('overflow-x', 'auto').css('position', 'relative').css('overflow-y', 'scroll').css('height', '100%');
        } else { // hide widget
            $('#eexcess_button').hide();
            $('#eexcess_sidebar').hide();
//            $('html').css('overflow', '').css('position', '').css('height', '').css('width', '');
//            $('body').css('overflow-x', '').css('position', '').css('overflow-y', '').css('height', '');
        }
        EEXCESS.widgetVisible = visible;
    }
};

/*
 * Adds the eexcess widget as an iframe, calls the background script with 
 * visibility handler as callback, to determine the current state of 
 * visibility in the background's model.
 */

$('<div id="eexcess_button"><img src="chrome-extension://' + EEXCESS.utils.extID + '/media/icons/16.png" /></div>').appendTo('body').mouseenter(function() {
    $('#eexcess_sidebar').show('fast');
});

$('<iframe id="eexcess_sidebar" src="chrome-extension://' + EEXCESS.utils.extID + '/widget/widget.html"></iframe>').appendTo('body').mouseleave(function(evt) {
    if (evt.clientX < $(this).offset().left) {
        $(this).hide('slow', function() {
            $('#eexcess_button').show();
        });

    }
});
EEXCESS.messaging.callBG({method: {parent: 'model', func: 'visibility'}}, function(visible) {
    EEXCESS.widgetVisible = visible;
    if (visible) {
        $('#eexcess_button').show();
    }
});

EEXCESS.mousePosition = {
    x: 0,
    y: 0
};

$(window).mousemove(function(e) {
    EEXCESS.mousePosition.x = e.pageX;
    EEXCESS.mousePosition.y = e.pageY;
});

// Listen to messages from the background script
EEXCESS.messaging.listener(
        function(request, sender, sendResponse) {
            switch (request.method) {
                case 'visibility':
                    // change widget's visibility
                    EEXCESS.handleWidgetVisibility(request.data);
                    break;
                case 'privacySandbox':
                    // change widget's visibility
                    EEXCESS.handlePrivacyBoxVisibility(request.data);
                    break;
                case 'fancybox':
                    // open fancybox preview of the url provided in request.data
                    $('<a href="' + request.data + '"></a>').fancybox({
                        'autoSize': false,
                        'type': 'iframe',
                        'width': '90%',
                        'height': '90%'
                    }).trigger('click');
                    break;
                case 'getTextualContext':
                    sendResponse({selectedText: document.getSelection().toString(), url: document.URL});
                    break;
                case 'newSearchTriggered':
                    if (EEXCESS.widgetVisible && typeof request.data.results !== 'undefined' && request.data.results.totalResults !== 0) {
                        console.log($('iframe'));
                        var iframes = $('iframe');
                        for(var i=0; i<iframes.length;i++ ) {
                            if(iframes[i].src.indexOf('chrome-extension') !== -1) {
                                return;
                            }
                        }
                        var sidebar_visible = $('#eexcess_sidebar').is(':visible');
                        $('#eexcess_sidebar').show(function() {
                            $('#eexcess_button').show();
                        });
                        if (!request.data.results.hasOwnProperty('iconClicked') && !sidebar_visible) {
                            window.setTimeout(function() {
                                if (EEXCESS.mousePosition.x < $(window).width() - 360) {
                                    $('#eexcess_sidebar').hide('slow');
                                }
                            }, 2000);
                        }
                    }
            }
        }
);

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
