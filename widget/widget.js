var EEXCESS = EEXCESS || {};
EEXCESS.extID = chrome.i18n.getMessage('@@extension_id');

/**
 * Encapsulates functionality for displaying search results and interaction with
 * them
 * @namespace EEXCESS.results
 */
EEXCESS.results = (function() {
    /**
     * Looks for the presence of a set of facets in a search result and 
     * concatenates the found results in a string together with their respective 
     * value.
     * @memberOf EEXCESS.results
     * @param {Object} item A search result item
     * @returns {String} The concatenated string of facets and values (e.g.
     * "type: IMAGE | year: 2013 | ...")
     */
    var _facets = function(item) {
        var facetString = '';
        var counter = 0;

        for (var key in item.facets) {
            counter++;
            if (counter > 1) {
                facetString += ' | ';
            }
            facetString += key + ': ' + item.facets[key];
        }
        return facetString;
    };
    /**
     * Constructs a DOM-Element for a link, adds thumbnail functionality and 
     * preview functionality via fancybox.
     * @memberOf EEXCESS.results
     * @param {String} url The URL of the link
     * @param {String} img URL of a preview image for the link
     * @param {String} title Link title to be shown to the user
     * @returns {Object} Jquery object of the link's DOM-node
     */
    var _link = function(url, img, title) {
        var link = $('<a href="#">' + title + '</a>');
        link.click(function() {
            EEXCESS.callBG({method: 'fancybox', data: url});
        });
        _thumbnail(link, img);
        return link;
    };
    /**
     * Adds thumbnail functionality to a link on hover. The thumbnail is
     * displayed at the current mouse position and sticks to the mouse, as long
     * as the mouse move's over the link area. The thumbnail is removed, when
     * the mouse leaves the link's area.
     * @memberOf EEXCESS.results
     * @param {Object} link Jquery object of the link's DOM-node
     * @param {String} img URL of the thumbnail image
     */
    var _thumbnail = function(link, img) {
        // thumbnail on hover
        var xOffset = 10;
        var yOffset = 30;
        link.hover(
                function(e) {
                    $('body').append('<p id="eexcess_thumb"><img src="' + img
                            + '" alt="img preview" /></p>');
                    $('#eexcess_thumb')
                            .css('position', 'absolute')
                            .css('top', (e.pageY - xOffset) + 'px')
                            .css('left', (e.pageX + yOffset) + 'px')
                            .css('z-index', 9999)
                            .fadeIn('fast');
                },
                function() {
                    $('#eexcess_thumb').remove();
                });
        link.mousemove(function(e) {
            $('#eexcess_thumb')
                    .css('top', (e.pageY - xOffset) + 'px')
                    .css('left', (e.pageX + yOffset) + 'px');
        });
    };
    /**
     * Adds rating functionality to an element
     * @memberOf EEXCESS.results
     * @param {Object} element Jquery object of a DOM-element, for which to add
     * rating functionality
     * @param {String} uri URI of the corresponding resource to be rated 
     * @param {Integer} score Current rating score of the resource (in the range of 0-1)
     */
    var _rating = function(element, uri, score) {
        element.raty({
            score: score,
            path: '../libs/rating/img',
            number: 2,
            width: false,
            iconRange: [
                {range: 1, on: 'thumb_down-on.png', off: 'thumb_down-off.png'},
                {range: 2, on: 'thumb_up-on.png', off: 'thumb_up-off.png'}
            ],
            hints: ['bad', 'good'],
            single: true,
            click: function(score, evt) {
                EEXCESS.callBG({
                    method: {parent: 'model', func: 'rating'},
                    data: {
                        uri: this.uri,
                        score: score,
                        pos: this.element.data('pos'),
                        beenRecommended: true
                    }
                });
            }.bind({uri: uri, element: element})
        });
    };

    return {
        /**
         * Displays the results of a search in the eexcess widget
         * @memberOf EEXCESS.results
         * @param {Object} data Object containing the result of a search
         * @param {Integer} data.totalResults Number of total results for the search
         * @param {Array} data.items Array of result items
         */
        showResults: function(data) {
            $('#eexcess_content').empty();
            if (data === null || data.totalResults === '0') {
                $('#eexcess_content').append($('<p>no results</p>'));
                return;
            }
            var list = $('<ul id="eexcess_resultList" class="block_list" data-total="' + data.totalResults + '"></ul>');
            $('#eexcess_content').append(list);
            EEXCESS.results.moreResults(data.results, list);
        },
        /**
         * Appends the results of a search to the ones, currently shown in the
         * eexcess widget.
         * @memberOf EEXCESS.results
         * @param {Array} items Array of result items 
         * @param {Object} list Jquery object of the DOM-node at which to append
         * the results
         */
        moreResults: function(items, list) {
            $('#eexcess_content').unbind('scroll');
            if (typeof list === 'undefined') {
                list = $('#eexcess_resultList');
            }
            var offset = $('#eexcess_resultList li').length;
            for (var i = 0, len = items.length; i < len; i++) {
                var item = items[i];
                var img = item.previewImage;
                if (typeof img === 'undefined' || img === '') {
                    img = 'no-img.png';
                }
                var title = item.title;
                if (typeof title === 'undefined') {
                    title = 'no title';
                }
                var pos = i + offset;
                var li = $('<li data-pos="' + pos + '"></li>');

                list.append(li);

                // rating
                var raty = $('<div class="eexcess_raty"  data-uri="' + item.uri + '" data-pos="' + pos + '"></div');
                _rating(raty, item.uri, item.rating);
                li.append(raty);

                var containerL = $('<div class="resCtL"></div');
                li.append(containerL);
                containerL.append(_link(item.uri, img, '<img class="eexcess_previewIMG" src="' + img + '" />'));

                // contents
                var resCt = $('<div class="eexcess_resContainer"></div>');
                resCt.append(_link(item.uri, img, title));
                li.append(resCt);



                // annotator
//                containerL.append($('<a href="" title="add resource to annotation" class="annotator_add" ><img src="../media/icons/add.png" /></a>')
//                        .click(function(evt) {
//                            evt.preventDefault();
//                            EEXCESS.callBG({method: 'useResource', data: this});
//                        }.bind(item.link)));

                // partner icon
                if (typeof item.facets.partner !== 'undefined') {
                    containerL.append($('<img src="../media/icons/' + item.facets.partner + '-favicon.ico" class="partner_icon" />'));
                }

                // show link
                var linkCopy = $('<a href="" title="show URL of the resource"><img src="../media/icons/link.png" /></a>');
                linkCopy.click(function(evt) {
                    evt.preventDefault();
                    $('#dialog_url p').text(this);
                    var at = 'center top+' + evt.pageY;
                    $('#dialog_url').dialog({
                        title: 'URL of the resource',
                        height: 130,
                        position: {my: "center", at: at}
                    });
                    // select the link
                    var selection = window.getSelection();
                    var range = document.createRange();
                    range.selectNodeContents($('#dialog_url p').get()[0]);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }.bind(item.uri));
                containerL.append(linkCopy);

//                // facets
//                var facets = _facets(item);
//                if (facets !== '') {
//                    resCt.append($('<p style="margin:0;padding:0;font-size:0.9em;">' + facets + '</p>'));
//                }

                // description
                if (typeof item.description !== 'undefined' && item.description !== '') {
                    resCt.append($('<p class="result_description">' + item.description + '</p>'));
                }
                resCt.append($('<p style="clear:both;"></p>'));



            }
            $('#eexcess_loading').remove();
            if ($('#eexcess_resultList').data('total') > $('#eexcess_resultList li').length) {
                $('#eexcess_content').scroll(function() {
                    EEXCESS.scrollalert(true);
                });
            } else {
                $('#eexcess_content').scroll(function() {
                    EEXCESS.scrollalert(false);
                });
            }
        },
        /**
         * Sets the rating of a resource currently displayed in the result list
         * to the specified value
         * @memberOf EEXCESS.results
         * @param {{uri:String,score:Integer}} data Object containing the URI of
         * the resource to rate and the score to set
         */
        rating: function(data) {
            _rating($('.eexcess_raty[data-uri="' + data.uri + '"]'), data.uri, data.score);
        }

    };
})();





