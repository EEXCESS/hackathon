function vis(domElem, iwidth, iheight, ifacets, queryResultItems, term) {

    var root = domElem;
    var svg;
    var spareArea;

    var widthSpare = 150;
    var svgWidth = iwidth;
    var svgHeight = iheight / 2;

    var width = iwidth - widthSpare;
    var height = iheight;
    var facets = ifacets;

    // Internal Variables
    var provider = "europeana";
    var voronoi;
    var facetCentroids;
    var facetPolygons;
    var facetWeights = [];
    var spareFacets = [];
    // Animation
    var facetResizeHandle;
    var resizingFacet;

    var searchTerm = term;
    // Main Data Object holding facet information required for visualization
    var facetData = [];
    // Main Data Object holding all result items received for a queried term
    var resultItems = queryResultItems;
    // Main Data Object holding a users current selection
    var tagSelection = {};
    // Main Data Object holding currently selected items
    var selectedResults;

    // Strings
    var STR_DROP_HERE = "Drop Facet Here!";
    var STR_QUERY_RESULTS = "Query Results";
    var STR_BTN_SEARCH = "Search";
    var STR_BTN_FILTER = "Filter";
    var STR_ITEM_NODESCRIPTION = "No description available";
    var STR_ITEM_NOPROPERDESCRIPTION = "No appropriate description";
    var STR_ITEM_TIMEOUT = "";//"Server did not respond in time. Click link for further details on this Item.";

    // configuration parameters for facets
    var MAX_FACETS_HORIZONTAL = 4;
    var STEP_WEIGHT = 30;
    var SPARE_AREA_TOLERANCE_WIDTH = 30;

    // configuration parameters for tag clouds
    var MIN_FONT_SIZE = 10;
    var MAX_FONT_SIZE = 20;
    var TAG_PADDING_X = 2;
    var TAG_PADDING_Y = 1;
    var NUMBER_OF_SHADOW_GROUPS = 4;
    var SPIRAL_FERMAT_SCALE = 40;
    var maxFrequency;

    var facetScapeObject = {};


    init();

    //////////////////////////////////////////////////////////////////////
    //
    // INITIALIZATION: Create visual elements, enrich data with layout
    //                 information, draw elements
    //
    //////////////////////////////////////////////////////////////////////
    function init() {
	makeHeader();

//	makeVis();

//	makeRsContent();

//	makeDetailView();

//        FSQueryPanel();

//        FSResultLayout();
    }


    function makeHeader() {


        var header = root.append("header").attr("id","eexcess_main"));//.style("width", svgWidth+"px");

        var headerSearch = header.append("div").attr("id", "eexcess_header_search");
        headerSearch.append("input").attr("class", "eexcess_query_field").attr("type", "text").attr("name", "query").attr("value",searchTerm);
//        var select = resultHeaderSearch.append("select").attr("id", "RS_provider_selection").attr("name", "provider");
//        select.append("option").attr("value", "europeana").text("Europeana");
//        select.append("option").attr("value", "recommender").text("FRecommender");
//        $( "#RS_provider_selection" ).on('change', function() {
//            provider = $(this).val();
//        });

        headerSearch.append("input").attr("class","eexcess_submit_btn").attr("type", "submit").attr("value", STR_BTN_SEARCH);

//        $('#RS_Query').change(function() {
//            search($(this).val());
//        });
        $('#eexcess_header_search .eexcess_query_field').keypress(function(e){
            if (e.which == 13) {
                search(e.currentTarget.value);
            }
        });
        $('#eexcess_header_search .eexcess_submit_btn').click(function(e) {
            search($('#eexcess_header_search .eexcess_query_field')[0].value);
        });
//        resultHeader.append("div").attr("id", "RS_Header_FlowArrow_Right").append("div");

        header.append("div").attr("id", "eexcess_header_text").text(STR_QUERY_RESULTS+":"));
//        resultHeader.append("div").attr("id", "RS_Header_FlowArrow_Left").append("div");

        var headerFilter = header.append("div").attr("id", "eexcess_header_filter");
        resultHeaderFilter.append("input").attr("class", "eexcess_query_field").attr("type", "text").attr("name", "keywordQuery").attr("value","");
        resultHeaderFilter.append("input").attr("class", "eexcess_submit_btn").attr("type", "submit").attr("value", STR_BTN_FILTER);
        $('#eexcess_header_filter eexcess_query_field').keypress(function(e){
            if (e.which == 13) {
                evaluateKeywordFilter(e.currentTarget.value);
            }
        });
        $('#eexcess_header_filter eexcess_submit_btn').click(function(e) {
            evaluateKeywordFilter($('#eexcess_header_filter eexcess_query_field')[0].value);
        });
