var PROVIDER = (function() {
    var internal = {
        width: 900,
        height: 900,
        domElem: null,
        currentProvider: null,
        facetScape: null,
        onReceiveData: function(queryTerms, processedData, items) {
<<<<<<< HEAD
            $('#loader').hide();
            $('#facetScape').show();
            $('#RS_ResultList').show();
            internal.width = $(window).width();
            internal.height = $(window).height();
            if (internal.facetScape != null) {
=======
            $('#loader').hide();
            $('#facetScape').show();
            $('#RS_ResultList').show();
            internal.width = $(window).width();
            internal.height = $(window).height();
            if (internal.facetScape != null) {
>>>>>>> origin/master
                internal.facetScape.draw(queryTerms, processedData, items)
            } else {
                internal.facetScape = facetScape(internal.domElem, internal.width, internal.height, processedData, items, queryTerms);
            }
        },
<<<<<<< HEAD
        europeana: {
            url: 'http://europeana.eu/api//v2/search.json?wskey=kfUs6T3Kj',
=======
        europeana: {
            url: 'http://europeana.eu/api//v2/search.json?wskey=kfUs6T3Kj',
>>>>>>> origin/master
            request: function(term) {

                var xhr = new XMLHttpRequest();
                xhr.open('GET', internal.europeana.url + '&query=' + term + '&rows=200&profile=facets', true);
                xhr.onload = function() {
                    var data = JSON.parse(xhr.response);
                    var ppFacets = internal.europeana.preprocessFacets(data);
                    var ppResults = internal.europeana.preprocessResults(data);
                    internal.onReceiveData(term, ppFacets, ppResults);
                };
                xhr.onerror = function() {
                    console.log("error");
                };
                xhr.send();
<<<<<<< HEAD
            },
            preprocessFacets: function(data) {
                var processedData = [];
                var colors = {
                    "UGC": "#D6D0C4",
                    "country": "#D6D0C4",
=======
            },
            preprocessFacets: function(data) {
                var processedData = [];
                var colors = {
                    "UGC": "#D6D0C4",
                    "country": "#D6D0C4",
>>>>>>> origin/master
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
<<<<<<< HEAD
                for (var key in facets) {
                    for (var i = 0; i < data.items.length; i++) {
                        if (data.items[i].hasOwnProperty(key)) {
                            if (data.items[i][key] instanceof Array) {
                                for (var t = 0; t < data.items[i][key].length; t++) {
=======
                for (var key in facets) {
                    for (var i = 0; i < data.items.length; i++) {
                        if (data.items[i].hasOwnProperty(key)) {
                            if (data.items[i][key] instanceof Array) {
                                for (var t = 0; t < data.items[i][key].length; t++) {
>>>>>>> origin/master
                                    var ctag = PROVIDER.getCanonicalString(data.items[i][key][t]);
                                    facets[key][ctag] = (typeof facets[key][ctag] == "undefined" ? 1 : ++facets[key][ctag]);
                                }
                            } else {
                                var ctag = PROVIDER.getCanonicalString(data.items[i][key]);
                                facets[key][ctag] = (typeof facets[key][ctag] == "undefined" ? 1 : ++facets[key][ctag]);
                            }
                        }
                    }
                    var tags = [];
<<<<<<< HEAD
                    for (var t in facets[key]) {
                        if (t != "") {
                            tags.push({"word": t, "frequency": facets[key][t]});
                        }
                    }
                    if (tags.length > 1) {
                        processedData.push({"name": key, "color": colors[key], "tags": tags});
=======
                    for (var t in facets[key]) {
                        if (t != "") {
                            tags.push({"word": t, "frequency": facets[key][t]});
                        }
                    }
                    if (tags.length > 1) {
                        processedData.push({"name": key, "color": colors[key], "tags": tags});
>>>>>>> origin/master
                    }
                }
                delete facets;
                return processedData;
<<<<<<< HEAD
            },
=======
            },
>>>>>>> origin/master
            'preprocessResults': function(data) {
                return data.items;
            }
        },
        EEXCESS: {
            url: null,
            request: function(queryTerms, action) {

                var updateFacetScape = function(response) {
<<<<<<< HEAD
                    if ((typeof response == "undefined") || response == null) {
                        d3.select("#facetScape").text("no data available");
                    } else if (typeof response.results === 'undefined' || response.results === null) {
                        var queryTerms = '';
                        var data = {results: []};
                        var facets = internal.EEXCESS.preprocessFacets(data);
                        var results = internal.EEXCESS.preprocessResults(data);
                        internal.onReceiveData(queryTerms, facets, results);
                    }
                    else {
=======
                    if ((typeof response == "undefined") || response == null) {
                        d3.select("#facetScape").text("no data available");
                    } else if (typeof response.results === 'undefined' || response.results === null) {
                        var queryTerms = '';
                        var data = {results: []};
                        var facets = internal.EEXCESS.preprocessFacets(data);
                        var results = internal.EEXCESS.preprocessResults(data);
                        internal.onReceiveData(queryTerms, facets, results);
                    }
                    else {
>>>>>>> origin/master
                        var queryTerms = response.query;
                        var data = response.results;
                        var facets = internal.EEXCESS.preprocessFacets(data);
                        var results = internal.EEXCESS.preprocessResults(data);
                        internal.onReceiveData(queryTerms, facets, results);
                    }
                }
<<<<<<< HEAD
                if (typeof action == "undefined") {

                    EEXCESS.messaging.callBG({method: {parent: 'model', func: 'getResults'}, data: null}, function(reqResult) {
                        updateFacetScape(reqResult);
                    });
////                    EEXCESS.messaging.callBG({method: {parent: 'model', func: 'getResults'}, data: null}, function(reqResult) {
////                        updateFacetScape(reqResult);
//                        EEXCESS.messaging.callBG({method: {parent: 'model', func: 'replayQuery'}, data: 99}, function(reqResult) {
//                            updateFacetScape(reqResult);
//                        });
////                    });
                } else if (action == "refresh") {
                    EEXCESS.messaging.listener(
                            function(request, sender, sendResponse) {
                                if (request.method === 'newSearchTriggered') {
                                    updateFacetScape(request.data);
                                }
                                if (request.method.parent === 'results' && request.method.func === 'error') {
                                    $('#loader img').hide();
                                    if(request.data.msg === 'timeout') {
                                        $('#loader p').text('Sorry, the server takes too long to respond. Please try again later.').show();
                                    } else {
                                        $('#loader p').text('Sorry, something went wrong.').show();
                                    }
                                }
                            }
=======
                if (typeof action == "undefined") {

                    EEXCESS.messaging.callBG({method: {parent: 'model', func: 'getResults'}, data: null}, function(reqResult) {
                        updateFacetScape(reqResult);
                    });
////                    EEXCESS.messaging.callBG({method: {parent: 'model', func: 'getResults'}, data: null}, function(reqResult) {
////                        updateFacetScape(reqResult);
//                        EEXCESS.messaging.callBG({method: {parent: 'model', func: 'replayQuery'}, data: 99}, function(reqResult) {
//                            updateFacetScape(reqResult);
//                        });
////                    });
                } else if (action == "refresh") {
                    EEXCESS.messaging.listener(
                            function(request, sender, sendResponse) {
                                if (request.method === 'newSearchTriggered') {
                                    updateFacetScape(request.data);
                                }
                                if (request.method.parent === 'results' && request.method.func === 'error') {
                                    $('#loader img').hide();
                                    if(request.data.msg === 'timeout') {
                                        $('#loader p').text('Sorry, the server takes too long to respond. Please try again later.').show();
                                    } else {
                                        $('#loader p').text('Sorry, something went wrong.').show();
                                    }
                                }
                            }
>>>>>>> origin/master
                    );
                }
            },
            preprocessFacets: function(data) {
                var processedData = [];
                var facets = {};
<<<<<<< HEAD
                for (var i = 0; i < data.results.length; i++) {
                    var itemFacets = data.results[i].facets;
                    for (var key in itemFacets) {
                        if (!facets.hasOwnProperty(key)) {
=======
                for (var i = 0; i < data.results.length; i++) {
                    var itemFacets = data.results[i].facets;
                    for (var key in itemFacets) {
                        if (!facets.hasOwnProperty(key)) {
>>>>>>> origin/master
                            facets[key] = {};
                        }
                        var tag = itemFacets[key];
                        facets[key][tag] = (typeof facets[key][tag] == "undefined" ? 1 : ++facets[key][tag]);
                    }
                }
<<<<<<< HEAD
                for (var facetName in facets) {
                    var facet = {"name": facetName, "color": "#D6D0C4", "tags": []};
                    var tags = [];
                    var unknownFreq = 0;
                    for (var i = 0; i < data.results.length; i++) {
                        if (!data.results[i].facets.hasOwnProperty(facetName)) {
                            unknownFreq += 1;
                        }
                    }
                    for (var tag in facets[facetName]) {
                        if (tag != "") {
                            tags.push({"word": tag, "frequency": facets[facetName][tag]});
                        }
                    }
                    if (tags.length > 0) {
                        if (unknownFreq > 0) {
=======
                for (var facetName in facets) {
                    var facet = {"name": facetName, "color": "#D6D0C4", "tags": []};
                    var tags = [];
                    var unknownFreq = 0;
                    for (var i = 0; i < data.results.length; i++) {
                        if (!data.results[i].facets.hasOwnProperty(facetName)) {
                            unknownFreq += 1;
                        }
                    }
                    for (var tag in facets[facetName]) {
                        if (tag != "") {
                            tags.push({"word": tag, "frequency": facets[facetName][tag]});
                        }
                    }
                    if (tags.length > 0) {
                        if (unknownFreq > 0) {
>>>>>>> origin/master
                            tags.push({"word": "unknown", "frequency": unknownFreq});
                        }
                        facet.tags = tags;
                        processedData.push(facet);
                    }
                }
                delete facets;
                return processedData;
            },
            preprocessResults: function(data) {
                var results = [];
<<<<<<< HEAD
                for (var i = 0; i < data.results.length; i++) {
                    var resultItem = data.results[i];
                    var facets = data.results[i]['facets'];
                    for (var facetType in facets) {
=======
                for (var i = 0; i < data.results.length; i++) {
                    var resultItem = data.results[i];
                    var facets = data.results[i]['facets'];
                    for (var facetType in facets) {
>>>>>>> origin/master
                        resultItem[facetType] = facets[facetType];
                    }
                    results.push(resultItem);
                }
                return results;
            }
        },
        econbiz: {
            recordURL: 'http://www.econbiz.de/Record/',
            url: 'https://api.econbiz.de/v1/search',
            size: 100,
            fields: [
                "accessRights",
                "date",
                "date_sort",
                "date_submission",
                "institution",
                "isPartOf",
                "jel",
                "language",
                "location",
                "person",
                "source",
                "subject",
                "type",
                "type_genre"
            ],
            request: function(term) {
                var facetString = '';
<<<<<<< HEAD
                for (var i = 0; i < internal.econbiz.fields.length; i++) {
                    facetString += internal.econbiz.fields[i];
                    facetString += (i < internal.econbiz.fields.length - 1) ? '+' : '';
=======
                for (var i = 0; i < internal.econbiz.fields.length; i++) {
                    facetString += internal.econbiz.fields[i];
                    facetString += (i < internal.econbiz.fields.length - 1) ? '+' : '';
>>>>>>> origin/master
                }
                $.ajax({
                    url: internal.econbiz.url + '?q=' + term + '&size=' + internal.econbiz.size + '&facets=' + facetString,
                    cache: false,
                    dataType: 'jsonp',
<<<<<<< HEAD
                    success: function(data) {
=======
                    success: function(data) {
>>>>>>> origin/master
                        var ppFacets = internal.econbiz.preprocessFacets(data);
                        var ppResults = internal.econbiz.preprocessResults(data);
                        internal.onReceiveData(term, ppFacets, ppResults);
                    }
                });
            },
            preprocessFacets: function(data) {
                var processed = [];
                var pdata = {}
<<<<<<< HEAD
                for (var result in data.hits.hits) {
                    for (var facet in data.hits.hits[result]) {
                        if (!pdata[facet]) {
                            pdata[facet] = {};
                        }
                        if (data.hits.hits[result][facet] instanceof Array) {
                            for (var tt = 0; tt < data.hits.hits[result][facet].length; tt++) {
                                var value = data.hits.hits[result][facet][tt];
                                if (!pdata[facet][value]) {
=======
                for (var result in data.hits.hits) {
                    for (var facet in data.hits.hits[result]) {
                        if (!pdata[facet]) {
                            pdata[facet] = {};
                        }
                        if (data.hits.hits[result][facet] instanceof Array) {
                            for (var tt = 0; tt < data.hits.hits[result][facet].length; tt++) {
                                var value = data.hits.hits[result][facet][tt];
                                if (!pdata[facet][value]) {
>>>>>>> origin/master
                                    pdata[facet][value] = 1;
                                }
                                pdata[facet][value] += 1;
                            }
                        } else {
<<<<<<< HEAD
                            if (!pdata[facet][data.hits.hits[result][facet]]) {
=======
                            if (!pdata[facet][data.hits.hits[result][facet]]) {
>>>>>>> origin/master
                                pdata[facet][data.hits.hits[result][facet]] = 1;
                            }
                            pdata[facet][data.hits.hits[result][facet]] += 1;
                        }
                    }
                }
<<<<<<< HEAD
                for (var fIdx in internal.econbiz.fields) {
                    var facetName = internal.econbiz.fields[fIdx];
                    var facet = {"name": facetName, "color": '#cccccc', "tags": []};
                    var tags = [];
                    var unknownFreq = 0;
                    for (var result in data.hits.hits) {
                        if (!data.hits.hits[result].hasOwnProperty(facetName)) {
                            unknownFreq += 1;
                        }
                    }
                    for (var tag in pdata[facetName]) {
                        tags.push({"word": tag, "frequency": pdata[facetName][tag]})
                    }
                    if (tags.length > 0) {
                        if (unknownFreq > 0) {
=======
                for (var fIdx in internal.econbiz.fields) {
                    var facetName = internal.econbiz.fields[fIdx];
                    var facet = {"name": facetName, "color": '#cccccc', "tags": []};
                    var tags = [];
                    var unknownFreq = 0;
                    for (var result in data.hits.hits) {
                        if (!data.hits.hits[result].hasOwnProperty(facetName)) {
                            unknownFreq += 1;
                        }
                    }
                    for (var tag in pdata[facetName]) {
                        tags.push({"word": tag, "frequency": pdata[facetName][tag]})
                    }
                    if (tags.length > 0) {
                        if (unknownFreq > 0) {
>>>>>>> origin/master
                            tags.push({"word": "unknown", "frequency": unknownFreq});
                        }
                        facet.tags = tags;
                        processed.push(facet);
                    }
                }
                return processed;
            },
            preprocessResults: function(data) {
                return data.hits.hits;
            }
        }
    }
    return {
        names: {
            europeana: "europeana",
            EEXCESS: "EEXCESS",
            econbiz: "econbiz"
<<<<<<< HEAD
        },
=======
        },
>>>>>>> origin/master
        buildFacetScape: function(queryTerms, provider, domElem, width, height) {
            internal.domElem = domElem;
            internal.width = width;
            internal.height = height;
<<<<<<< HEAD
            switch (provider) {
=======
            switch (provider) {
>>>>>>> origin/master
                case PROVIDER.names.europeana:
                    internal.europeana.request(queryTerms);
                    internal.currentProvider = PROVIDER.names.europeana;
                    break;
                case PROVIDER.names.EEXCESS:
                    internal.currentProvider = PROVIDER.names.EEXCESS;
<<<<<<< HEAD
                    if (internal.facetScape == null) {
=======
                    if (internal.facetScape == null) {
>>>>>>> origin/master
                        internal.EEXCESS.request(queryTerms, undefined);
                    } else {
                        internal.EEXCESS.request(queryTerms, "refresh");
                    }
                    break;
                case PROVIDER.names.econbiz:
                    internal.econbiz.request(queryTerms);
                    internal.currentProvider = PROVIDER.names.econbiz;
                    break;
                default:
                    internal.europeana.request(queryTerms);
                    internal.currentProvider = PROVIDER.names.europeana;
            }
        },
        getRequestedProvider: function() {
            return internal.currentProvider;
        },
        getEconbizRecordUrl: function() {
            return internal.econbiz.recordURL;
        },
        getCanonicalString: function(str) {
            return str;
//            var arrOfStr = str.toLowerCase().split(" ");
//            var canonStr = "";
//            if(str.match("http") || str.match("www")) {
//                return str;
//            }
//            for(var i = 0; i < arrOfStr.length; i++) {
//                canonStr += arrOfStr[i].charAt(0).toUpperCase() + arrOfStr[i].slice(1);
//                if(i < arrOfStr.length - 1) {
//                    canonStr += " ";
//                }
//            }
//            return canonStr;
        }
    }
})();