/**
 * Handler to be called on scrolling in the result list. If the end of the result
 * list is reached, but there are still more results available for the current query, the 
 * background script is called to retrieve a further set of results.
 * @memberOf EEXCESS
 * @param {Boolean} moreResults Indicating, if more results are available for the current query
 */
EEXCESS.scrollalert = function(moreResults) {
    var scrolltop = $('#eexcess_content').prop('scrollTop');
    var scrollheight = $('#eexcess_content').prop('scrollHeight');
    var windowheight = $('#eexcess_content').prop('clientHeight');
    var offset = 20;
    EEXCESS.callBG({method: 'scroll', data: scrolltop});
    if (moreResults && scrolltop > 0 && (scrolltop + windowheight + offset >= scrollheight)) {
        $('#eexcess_content').unbind('scroll');
        $('#eexcess_content').append($('<div id="eexcess_loading"><img src="../media/loading.gif" /></div>'));
        var start = $('#eexcess_content').find('li:last').data('pos') + 2;
        EEXCESS.callBG({method: {parent: 'model', func: 'moreResults'}, data: start});
    }
};

/**
 * Sets the scroll position of the '#eexcess_content' element to the specified
 * value.
 * @memberOf EEXCESS
 * @param {Integer} value The scroll position to set
 */
EEXCESS.scroll = function(value) {
    $('#eexcess_content').scrollTop(value);
};

