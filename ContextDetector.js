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
    EEXCESS.messaging.callBG({method: {parent: 'corpus', func: 'getCorpus'}, data: textElements}, function(result) {
        var query = EEXCESS.topKcorpus(result, 10);
        EEXCESS.messaging.callBG({method: {parent: 'model', func: 'query'}, data: {reason:reason,terms:query}});
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
    EEXCESS.triggerQuery(elements, {reason:'page',page: window.location.protocol + '//' +  window.location.host + window.location.pathname});
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
