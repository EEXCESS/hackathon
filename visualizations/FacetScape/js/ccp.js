function requestEuropeana(term, dataCallbackFct) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET',
        'http://europeana.eu/api//v2/search.json?wskey='
            + 'kfUs6T3Kj'
            + '&query=' + term
            + '&rows=200&profile=facets', true);

    xhr.onload = function() {


        var res = JSON.parse(xhr.response);
        console.log(res);
        var processedData = preprocessEuropeana(res);
        console.log(processedData);
        console.log(res.items);
        dataCallbackFct(processedData, res.items);
    };
    xhr.onerror = function() {
        console.log("error");
    };
    xhr.send();
}

function requestPlugin(dataCallbackFct) {

    chrome.runtime.sendMessage(chrome.i18n.getMessage('@@extension_id'), {method: {parent: 'model', func: 'getResults'},data: null}, function(query, results) {
        var queryTerms = query;
        var data = results;
        var facets = ppEEXCESSFacetInfo(data);
        var results = ppEEXCESSResultInfo(data);
        console.log(data);
        dataCallbackFct(facets, data.results);
    });
}
/*
 input: terms is [{term: Loom, weight: 0.9},{term: weaving, weight: 0.6}, ...]
 */
function requestFRecommender(terms, dataCallbackFct) {
    var url = "http://federatedRecommender/...";
    var request = {'eexcess-user-profile':
                        {
                            'interests': [],
                            'context-list': {
                                'context': []
                            }
                        }
    };
    for(var i = 0; i < terms.length; i++) {
        request['eexcess-user-profile']['context-list']['context'].push({'weight': terms[i]['weight'], 'text': terms[i]['text']});
    }
    console.log(request);
//    $.ajax({
//        type: "POST",
//        url: url,
//        data: request,
//        success: receiveData,
//        dataType: "json"
//    });
//
//    function receiveData(data) {
//        var results = JSON.parse(data);
//        dataCallbackFct(results);
//    }
}

function loadDetailedInfo(link, container, fctCallback) {

    var xhr = new XMLHttpRequest();
    //xhr.timeout = 5000;
    xhr.open('GET', link, true);

    xhr.onload = function() {

        var info = JSON.parse(xhr.response);
        fctCallback(info, container, true);
    };

    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4 && xhr.status == 200) {
           clearTimeout(xhrTimeout);
        }
    };

    var xhrTimeout=setTimeout(ajaxTimeout,10000);
    function ajaxTimeout(){
        xhr.abort();
        fctCallback(null, container, false);
    }

    xhr.onerror = function() {
        console.log("error");
    };
    xhr.send();
}

function preprocessEuropeana(data) {
    var processedData = [];
//    var colors = {
//        "UGC":"#FFE4CC",
//        "country":"#FFFDC9",
//        "dataProvider": "#E6FFC7",
//        "language": "#C7FFF2",
//        "provider": "#C9E2FF",
//        "rights": "#F2CCFF",
//        "type": "#FFC9E5",
//        "year": "#CCFFD3"
//    };
    var colors = {
        "UGC":"#D6D0C4",
        "country":"#D6D0C4",
        "dataProvider": "#D6D0C4",
        "language": "#D6D0C4",
        "provider": "#D6D0C4",
        "rights": "#D6D0C4",
        "type": "#D6D0C4",
        "year": "#D6D0C4"
    };
    var facets = {
        "UGC": {},
        "country": {},
        "dataProvider": {},
        "language": {},
        "provider": {},
        "rights": {},
        "type": {},
        "year": {}
    };
    for(var key in facets) {
        for(var i = 0; i < data.items.length; i++) {
            if(data.items[i].hasOwnProperty(key)) {
                if(data.items[i][key] instanceof Array) {
                    for(var t = 0; t < data.items[i][key].length; t++) {
                        var ctag = getCanonicalString(data.items[i][key][t]);
                        facets[key][ctag] = (typeof facets[key][ctag] == "undefined" ? 1 : ++facets[key][ctag]);
                    }
                } else {
                    var ctag = getCanonicalString(data.items[i][key]);
                    facets[key][ctag] = (typeof facets[key][ctag] == "undefined" ? 1 : ++facets[key][ctag]);
                }
            }
        }
        var tags = [];
        for(var t in facets[key]) {
            tags.push({"word":t, "frequency":facets[key][t]});
        }
        if(tags.length > 1) {
            processedData.push({"name":key, "color": colors[key], "tags":tags});
        }
    }
    delete facets;
    return processedData;
}

function ppEEXCESSFacetInfo(data) {
    var processedData = [];
    var facets = [];
    console.log(data);
    for(var i = 0; i < data.results.length; i++) {
        var itemFacets = data.results[i].facets;
        for(var key in itemFacets) {
            if(!facets.hasOwnProperty(key)) {
                facets[key] = {};
            }
            var tag = itemFacets[key];
            facets[key][tag] = (typeof facets[key][tag] == "undefined" ? 1 : ++facets[key][tag]);
        }
    }

    for(var facet in facets) {
        if(typeof facets[facet] != "undefined") {
            var tags = [];
            for(var tag in facets[facet]) {
                tags.push({"word":tag, "frequency": facets[facet][tag]});
            }
            processedData.push({"name": facet, "type":0, "color": "#D6D0C4", "tags": tags});
        }
    }
    delete facets;
    return processedData;

//    var facets = {
//        "UGC": {},
//        "country": {},
//        "dataProvider": {},
//        "language": {},
//        "provider": {},
//        "rights": {},
//        "type": {},
//        "year": {}
//    };
//    for(var key in facets) {
//        for(var i = 0; i < data.items.length; i++) {
//            if(data.items[i].hasOwnProperty(key)) {
//                if(data.items[i][key] instanceof Array) {
//                    for(var t = 0; t < data.items[i][key].length; t++) {
//                        var ctag = getCanonicalString(data.items[i][key][t]);
//                        facets[key][ctag] = (typeof facets[key][ctag] == "undefined" ? 1 : ++facets[key][ctag]);
//                    }
//                } else {
//                    var ctag = getCanonicalString(data.items[i][key]);
//                    facets[key][ctag] = (typeof facets[key][ctag] == "undefined" ? 1 : ++facets[key][ctag]);
//                }
//            }
//        }
//        var tags = [];
//        for(var t in facets[key]) {
//            tags.push({"word":t, "frequency":facets[key][t]});
//        }
//        // TODO: find an appropriate data type for each facet to load type specific visualizations
//        if(tags.length > 1) {
//            processedData.push({"name":key, "type":0, "color": "#D6D0C4", "tags":tags});
//        }
//    }
//    delete facets;
//    return processedData;
}
function ppEEXCESSResultInfo(data) {
    var results = [];
    for(var i = 0; i < data.results.length; i++) {
        var resultItem = data.results[i];
        var facets = data.results[i]['facets'];
        for(var facetType in facets) {
            resultItem[facetType] = facets[facetType];
        }
        results.push(resultItem);
    }
    return results;
}

function getCanonicalString(str) {
    var arrOfStr = str.toLowerCase().split(" ");
    var canonStr = "";
    if(str.match("http") || str.match("www")) {
        return str;
    }
    for(var i = 0; i < arrOfStr.length; i++) {
        canonStr += arrOfStr[i].charAt(0).toUpperCase() + arrOfStr[i].slice(1);
        if(i < arrOfStr.length - 1) {
            canonStr += " ";
        }
    }
    return canonStr;
}