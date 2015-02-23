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
    var title_keywords_raw = document.title.match(/([äöüÄÖÜß\w-_]{3,})/g) || [];
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

EEXCESS.triggerQuery = function(textElements, reason) {
    EEXCESS.messaging.callBG({method: {parent: 'corpus', func: 'getCorpus'}, data: textElements}, function(result) {
        var query = EEXCESS.topKcorpus(result, 10);
        EEXCESS.messaging.callBG({method: {parent: 'model', func: 'query'}, data: {reason: reason, terms: query}});
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
};

EEXCESS.selectedText = '';

$(document).mouseup(function() {
    var text = window.getSelection().toString();
    if (text !== '') {
        if (text !== EEXCESS.selectedText) {
            EEXCESS.selectedText = text;
            var elements = [];
            elements.push({text: text});
            EEXCESS.triggerQuery(elements, {reason: 'selection', value: document.getSelection().toString()});
        }
    }
});


EEXCESS.queryFromTitle = function() {
    var start = new Date().getTime();
    var otherURLs = [];
    var otherTitles = [];
    var urlIDX = 0;
    var k = 7;
    var threshold = 2;
    var queryStringArr = document.title.replace(/[^\w\säöüÄÖÜß]/g, ' ').match(/[^ ]+/g);
    for (var i = 0; i < document.links.length; i++) {
        if (document.links[i].hostname === window.location.hostname && document.links[i].attributes[0].value.charAt(0) !== '#') {
            otherURLs.push(document.links[i].href);
        }
    }

    for (var i = 0; i < k && i < otherURLs.length; i++) {
        console.log(otherURLs[i]);
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
                otherTitles.push(doc.title.replace(/[^\w\säöüÄÖÜß]/g, ' ').match(/[^ ]+/g));
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
        console.log(queryStringArr);
        console.log(otherTitles);
        var title = document.title.replace(/[^\w\säöüÄÖÜß]/g, ' ').match(/[^ ]+/g);
        for(var i=0; i< title.length; i++) {
            var occForward = 0;
            var occBackward = 0;
            for(var j=0; j < otherTitles.length; j++) {
                if(otherTitles[j].length > i) {
                    if(otherTitles[j][i] === title[i]) {
                        occForward++;
                    }
                    if(otherTitles[j][otherTitles[j].length-i-1] === title[title.length-i-1]) {
                        occBackward++;
                    }
                }
            }
            if(occForward > threshold) {
                queryStringArr[i] = '';
            }
            if(occBackward > threshold) {
                queryStringArr[queryStringArr.length-i-1] = '';
            }
        }
        var query = [];
        for(var i=0;i<queryStringArr.length;i++) {
            if(queryStringArr[i].length > 0) {
                query.push(queryStringArr[i]);
            }
        }
        if(query.length === 0) {
            query = document.title.replace(/[^\w\säöüÄÖÜß]/g, ' ').match(/[^ ]+/g);
        };
        var weightedQuery = [];
        for(var i=0;i<query.length;i++) {
            weightedQuery.push({
                text:query[i],
                weight:1.0
            });
        }
        EEXCESS.messaging.callBG({method: {parent: 'model', func: 'query'}, data: {reason: {reason: 'page', value: window.location.protocol + '//' + window.location.host + window.location.pathname, url: window.location.hostname}, terms: weightedQuery}});
    };
    var start = new Date().getTime() - start;
    console.log(start + 'ms');
}();


