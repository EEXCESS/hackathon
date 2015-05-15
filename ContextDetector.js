var EEXCESS = EEXCESS || {};

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

EEXCESS.entitiesFromStatistic = function(statistic) {
    var converter = function(el) {
        var entity = {
            text: el.key.text,
            weight: el.value,
            confidence: el.key.confidence,
            uri: el.key.entityUri
        };
        return entity;
    };
    var entities = {
        persons: [],
        organizations: [],
        locations: [],
        misc: []
    };
    for (var i = 0; i < statistic.length; i++) {
        switch (statistic[i].key.type) {
            case 'Person':
                entities.persons.push(converter(statistic[i]));
                break;
            case 'Organization':
                entities.organizations.push(converter(statistic[i]));
                break;
            case 'Location':
                entities.locations.push(converter(statistic[i]));
                break;
            default:
                entities.misc.push(converter(statistic[i]));
                break;
        }
    }
    return entities;
};

EEXCESS.topKcorpus = function(corpus, k) {
    var orgK = k;
    var topK = [];
    var divisor = 1;
    var sorted = EEXCESS.sortTokens(corpus, function(t1, t2) {
        return t2.value['c'] - t1.value['c'];
    });
    // first word
    if (typeof sorted[0] !== 'undefined') {
        if (window.location.hostname.indexOf(sorted[0].key) === -1) {
            divisor = sorted[0].value['c'];
            topK.push({
                "weight": 1,
                "text": sorted[0].key
            });
        } else {
            k++;
        }
    }
    for (var i = 1; i < k && i < sorted.length; i++) {
        if (typeof sorted[i] !== 'undefined') {
            if (window.location.hostname.indexOf(sorted[i].key) === -1) {
                topK.push({
                    "weight": (sorted[i].value['c'] / divisor),
                    "text": sorted[i].key
                });
            } else {
                k++;
            }
        } else {
            break;
        }
    }

    // extract title keywords
    var title_keywords_raw = document.title.match(/([Ã¤Ã¶Ã¼Ã„Ã–ÃœÃŸ\w-_]{3,})/g) || [];
    var title_keywords = [];
    for (var i = 0; i < title_keywords_raw.length; i++) {
        var tmp = title_keywords_raw[i].toLowerCase();
        if (window.location.hostname.toLowerCase().indexOf(tmp) === -1) {
            title_keywords.push(tmp);
        }
    }

    // set title keywords weight to 1
    for (var i = 0; i < title_keywords.length; i++) {
//        var found = false;
        for (var j = 0; j < topK.length; j++) {
            if (title_keywords[i] === topK[j]['text']) {
                topK[j]['weight'] = 1;
//                found = true;
                break;
            }
        }
//        if (!found) {
//            topK.unshift({"weight": 1, "text": title_keywords[i]});
//        }
    }
    if (topK.length > orgK) {
        return topK.slice(0, orgK);
    }
    return topK;
};

EEXCESS.triggerQuery = function(textElements, reason, entities) {
    EEXCESS.messaging.callBG({method: {parent: 'corpus', func: 'getCorpus'}, data: textElements}, function(result) {
        var query = EEXCESS.topKcorpus(result, 10);
        var queryData = {reason: reason, terms: query};
        if (typeof entities !== 'undefined') {
            queryData['contextNamedEntities'] = entities;
        }
        EEXCESS.messaging.callBG({method: {parent: 'model', func: 'query'}, data: queryData});
    });
};

EEXCESS.queryFromTf = function() {
    // get all text elements
    var elements = [];
    var walker = document.createTreeWalker(
            document.body,
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
        var cond5 = $(node.parentNode).filter(':visible').length > 0;
        if (containsText !== -1 && cond1 && cond2 && cond3 && cond5) {
            elements.push({text: node.nodeValue, parent: parent});
        }
    }
    EEXCESS.triggerQuery(elements, {reason: 'page', value: window.location.protocol + '//' + window.location.host + window.location.pathname, url: window.location.hostname});
}();

EEXCESS.selectedText = '';

