var EEXCESS = EEXCESS || {};

/**
 * Implements a search result list, which can be used by all components.
 * The list updates itself, if a new query was issued and new results arrive.
 * Ratings are updated as well.
 * Required libs:
 * - jquery
 * - jquery.raty
 * - jquery-ui
 * Required css-files:
 * - eexcess.css
 * - searchResultList.css
 * - jquery-ui.css
 * Handlers for preview and rating can be customized via options, as well as the
 * path to the media folder and the path to the libs folder
 * 
 * See an usage example in /usage_examples searchResultList.js and searchResultList.html
 * @param {Jquery div elmeent} divContainer
 * @param {Object} options
 */
EEXCESS.searchResultList = function(divContainer, options) {

    /**
     * Event handler on the pagination buttons
     * 
     */

     $(document).on('click', '.page', function() {
        $('.page.active').removeClass('active');
        $(this).addClass('active');
        var page = parseInt($(this).html()) - 1;
        var min = page * settings.itemsShown;
        var max = min + settings.itemsShown;

        $("#recommendationList li").hide().slice(min, max).show();
     })

    var settings = $.extend({
        pathToMedia: '../media/',
        pathToLibs: '../libs/',
        itemsShown : 10,
        previewHandler: function(url) {
            window.open(url, '_blank');
            EEXCESS.messaging.callBG({method:{parent:'model',func:'resultOpened'},data:url});
        },
        ratingHandler: function(uri, score, pos) {
            EEXCESS.messaging.callBG({
                method: {parent: 'model', func: 'rating'},
                data: {
                    uri: uri,
                    score: score,
                    pos: pos,
                    beenRecommended: true
                }});
        }
    }, options);
    var _loader = $('<div class="eexcess_loading" style="display:none"><img src="' + settings.pathToMedia + 'loading.gif" /></div>');
    var _list = $('<ul id="recommendationList" class="block_list" data-total="0"></ul>').append($('<li>no results</li>'));
    var _dialog = $('<div style="display:none"><div>').append('<p></p>');
    var _error = $('<p style="display:none">sorry, something went wrong...<p>');

    var _link = function(url, img, title) {
    var link = $('<a href="'+url+'">' + title + '</a>');
        link.click(function(evt) {
            evt.preventDefault();
            settings.previewHandler(url);
        });
        _thumbnail(link, img);
        return link;
    };
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
    var _rating = function(element, uri, score) {
        element.raty({
            score: score,
            path: settings.pathToLibs + 'rating/img',
            number: 2,
            width: false,
            iconRange: [
                {range: 1, on: 'thumb_down-on.png', off: 'thumb_down-off.png'},
                {range: 2, on: 'thumb_up-on.png', off: 'thumb_up-off.png'}
            ],
            hints: ['bad', 'good'],
            single: true,
            click: function(score, evt) {
                settings.ratingHandler(this.uri, score, this.element.data('pos'));
            }.bind({uri: uri, element: element})
        });
    };

    // init
    divContainer.append(_loader);
    divContainer.append(_dialog);
    divContainer.append(_list);
    divContainer.append(_error);

    // obtain current results
    EEXCESS.messaging.callBG({method: {parent: 'model', func: 'getResults'}, data: null}, function(reqResult) {
        showResults(reqResult);
    });

    // listen for updates
    EEXCESS.messaging.listener(
            function(request, sender, sendResponse) {
                if (request.method.parent === 'results') {
                    if (request.method.func === 'rating') {
                        _rating($('.eexcess_raty[data-uri="' + request.data.uri + '"]'), request.data.uri, request.data.score);
                    }
                }
                if (request.method === 'newSearchTriggered') {
                    showResults(request.data);
                }
                if (request.method.parent === 'results' && request.method.func === 'error') {
                    _list.empty();
                    _loader.hide();
                    _error.show();
                }
            }
    );

    var showResults = function(data) {
        _error.hide();
        _loader.hide();
        data = data.results || null;
        _list.empty();

        if (data === null || data.totalResults === 0 || data.totalResults === '0') {
            _list.append($('<li>no results</li>'));
            return;
        }
        _list.attr('data-total', data.totalResults);
        moreResults(data.results);


        var _pagination = $('<div class="pagination"></div>');
        var pages = (Math.ceil(data.results.length / settings.itemsShown) > 10) ? 10 : Math.ceil(data.results.length / settings.itemsShown) ;
        for(var i = 1; i <= pages; i++) {
            var _btn = $('<a href="#" class="page gradient">' + i + '</a>');
            if(i == 1) {
                _btn.addClass('active');
            }
            _pagination.append(_btn);
        }

        if(divContainer.find('.pagination').length != 0) {
            divContainer.find('.pagination').remove(); 
        }

        divContainer.append(_pagination)
    };
    var moreResults = function(items) {
//            $('#eexcess_content').unbind('scroll'); TODO: check scrolling...
        var offset = _list.children('li').length;
        for (var i = 0, len = items.length; i < len; i++) {

            var item = items[i];
            var img = item.previewImage;
            if (typeof img === 'undefined' || img === '') {
                img = settings.pathToMedia + 'no-img.png';
            }
            var title = item.title;

            if (typeof title === 'undefined') {
                title = 'no title';
            }
            var pos = i + offset;
            var li = $('<li data-pos="' + pos + '" data-id="' + item.id + '"></li>'); 

            _list.append(li);

            if(i >= settings.itemsShown) {
                li.hide();
            }

            // rating
            var raty = $('<div class="eexcess_raty"  data-uri="' + item.uri + '" data-pos="' + pos + '"></div');
            _rating(raty, item.uri, item.rating);
            li.append(raty);

            var containerL = $('<div class="resCtL"></div>');
            li.append(containerL);
            containerL.append(_link(item.uri, img, '<img class="eexcess_previewIMG" src="' + img + '" />'));

            // contents
            var resCt = $('<div class="eexcess_resContainer"></div>');
            resCt.append(_link(item.uri, img, title));
            li.append(resCt);

            // partner icon
            if (typeof item.facets.provider !== 'undefined') {
                containerL.append($('<img src="' + settings.pathToMedia + 'icons/' + item.facets.provider + '-favicon.ico" class="partner_icon" />'));
            }

            // show link
            var linkCopy = $('<a href="" title="show URL of the resource"><img src="' + settings.pathToMedia + 'icons/link.png" /></a>');
            linkCopy.click(function(evt) {
                evt.preventDefault();
                _dialog.children('p').text(this);
                var at = 'center top+' + evt.pageY;
                _dialog.dialog({
                    title: 'URL of the resource',
                    height: 130,
                    position: {my: "center", at: at}
                });
                // select the link
                var selection = window.getSelection();
                var range = document.createRange();
                range.selectNodeContents(_dialog.children('p').get()[0]);
                selection.removeAllRanges();
                selection.addRange(range);
            }.bind(item.uri));
            containerL.append(linkCopy);

            // description
            if (typeof item.description !== 'undefined' && item.description !== '') {
                var shortDescription = shortenDescription(item.description);
//                resCt.append($('<p class="result_description">' + item.description + '</p>'));
                resCt.append($('<p class="result_description">' + shortDescription + '</p>'));
            }
            resCt.append($('<p style="clear:both;"></p>'));

        }
//            $('#eexcess_loading').remove(); TODO: loading functionality
//            TODO: scrolling stuff...
//            if ($('#eexcess_resultList').data('total') > $('#eexcess_resultList li').length) {
//                $('#eexcess_content').scroll(function() {
//                    EEXCESS.scrollalert(true);
//                });
//            } else {
//                $('#eexcess_content').scroll(function() {
//                    EEXCESS.scrollalert(false);
//                });
//            }
    };
    var shortenDescription = function(description) {

        var firstPart = description.substring(0, 100);
        var remainder = description.substring(100, description.length);
        var endPos = remainder.search(/[.!?; ]/);
        if (endPos != -1) {
            firstPart += remainder.substring(0, endPos);
            firstPart += "...";
        }
        return firstPart;
    }
//    };
    return {
        showResults: showResults,
        loading: function() {
            divContainer.find('.pagination').remove();
            _error.hide();
            _list.empty();
            _loader.show();
        }
    };
};