//        var resultHeaderFilterTags = resultList.append("div").attr("id", "RS_Header_Filter_Tags").style("width", svgWidth+"px");
  
      //var headerHeight =  parseInt(resultHeader.style("height")) + parseInt(resultHeaderFilterTags.style("height"));
    }



    function makeVis(){
        var visPanel = root.append("div").attr("id","RS_VisPanel").style("width", "300px");
    };


    function makeDetailView(){
        var detailPanel = root.append("div").attr("id","RS_DetailPanel").style("width", "300px");
};



    function makeRsContent(){
        root.append("div").attr("id", "RS_ResultList").style("max-Height", 200+"px").style("width", svgWidth+"px");
        refreshResultList();

    }

    //////////////////////////////////////////////////////////////////////
    //
    // REDRAW: Methods for redrawing voronoi cells, tag layout and
    //         result list.
    //
    //////////////////////////////////////////////////////////////////////
    function refreshResultList() {
    }




    //////////////////////////////////////////////////////////////////////
    //
    // PROGRAM LOGIC: Mainly containing methods for evaluating
    //                a user's selection of both facet search and
    //                and keyword search.
    //
    //////////////////////////////////////////////////////////////////////
    function evaluateSelection(selection) {
        var words = [];
        var regexs = [];
        if(tagSelection.hasOwnProperty("filter")) {
            words = tagSelection['filter'];
        }
        for(var k = 0; k < words.length; k++) {
            var terms = words[k].split(' ');
            var reg = '(';
            for(var t = 0; t < terms.length; t++) {
                reg += terms[t]+'';
                if(t < terms.length-1) { reg += '|';}
            }
            reg += ')';
            regexs[k] = new RegExp(reg, 'i');
        }
        var filtRes = resultItems.filter(function(d, i) {
            var item_str = JSON.stringify(d);
            var booleanAND = true;
            for(var facet in tagSelection) {
                if(facet !== "filter") {
                    var booleanOR = false;
                    for(var i = 0; i < tagSelection[facet].length; i++) {
                        booleanOR |= hasAttribute(d, facet, tagSelection[facet][i]);;
                    }
                    booleanAND = booleanAND && booleanOR;
                }
            }
            for(var k = 0; k < regexs.length; k++) {
                booleanAND = booleanAND && regexs[k].test(item_str);
            }
            return booleanAND;
        });
        return filtRes;
    }



    //////////////////////////////////////////////////////////////////////
    //
    // HELPER METHODS
    //
    //////////////////////////////////////////////////////////////////////
    function loadDescriptionCallback(result, container, success) {
        container.select("div#RS_QueryResultItem_Loader").remove();
        var str = '';
        if(success) {
            if(typeof result.object != "undefined") {
            if(result.object.proxies[0].hasOwnProperty('dcDescription')) {
                if(result.object.proxies[0].dcDescription.hasOwnProperty('def')) {
                    str = result.object.proxies[0].dcDescription.def[0];
                    str = (str.length > 115) ? str.substring(0,115) + "..." : str;
                } else {
                    str = STR_ITEM_NOPROPERDESCRIPTION;
                }
            } else {
                str = STR_ITEM_NODESCRIPTION;
            }
            }
        } else {
            str = STR_ITEM_TIMEOUT;
        }
        container.select("div#RS_QueryResultItem_Description1").text(str);
    }

    function evaluateKeywordFilter(keywords) {

        if(keywords.length == 0) {
            tagSelection['filter'] = [];
            d3.selectAll("div#RS_Header_Filter_Tag").remove();
            d3.select("div#RS_Header_Filter_Tags").style("height", "1px");
        } else {
            $('input#RS_Keyword_Query')[0].value = "";
            if(typeof tagSelection['filter'] == "undefined") {
                tagSelection['filter'] = [keywords];
                d3.select("div#RS_Header_Filter_Tags").style("height", "35px");
                var filterTag = d3.select("div#RS_Header_Filter_Tags").append("div").attr("id", "RS_Header_Filter_Tag")
                    .on("mouseover",onMouseOverFilterTagFunction)
                    .on("mouseout", onMouseOutFilterTagFunction)
                    .on("click", onMouseClickFilterTagFunction);
                filterTag.text(keywords);
            } else {
                if(tagSelection['filter'].indexOf(keywords) == -1) {
                    tagSelection['filter'].push(keywords);
                    d3.select("div#RS_Header_Filter_Tags").style("height", "35px");
                    var filterTag = d3.select("div#RS_Header_Filter_Tags").append("div").attr("id", "RS_Header_Filter_Tag")
                        .on("mouseover",onMouseOverFilterTagFunction)
                        .on("mouseout", onMouseOutFilterTagFunction)
                        .on("click", onMouseClickFilterTagFunction);
                    filterTag.text(keywords);
                }
            }
        }

        refreshResultList();
        updateFrequencies();
        drawTagCloud();
    }

    function fermatSpiral(phi) {

        var r = Math.sqrt(SPIRAL_FERMAT_SCALE * phi);
        var dx = r * Math.cos(phi);
        var dy = r * Math.sin(phi);
        return {"dx":dx, "dy":dy};
    }

    function archimedeanSpiral(phi) {
        var r = (0.5 * phi);
        var dx = r * Math.cos(phi);
        var dy = r * Math.sin(phi);
        return {"dx":dx, "dy":dy};
    }

    function sortfunction(a, b) {
        if(a.frequency > b.frequency) {
            return -1;
        } else if(a.frequency === b.frequency) {
            return 0;
        } else {
            return 1;
        }
    }

    function mapToAttributeName(facetName) {
        switch(facetName) {
            case "UGC":
                return "UGC";
            case "LANGUAGE":
                return "language";
            case "TYPE":
                return "type";
            case "YEAR":
                return "year";
            case "PROVIDER":
                return "provider";
            case "DATA_PROVIDER":
                return "dataProvider";
            case "COUNTRY":
                return "country";
            case "RIGHTS":
                return "rights";
        }
    }

    function mapFreqToFontSize(frequency) {
        return (frequency / maxFrequency) * (MAX_FONT_SIZE - MIN_FONT_SIZE) + MIN_FONT_SIZE;
    }

    function mapToShadowGroup(fontSize) {
        var shadowGroupInterval = (MAX_FONT_SIZE - MIN_FONT_SIZE) / NUMBER_OF_SHADOW_GROUPS;
        return Math.floor((fontSize-MIN_FONT_SIZE) / shadowGroupInterval);
    }

    function createDropShadowFilter(id) {

        var defs = svg.append("defs");

        var filter = defs.append("filter")
            .attr("id", "drop-shadow"+id)
            .attr("height", "180%");

        filter.append("feGaussianBlur")
            .attr("in", "SourceAlpha")
            .attr("stdDeviation", 3)
            .attr("result", "blur");

        filter.append("feOffset")
            .attr("in", "blur")
            .attr("dx", 0)
            .attr("dy", 2*id)
            .attr("result", "offsetBlur");

        var feMerge = filter.append("feMerge");

        feMerge.append("feMergeNode")
            .attr("in", "offsetBlur")
        feMerge.append("feMergeNode")
            .attr("in", "SourceGraphic");
    }

    function createRadialGradients() {
        for(var f in facets) {
            var defs = svg.append("defs");
            var radialGradient = defs.append("radialGradient")
                .attr("id", "gradient-"+facets[f].name)
                .attr("cx", "50%")
                .attr("cy", "50%")
                .attr("r", "70%")
                .attr("fx", "50%")
                .attr("fy", "50%");
            radialGradient.append("stop")
                .attr("offset", "0%")
                .style("stop-color", "rgb(234, 229, 220)")
                .style("stop-opacity", "0.5");
            radialGradient.append("stop")
                .attr("offset", "100%")
                .style("stop-color", facets[f].color)
                .style("stop-opacity", "1");
        }
    }


    function search(term) {
        EEXCESS.callBG({method: {parent: 'model', func: 'query'}, data: [{weight:1,text:term}]});
        var onReceiveData = function(terms, processedData, items) {
            d3.select("div#RS_Panel").remove();
            d3.select("svg#facetScape").remove();
            d3.select("div#RS_ResultList").remove();
            facetScape(root, svgWidth, height, processedData, items, terms);
        }
        //requestEuropeana(term,onReceiveData);
        requestPlugin(onReceiveData, "refresh");
    }

    return facetScapeObject;
}