$(document).mouseup(function() {
    var text = window.getSelection().toString();
    if (text !== '') {
        if (text !== EEXCESS.selectedText) {
            EEXCESS.selectedText = text;
            var elements = [];
            elements.push({text: text});
            var parentPars = $(window.getSelection().getRangeAt(0).commonAncestorContainer).parents('.eexcess_detected_par');
            var enrichedParagraphs = EEXCESS.queryParagraphs.enrichedParagraphs();
            if (typeof enrichedParagraphs !== 'undefined' && parentPars.length > 0) {
                var parID = parentPars[0].id;
                var idx;
                if (parID.charAt(8) === 'c') {
                    idx = EEXCESS.queryParagraphs.single.length + parseInt(parID.slice(9));
                } else {
                    idx = parseInt(parID.slice(9));
                }
                EEXCESS.triggerQuery(elements, {reason: 'selection', value: document.getSelection().toString()}, EEXCESS.entitiesFromStatistic(enrichedParagraphs.paragraphs[idx].statistic));
            } else {
                EEXCESS.triggerQuery(elements, {reason: 'selection', value: document.getSelection().toString()});
            }
            if ($('#eexcess_toggler').is(':visible')) {
                $('#eexcess_sidebar').show('fast');
                $('#eexcess_toggler').css('background-image', 'url(chrome-extension://' + EEXCESS.utils.extID + '/media/icons/hide.png)');
            }
        }
    }
});


EEXCESS.queryFromTitle = function() {
    var otherURLs = [];
    var otherTitles = [];
    var urlIDX = 0;
    var k = 7;
    var threshold = 2;
    var queryStringArr = document.title.replace(/[^\w\sÃ¤Ã¶Ã¼Ã„Ã–ÃœÃŸ]/g, ' ').match(/[^ ]+/g);
    for (var i = 0; i < document.links.length; i++) {
        if (document.links[i].hostname === window.location.hostname && document.links[i].attributes[0].value.charAt(0) !== '#') {
            otherURLs.push(document.links[i].href);
        }
    }

    for (var i = 0; i < k && i < otherURLs.length; i++) {
        var xhr = $.ajax({
            url: otherURLs[i],
            dataType: 'html',
            timeout: 5000
        });
        xhr.done(function(data, textStatus, jqXHR) {
            urlIDX++;
            var ct = xhr.getResponseHeader("content-type") || "";
            if (ct === '' || ct.indexOf('html') !== -1) {
                var doc = document.implementation.createHTMLDocument("tmp");
                doc.documentElement.innerHTML = data;
                otherTitles.push(doc.title.replace(/[^\w\sÃ¤Ã¶Ã¼Ã„Ã–ÃœÃŸ]/g, ' ').match(/[^ ]+/g));
            }
            if (urlIDX === k) {
                setQueryString();
            }
        });
        xhr.fail(function(jqxhr, textStatus, errorThrown) {
            urlIDX++;
            if (urlIDX === k) {
                setQueryString();
            }
        });
    }

    var setQueryString = function() {
        var title = document.title.replace(/[^\w\sÃ¤Ã¶Ã¼Ã„Ã–ÃœÃŸ]/g, ' ').match(/[^ ]+/g);
        for (var i = 0; i < title.length; i++) {
            var occForward = 0;
            var occBackward = 0;
            for (var j = 0; j < otherTitles.length; j++) {
                if (otherTitles[j].length > i) {
                    if (otherTitles[j][i] === title[i]) {
                        occForward++;
                    }
                    if (otherTitles[j][otherTitles[j].length - i - 1] === title[title.length - i - 1]) {
                        occBackward++;
                    }
                }
            }
            if (occForward > threshold) {
                queryStringArr[i] = '';
            }
            if (occBackward > threshold) {
                queryStringArr[queryStringArr.length - i - 1] = '';
            }
        }
        var query = [];
        for (var i = 0; i < queryStringArr.length; i++) {
            if (queryStringArr[i].length > 0) {
                query.push(queryStringArr[i]);
            }
        }
        if (query.length === 0) {
            query = document.title.replace(/[^\w\sÃ¤Ã¶Ã¼Ã„Ã–ÃœÃŸ]/g, ' ').match(/[^ ]+/g);
        }
        ;
        var weightedQuery = [];
        for (var i = 0; i < query.length; i++) {
            weightedQuery.push({
                text: query[i],
                weight: 1.0
            });
        }
        EEXCESS.messaging.callBG({method: {parent: 'model', func: 'query'}, data: {reason: {reason: 'page', value: window.location.protocol + '//' + window.location.host + window.location.pathname, url: window.location.hostname}, terms: weightedQuery}});
    };
};


