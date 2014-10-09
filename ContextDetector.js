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
    var title_keywords_raw = document.title.match(/([äöüÄÖÜß\w-_]{3,})/g);
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

EEXCESS.initiateQuery = function() {
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
    EEXCESS.triggerQuery(elements, {reason: 'page', context: window.location.protocol + '//' + window.location.host + window.location.pathname, url:window.location.href});
}();

EEXCESS.selectedText = '';

$(document).mouseup(function() {
    var text = window.getSelection().toString();
    if (text !== '') {
        if (text !== EEXCESS.selectedText) {
            EEXCESS.selectedText = text;
            var elements = [];
            elements.push({text: text});
            EEXCESS.triggerQuery(elements, {reason: 'selection', context: document.getSelection().toString()});
        }
    }
});
