var PROVIDER = (function() {
    var internal = {
        width: 900,
        height: 900,
        domElem: null,
        currentProvider: null,
        facetScape: null,
        onReceiveData: function(queryTerms, processedData, items) {
            internal.width = $(window).width();
            internal.height = $(window).height();
            if(internal.facetScape != null) {
                internal.facetScape.draw(queryTerms, processedData, items)
            } else {
                internal.facetScape = facetScape(internal.domElem, internal.width, internal.height, processedData, items, queryTerms);
            }
        },
        europeana: {

            url: 'http://europeana.eu/api//v2/search.json?wskey=kfUs6T3Kj',

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
            },

            preprocessFacets: function(data) {
                var processedData = [];
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
                    for(var t in facets[key]) {
                        if(t != "") {
                            tags.push({"word":t, "frequency":facets[key][t]});
                        }
                    }
                    if(tags.length > 1) {
                        processedData.push({"name":key, "color": colors[key], "tags":tags});
                    }
                }
                delete facets;
                return processedData;
            },

            'preprocessResults': function(data) {
                return data.items;
            }
        },
        EEXCESS: {
            url: null,
            request: function(queryTerms, action) {

                var updateFacetScape = function(response) {
                    if((typeof response == "undefined") || response == null) {
                        d3.select("#facetScape").text("no data available");
                    } else {
                        var queryTerms = response.query;
                        var data = response.results;
                        console.log(data);
                        var facets = internal.EEXCESS.preprocessFacets(data);
                        var results = internal.EEXCESS.preprocessResults(data);
                        internal.onReceiveData(queryTerms, facets, results);
                    }
                }
                if(typeof action == "undefined") {
                    EEXCESS.callBG({method: {parent: 'model', func: 'getResults'},data: null}, function(reqResult) {
                        updateFacetScape(reqResult);
                    });
                } else if(action == "refresh") {
                    EEXCESS.messageListener(
                        function(request, sender, sendResponse) {
                            if (request.method === 'newSearchTriggered') {
                                updateFacetScape(request.data);
                            }
                        }
                    );
                }
            },
            preprocessFacets: function(data) {
                var processedData = [];
                var facets = {};
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
                            if(tag != "") {
                                tags.push({"word":tag, "frequency": facets[facet][tag]});
                            }
                        }
                        if(tags.length > 0) {
                            processedData.push({"name": facet, "type":0, "color": "#D6D0C4", "tags": tags});
                        }
                    }
                }
                delete facets;
                return processedData;
            },
            preprocessResults: function(data) {
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
                var xhr = new XMLHttpRequest();
                var facetString = '';
                for(var i = 0; i < internal.econbiz.fields.length; i++) {
                    facetString += internal.econbiz.fields[i];
                    facetString += (i < internal.econbiz.fields.length-1) ? '+' : '';
                }
                xhr.open('GET', internal.econbiz.url + '?q=' + term + '&size=' + internal.econbiz.size + '&facets=' + facetString, true);
                xhr.onload = function() {
                    var data = JSON.parse(xhr.response);
                    var ppFacets = internal.econbiz.preprocessFacets(data);
                    var ppResults = internal.econbiz.preprocessResults(data);
                    internal.onReceiveData(term, ppFacets, ppResults);
                };
                xhr.onerror = function() {
                    console.log("error");
                };
                xhr.send();
            },
            preprocessFacets: function(data) {
                var processedData = [];
                for(var key in data.facets) {
                    if(data.facets.hasOwnProperty(key)) {
                        var tags = [];
                        for(var t = 0; t < data.facets[key].length-1; t+=2) {
                            if(typeof data.facets[key][t] === "string") {
                                var frequency = 0;
                                for(var i = 0; i < data.hits.hits.length; i++) {
                                    if(data.hits.hits[i].hasOwnProperty(key)) {
                                        if(data.hits.hits[i][key] instanceof Array) {
                                            for(var tt = 0; tt < data.hits.hits[i][key].length; tt++) {
                                                var canonTag = PROVIDER.getCanonicalString(data.hits.hits[i][key][tt]);
                                                if(canonTag == PROVIDER.getCanonicalString(data.facets[key][t])){
                                                    frequency++;
                                                }
                                            }
                                        } else {
                                            var canonTag = PROVIDER.getCanonicalString(data.hits.hits[i][key]);
                                            if(canonTag == PROVIDER.getCanonicalString(data.facets[key][t])){
                                                frequency++;
                                            }
                                        }
                                    }
                                }
                                if(frequency > 0) {
                                    tags.push({"word":data.facets[key][t], "frequency":frequency});
                                }
                            }
                        }
                        if(tags.length > 1) {
                            processedData.push({"name":key, "color": '#cccccc', "tags":tags});
                        }
                    }
                }
                return processedData;
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
        },

        buildFacetScape: function(queryTerms, provider, domElem, width, height) {
            internal.domElem = domElem;
            internal.width = width;
            internal.height = height;
            switch(provider) {
                case PROVIDER.names.europeana:
                    internal.europeana.request(queryTerms);
                    internal.currentProvider = PROVIDER.names.europeana;
                    break;
                case PROVIDER.names.EEXCESS:
                    internal.currentProvider = PROVIDER.names.EEXCESS;
                    if(internal.facetScape == null) {
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
    }
})();