EEXCESS.queryParagraphs = function() {
    var enrichedParagraphs;
    var corresponding = [];
    var single = [];

    var delayTimer = {
        setTimer: function(callback, delay) {
            if (typeof delay === 'undefined') {
                delay = 100;
            }
            // execute pending timer immediately
//            if (typeof this.timeoutID !== 'undefined') {
//                window.clearTimeout(this.timeoutID);
//                this.callback();
//                delete this.timeoutID;
//            }
            // add new timer
            this.callback = callback;
            this.timeoutID = window.setTimeout(callback, delay);
        },
        clearTimer: function() {
            window.clearTimeout(this.timeoutID);
            delete this.timeoutID;
        }
    };

    var _getParagraphs = function() {
        var pars = [];
        var walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_TEXT
                );

        var node;
        while (node = walker.nextNode()) {
            var containsText = node.nodeValue.search(/\S+/);
            var parent = node.parentNode.nodeName;
            var cond1 = parent !== 'SCRIPT'; // exclude script areas
            var cond2 = parent !== 'STYLE';  // exclude style areas
            var cond3 = parent !== 'NOSCRIPT'; // exclude noscript areas
            var cond4 = parent !== 'A';
            var minLength = node.nodeValue.length > 40;
            if (containsText !== -1 && cond1 && cond2 && cond3 && minLength) {
                if (pars.indexOf(node.parentNode) === -1) {
                    pars.push(node.parentNode);
                }
            }
        }
        return pars;
    };

    var _getHeadline = function(parNode) {
        var walker = document.createTreeWalker(
                document.body,
                NodeFilter.SHOW_ELEMENT
                );

        var node = parNode;
        walker.currentNode = node;
        while (node = walker.previousNode()) {
            if (node.nodeName.indexOf('H') === 0) {
                return node;
            }
        }
        return null;
    };

    var paragraphs = _getParagraphs();

    for (var i = 0; i < paragraphs.length; i++) {
        var next = paragraphs[i].nextSibling;
        var sole = true;
        var j = i;
        var neighbours = [];
        while (next !== null) {
            if (next.nodeName !== '#text') {
                var idx = $.inArray(next, paragraphs, j);
                if (idx > -1) {
                    j = idx;
                    neighbours.push(paragraphs[j]);
                    sole = false;
                    next = next.nextSibling;
                } else {
                    next = null;
                }
            } else {
                next = next.nextSibling;
            }
        }
        if (sole) {
            var text = $(paragraphs[i]).text();
            if (text.length > 100 && text.indexOf('.') > -1) {
                single.push(paragraphs[i]);
            }
        } else {
            neighbours.unshift(paragraphs[i]);
            corresponding.push(neighbours);
            i = j;
        }
    }

    var finalParagraphs = [];

    for (var i in single) {
        var h = _getHeadline(single[i]);
        $(single[i]).wrap('<div id="eexcess_s' + i + '" class="eexcess_detected_par"></div>');
        finalParagraphs.push({
            headline: $(h).text(),
            content: $(single[i]).text(),
            id:'s'+i
        });
    }
    for (var i in corresponding) {
        var h = _getHeadline(corresponding[i][0]);
        var text = '';
        var tmpCorr = $(corresponding[i]);
        for (var k = 0; k < corresponding[i].length; k++) {
            text += $(corresponding[i][k]).text();
        }
        tmpCorr.wrapAll('<div id="eexcess_c' + i + '" class="eexcess_detected_par"></div>');
        finalParagraphs.push({
            headline: $(h).text(),
            content: text,
            id:'c'+i
        });
    }

    // augment links in paragraphs
    var augmentLinks = function(paragraphs) {
        var img = $('<img src="chrome-extension://' + EEXCESS.utils.extID + '/media/icons/38.png" style="cursor:pointer;width:30px;" />');
        img.click(function() {
            if ($('#eexcess_toggler').is(':visible')) {
                $('#eexcess_sidebar').show('fast');
                $('#eexcess_toggler').css('background-image', 'url(chrome-extension://' + EEXCESS.utils.extID + '/media/icons/hide.png)');
            } else {
                EEXCESS.messaging.callBG({method: {parent: 'model', func: 'toggleVisibility'}, data: -1});
            }
            if (typeof enrichedParagraphs !== 'undefined') {
                var parID = $(this).data('paragraphID');
                var idx;
                if (parID.charAt(8) === 'c') {
                    idx = single.length + parseInt(parID.slice(9));
                } else {
                    idx = parseInt(parID.slice(9));
                }
                EEXCESS.triggerQuery([{text: $(this).data('query')}], {reason: 'link'}, EEXCESS.entitiesFromStatistic(enrichedParagraphs.paragraphs[idx].statistic));
            } else {
                EEXCESS.triggerQuery([{text: $(this).data('query')}], {reason: 'link'});
            }
        })
                .hover(function() {
            delayTimer.clearTimer();
        }, function() {
            $(this).hide();
        })
                .css('position', 'absolute')
                .css('z-index', 9999)
                .mouseleave(function() {
            $(this).hide();
        })
                .hide();
        $('body').append(img);
        var xOffset = 25;
        var yOffset = -2;
        paragraphs.find('a').each(function() {
            var el = $(this);
            if (el.text().length > 3) {
                var wrapper = $('<div style="display:inline;"></div>');
                wrapper.mouseenter(function(evt) {
                    delayTimer.clearTimer();
                    img.data('query', el.text());
                    img.data('paragraphID', el.parents('.eexcess_detected_par')[0].id);
                    var el2 = $(this);
                    var offset = el2.offset();
                    img
                            .css('top', (offset.top - el2.height() + yOffset) + 'px')
                            .css('left', offset.left - xOffset + 'px')
                            .show();
                });
                wrapper.mouseleave(function() {
                    delayTimer.setTimer(function() {
                        img.hide();
                    });
                });
                el.wrap(wrapper);
            }
        });
    };

    augmentLinks($('.eexcess_detected_par'));

    var showEntities = function() {
        EEXCESS.messaging.callBG({method: {parent: 'NER', func: 'getParagraphEntities'}, data: finalParagraphs}, function(result) {
            var addEntities = function(prefix, i, id) {
                var img = $('<img src="chrome-extension://' + EEXCESS.utils.extID + '/media/icons/16.png" style="margin:0;padding:0;" />');
                $('#' + prefix + id).prepend(img);
                var entities = '';
                for (var j = 0; j < result.paragraphs[i].statistic.length; j++) {
                    if (j < result.paragraphs[i].statistic.length - 1) {
                        entities += ' ' + result.paragraphs[i].statistic[j].key.text + ' |';
                    } else {
                        entities += ' ' + result.paragraphs[i].statistic[j].key.text;
                    }
                }
                img.after('<span style="color:#1D904E;font-weight:bold;">' + entities + '</span>');
            };

            for (var i = 0; i < result.paragraphs.length; i++) {
                if (i < single.length) {
                    addEntities('eexcess_s', i, i);
                } else {
                    addEntities('eexcess_c', i, i - single.length);
                }
            }
            console.log(result);
        });
    };

    EEXCESS.messaging.callBG({method: {parent: 'NER', func: 'getParagraphEntityTypes'}, data: finalParagraphs}, function(result) {
        enrichedParagraphs = result;
        var valueStr = function(val) {
            if (val === 1) {
                return '';
            }
            return '<span style="color:gray;font-weight:normal"> ' + val + '</span>';
        };
        var increment = function(dict, key, val, weight) {
            if (key in dict) {
                dict[key].count += weight;
                dict[key].occurrences += 1;
            } else {
                dict[key] = val;
                val.count = weight;
                val.occurrences = 1;
            }
        };

        var addCategories = function(el, i, threshold) {

            var categories = {};
            for (var j = 0; j < result.paragraphs[i].statistic.length; j++) {
                var current = result.paragraphs[i].statistic[j];
                for (var k = 0; k < current.key.categories.length; k++) {
                    increment(categories, current.key.categories[k].uri, current.key.categories[k], current.value);
                }
            }
            categories = Object.keys(categories).map(function(key) {
                return categories[key];
            });
            categories.sort(function(a, b) {
                return b.count - a.count;
            });
            var categories_html = '';
            for (var j = 0; j < categories.length; j++) {
                if (categories[j].occurrences > threshold) {
                    if (j < categories.length - 1) {
                        categories_html += ' ' + categories[j].name + valueStr(categories[j].count) + '@' + valueStr(categories[j].occurrences) + ' |';
                    } else {
                        categories_html += ' ' + categories[j].name + valueStr(categories[j].count) + '@' + valueStr(categories[j].occurrences);
                    }
                }
            }
            categories_html += '<hr/>';
            el.prepend('<span style="color:red;font-weight:bold;">' + categories_html + '</span>');
        };


        var addEntities = function(el, i) {
            var entities = '';
            result.paragraphs[i].statistic.sort(function(a, b) {
                return b.value - a.value
            });
            for (var j = 0; j < result.paragraphs[i].statistic.length; j++) {
                if (j < result.paragraphs[i].statistic.length - 1) {
                    entities += ' ' + result.paragraphs[i].statistic[j].key.text + valueStr(result.paragraphs[i].statistic[j].value) + ' |';
                } else {
                    entities += ' ' + result.paragraphs[i].statistic[j].key.text + valueStr(result.paragraphs[i].statistic[j].value);
                }
            }
            el.prepend('<span style="color:#1D904E;font-weight:bold;">' + entities + '</span>');
        };

        var threshold = 1;
//        for (var i = 0; i < result.paragraphs.length; i++) {
//            if (i < single.length) {
//                var el = $('#' + 'eexcess_s' + i);
//                addEntities(el, i);
//                addCategories(el, i, threshold);
//            } else {
//                var el = $('#' + 'eexcess_c' + (i - single.length));
//                addEntities(el, i);
//                addCategories(el, i, threshold);
//            }
//        }
    });
    return {
        single: single,
        corresponding: corresponding,
        enrichedParagraphs: function() {
            return enrichedParagraphs;
        }
    };
}();