/**
 * Updates the widget's view with the current state of the model in the background script
 * @memberOf EEXCESS
 * @param {Object} widget The current state of the widget model in the background script
 */
EEXCESS.update = function(widget) {
    if (widget.results.query === 'search text...') {
        $('#eexcess_query').attr('placeholder', widget.results.query);
    } else {
        $('#eexcess_query').val(widget.results.query);
    }

    switch (widget.params.tab) {
        case 'results':
            EEXCESS.results.showResults(widget.results.data);
            break;
    }

    setTimeout(function() {
        $('#eexcess_content').scrollTop(widget[widget.params.tab].scroll);
    }, 200);
};


/**
 * Initializes the widget's view with the current state of the widget in the background script's model
 * @memberOf EEXCESS
 * @param {Object} widget The current state of the widget's model in the background script
 */
EEXCESS.init = function(widget) {
    $('#eexcess_tab a.inline').click(function(evt) {
        evt.preventDefault();
        $('#eexcess_tab').find('a').removeAttr('class');
        $(this).attr('class', 'selected');
        $('#eexcess_content').empty();
        $('#eexcess_content').append($('<div id="eexcess_loading"><img id="eexcess_loading" src="../media/loading.gif" /></div>'));
        EEXCESS.callBG({method: {parent: 'model', func: 'changeTab'}, data: $(this).data('name')});
    });
    
    $('#eexcess_tab a.fancybox_link').click(function(evt) {
        evt.preventDefault();
        //console.log();
        EEXCESS.callBG({method: 'fancybox', data: 'chrome-extension://'+EEXCESS.extID + '/' +$(evt.target).parent('a').attr('href')});
    });

    var form = $('#eexcess_searchForm');
    form.submit(function() {
        $('#eexcess_content').empty();
        $('#eexcess_content').unbind('scroll');
        $('#eexcess_content').scrollTop(0);
        $('#eexcess_content').append($('<div id="eexcess_loading"><img id="eexcess_loading" src="../media/loading.gif" /></div>'));
        var query = $('#eexcess_query').val();
        EEXCESS.callBG({method: {parent: 'model', func: 'query'}, data: [{weight: 1, text: query}]});
        return false;
    });
    EEXCESS.update(widget);
};

/**
 * Displays an error message to the user and resets the widget to its current state
 * in the background script's model
 * @memberOf EEXCESS
 * @param {String} error The error message to display
 */
EEXCESS.error = function(error) {
    alert(error);
    EEXCESS.callBG({method: {parent: 'model', func: 'widget'}}, EEXCESS.init);
};

// Initalize the widget with the current state in the background script's model on execution of this script
EEXCESS.callBG({method: {parent: 'model', func: 'widget'}}, EEXCESS.init);
