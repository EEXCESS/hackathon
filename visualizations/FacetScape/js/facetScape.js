function facetScape(domElem, iwidth, iheight, ifacets, queryResultItems, term) {

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

    /////////////////////////////////////////////////////////////////
    //
    // INTERACTIVITY: MouseEvents
    //
    ////////////////////////////////////////////////////////////////

    var onMouseOverFunction = function(d,i) {
        this.parentNode.parentNode.appendChild(this.parentNode);
        this.parentNode.appendChild(this);
        d3.select(this).style("cursor", "pointer");
        d3.select(this).select("text#tag_freq").text("");
        var tagHovered = d3.select(this).select("text#tag_text").text(d.word);
        var selRect = d3.select(this).select("rect#tag_bg");
        var nBBWidth = tagHovered.node().getBBox().width + 2 * TAG_PADDING_X;
        var nBBHeight = selRect.node().getBBox().height + TAG_PADDING_Y;
        selRect.attr("x", d.x - nBBWidth/2).attr("y", d.y - nBBHeight/2).attr("width", nBBWidth).attr("height", nBBHeight);
        selRect.style("stroke", "#1F914F");//.style("stroke", "AADDE3");
        var gain = 0;
        var facetName = this.parentNode.__data__.name;
        if(!d.isSelected) {
            selRect.style("fill", "#D9D3C7");//.style("fill", "#E1EDF2");
            if(tagSelection.hasOwnProperty(facetName)) {
                tagSelection[facetName].push(d.word);
            } else {
                tagSelection[facetName] = [d.word];
            }
            var hypoResults = evaluateSelection(tagSelection);
            gain = hypoResults.length - selectedResults.length;
            var id = tagSelection[facetName].indexOf(d.word);
            tagSelection[facetName].splice(id, 1);
            if(tagSelection[facetName].length == 0) {
                delete tagSelection[facetName];
            }
        } else {
            var id = tagSelection[facetName].indexOf(d.word);
            tagSelection[facetName].splice(id, 1);
            if(tagSelection[facetName].length == 0) {
                delete tagSelection[facetName];
            }
            var hypoResults = evaluateSelection(tagSelection);
            gain = hypoResults.length - selectedResults.length;
            if(tagSelection.hasOwnProperty(facetName)) {
                tagSelection[facetName].push(d.word);
            } else {
                tagSelection[facetName] = [d.word];
            }
        }
        d3.select(this).append("rect").attr("id", "tag_Quantity_bg")
            .attr("x", d.x + nBBWidth / 2 - 46)
            .attr("y", d.y - nBBHeight / 2 - 10)
            .attr("width", 38)
            .attr("height", 13)
            .attr("rx", 5)
            .attr("ry", 5)
            .style("fill", "#D8FF75");
        d3.select(this).append("rect").attr("id", "tag_Quantity_bg")
            .attr("x", d.x + nBBWidth / 2 - 10)
            .attr("y", d.y - nBBHeight / 2 - 10)
            .attr("width", 20)
            .attr("height", 13)
            .attr("rx", 5)
            .attr("ry", 5)
            .style("fill", function() { if(gain<0) { return "#FFD903"} else if(gain == 0) { return "#CFCFCF"} else { return "#75D1FF"}});
        d3.select(this).append("text").attr("id", "tag_Quantity_text")
            .attr("x", d.x + nBBWidth / 2)
            .attr("y", d.y - nBBHeight / 2-1)
            .attr("fill", "#000000")
            .text(function() { if(gain>0) { return "+"+gain;} else { return gain;}});
        d3.select(this).append("text").attr("id", "tag_Quantity_text")
            .attr("x", d.x + nBBWidth / 2-27)
            .attr("y", d.y - nBBHeight / 2-1)
            .attr("fill", "#000000")
            .text(function(d) { return d.frequency + "/"+selectedResults.length; });
    }

    var onMouseOutFunction = function(d) {
        var selectedTag = d3.select(this).select("rect#tag_bg");
        selectedTag.style("stroke", "none");
        selectedTag.attr("x", d.x - d.bbWidth/2).attr("y", d.y - d.bbHeight/2).attr("width", d.bbWidth).attr("height", d.bbHeight);
        d3.select(this).select("text").text(d.wordShort);
        if(!d.isSelected) {
            selectedTag.style("fill", "none");
        }
        d3.select(this).selectAll("rect#tag_Quantity_bg").remove();
        d3.select(this).selectAll("text#tag_Quantity_text").remove();
        d3.select(this).select("text#tag_freq").text(function(d) { return d.frequency;});
    }

    var onMouseClickFunction = function(d, i) {

        var selectedTag = d3.select(this).select("rect#tag_bg");
        d.isSelected = !d.isSelected;
        var facetName = this.parentNode.__data__.name;
        if(d.isSelected) {
            if(tagSelection.hasOwnProperty(facetName)) {
                tagSelection[facetName].push(d.word);
            } else {
                tagSelection[facetName] = [d.word];
            }
        } else {
            var id = tagSelection[facetName].indexOf(d.word);
            tagSelection[facetName].splice(id, 1);
            if(tagSelection[facetName].length == 0) {
                delete tagSelection[facetName];
            }
        }
        refreshResultList();
        updateFrequencies();
        drawTagCloud();
    }

    var onMouseClickFacetName = function(d, i) {
        var selTag = d3.select(this).select("rect");
        var nrSelTags = this.__data__.tags.filter(function(d) { return d.isSelected;}).length;
        if(nrSelTags == this.__data__.tags.length) {d.isSelected = true;}
        d.isSelected = !d.isSelected;
        var facetName = this.__data__.name;
        if(d.isSelected) {
            if(tagSelection.hasOwnProperty(facetName)) {
                this.__data__.tags.forEach(function(d,i) {
                    d.isSelected = true;
                    tagSelection[facetName].push(d.word);
                });
            } else {
                tagSelection[facetName] = [];
                this.__data__.tags.forEach(function(d,i) {
                    d.isSelected = true;
                    tagSelection[facetName].push(d.word);
                });
            }
        } else {
            this.__data__.tags.forEach(function(d,i) {
                d.isSelected = false;
            });
            delete tagSelection[facetName];
        }
        refreshResultList();
        updateFrequencies();
        drawTagCloud();
    }

    var onMouseDragStartFacetName = function(d, i) {
        d.weight = 1;
        spareArea.select("rect#spareArea").attr("class", "spareArea spareArea_highlighted");
        var txt = spareArea.append("text").attr("id", "spareArea_text").attr("class", "spareArea_text");
        txt.attr("x", width + parseInt(spareArea.attr("width") / 2) + "px")
            .attr("y", parseInt(spareArea.attr("height") / 2) + "px")
            .text(STR_DROP_HERE);
    }

    var onFacetEntered = function(d) {
        resizeFacet(d);
    }

    function resizeFacet(d) {
        //if(resizingFacet != d) {
            if(typeof resizingFacet != "undefined") {
                clearInterval(facetResizeHandle);
            }
            resizingFacet = d;
            var minDist = Number.MAX_VALUE;
            var distance = 0.0;
            for(var i = 0; i < facetData.length; i++) {
                if(facetData[i] != d) {
                    facetData[i].weight = 1;
                    distance = Math.sqrt(Math.pow(d.centroid.X - facetData[i].centroid.X, 2) + Math.pow(d.centroid.Y - facetData[i].centroid.Y, 2));
                    if(distance < minDist) {
                        minDist = distance;
                    }
                }
            }
            facetResizeHandle = createInterval(enlargeFacet, d, minDist, 30);
        //}
    }

    function createInterval(f, facet, maxDist, interval) {
        return setInterval(function() { f(facet, maxDist); }, interval);
    }

    function enlargeFacet(facet, maxWeight) {
        for(var i = 0; i < facetData.length; i++) {
            if(facetData[i] != facet && facetData[i].weight > STEP_WEIGHT) {
                facetData[i].weight -= STEP_WEIGHT;
            }
        }
        var newWeight = facet.weight + STEP_WEIGHT;
        if(newWeight < maxWeight) {
            if(facet.visibleTags == facet.tags.length) {
                window.clearInterval(facetResizeHandle);
            } else {
                facet.weight = newWeight;
                refreshLayout();
            }
        } else {
            facet.weight = maxWeight;
            refreshLayout();
            window.clearInterval(facetResizeHandle);
        }
    }

    function move(){
        var facet = this.__data__;
        if(facet.facetHeader.x < facet.facetHeader.bbWidth/2) {
            facet.facetHeader.x = facet.facetHeader.bbWidth/2;
            facet.centroid.X = facet.facetHeader.bbWidth/2;
        }
        if(facet.facetHeader.x > svgWidth) {
            facet.facetHeader.x = svgWidth-facet.facetHeader.bbWidth/2;
            facet.centroid.X = svgWidth-facet.facetHeader.bbWidth/2;
        }
        if(facet.facetHeader.y < facet.facetHeader.bbHeight/2) {
            facet.facetHeader.y = facet.facetHeader.bbHeight/2;
            facet.centroid.Y = facet.facetHeader.bbHeight/2;
        }
        if(facet.facetHeader.y > svgHeight-facet.facetHeader.bbHeight/2) {
            facet.facetHeader.y = svgHeight-facet.facetHeader.bbHeight/2;
            facet.centroid.Y = svgHeight-facet.facetHeader.bbHeight/2;
        }

        this.parentNode.parentNode.appendChild(this.parentNode);
        var dragTarget = d3.select(this);
        var newX = this.__data__.centroid.X + d3.event.dx;
        var newY = this.__data__.centroid.Y + d3.event.dy;
        var distance = 0.0;
        var isNotOverlapping = true;
        // Test code
//        var minDist = Number.MAX_VALUE;
//        for(var i = 0; i < facetData.length; i++) {
//            if(facetData[i] != facet) {
//                facetData[i].weight = 0;
//                distance = Math.sqrt(Math.pow(newX - facetData[i].centroid.X, 2) + Math.pow(newY - facetData[i].centroid.Y, 2));
//                if(distance < minDist) {
//                    minDist = distance;
//                }
//            }
//        }
//        facet.weight = minDist;
        var overlappedFacet;
        var overlappedDist;
        for(var i = 0; i < facetData.length; i++) {
            if(facetData[i] != facet) {
                distance = Math.sqrt(Math.pow(newX - facetData[i].centroid.X, 2) + Math.pow(newY - facetData[i].centroid.Y, 2));
                if(distance < (facetData[i].weight + facet.weight)) {
                    isNotOverlapping = isNotOverlapping && false;
                    facetData[i].weight = 0;
                    overlappedFacet = facetData[i];
                    overlappedDist = distance;
                    var collFacet = d3.select("g#"+facetData[i].name).select("path");
                    collFacet.style("stroke", "#1F914F").style("stroke-width", "5px").transition().duration(1000).style("stroke", "#000000").style("stroke-width", "1px");
                }
            }
        }
        if(isNotOverlapping) {
            this.__data__.centroid.X = newX;
            this.__data__.centroid.Y = newY;
            this.__data__.facetHeader.x = newX;
            this.__data__.facetHeader.y = newY;
        } else {
            if(overlappedDist <= facet.weight) {
            var vec = {X:((overlappedFacet.centroid.X - newX)/overlappedDist)*-(facet.weight+1), Y: ((overlappedFacet.centroid.Y - newY)/overlappedDist)*-(facet.weight+1)};
            this.__data__.centroid.X = overlappedFacet.centroid.X + vec.X;
            this.__data__.centroid.Y = overlappedFacet.centroid.Y + vec.Y;
            this.__data__.facetHeader.x = overlappedFacet.centroid.X + vec.X;
            this.__data__.facetHeader.y = overlappedFacet.centroid.Y + vec.Y;
            }

        }

        refreshLayout();
    }

    var onMouseDragEndFacetName = function(d, i) {
        var facet = this.parentNode.__data__;
        spareArea.select("rect").attr("class", "spareArea");
        spareArea.select("text#spareArea_text").remove();
        if(facet.centroid.X > width) {
            if(spareFacets.indexOf(this.parentNode) == -1 && facetData.length > 1) {
                var freeSlot = spareFacets.length;
                for(var idx = 0; idx < spareFacets.length; idx++) {
                    if(spareFacets[idx] == "undefined") {
                        freeSlot = idx;
                        break;
                    }
                }
                facet.centroid.X = width + widthSpare/2;
                facet.centroid.Y = freeSlot * 30 + 20;
                facet.facetHeader.x = facet.centroid.X;
                facet.facetHeader.y = facet.centroid.Y;
                spareFacets[freeSlot] = this.parentNode;
                d3.select(this.parentNode).remove();
                var groupSel = spareArea.append("g").attr("id", "facet_Header_group").attr("name", facet.name)
                    .call(d3.behavior.drag().on("drag", onMouseMoveIn).on("dragend", onMouseDragEndInFacetName))
                    .attr("x", facet.centroid.X)
                    .attr("y", facet.centroid.Y);
                groupSel.append("rect")
                    .attr("id", "facet_Header_bg")
                    .attr("width", facet.facetHeader.bbWidth)
                    .attr("height",facet.facetHeader.bbHeight)
                    .attr("x", facet.centroid.X - facet.facetHeader.bbWidth/2)
                    .attr("y", facet.centroid.Y - facet.facetHeader.bbHeight/2)
                    .attr("rx",5)
                    .attr("ry",3)
                    .attr("stroke", "#ffffff");
                    //.style("filter", "url(#drop-shadow0)");
                groupSel.append("rect").attr("id", "facet_Header_selectionBar")
                    .attr("width", function(d) {
                        var nrSelTags = facet.tags.filter(function(d) { return d.isSelected; }).length;
                        return facet.facetHeader.bbWidth / facet.tags.length * nrSelTags;
                    })
                    .attr("height", function(d) { return facet.facetHeader.bbHeight;})
                    .attr("x", facet.centroid.X - facet.facetHeader.bbWidth/2)
                    .attr("y", facet.centroid.Y - facet.facetHeader.bbHeight/2)
                    .attr("rx", 5)
                    .attr("ry", 3);
                groupSel.append("text")
                    .attr("id", "facet_Header")
                    .text(facet.facetHeader.word)
                    .attr("x", facet.centroid.X)
                    .attr("y", facet.centroid.Y);
                var idx = facetData.indexOf(facet);
                facetData.splice(idx, 1);
                refreshLayout();
            }
        } else {
            resizeFacet(facet);
        }
    }

    var onMouseMoveIn = function(d, i) {
        svg[0][0].appendChild(this);
        var dragTarget = d3.select(this);
        var name = dragTarget.attr("name");
        var x = d3.event.dx + parseInt(dragTarget.attr("x"));
        var y = d3.event.dy + parseInt(dragTarget.attr("y"));
        dragTarget.attr("x", x).attr("y", y);
        dragTarget.selectAll("rect").attr("x", parseInt(dragTarget.select("rect").attr("x")) + d3.event.dx)
            .attr("y", parseInt(dragTarget.select("rect").attr("y")) + d3.event.dy);
        dragTarget.select("text").attr("x", parseInt(dragTarget.select("text").attr("x")) + d3.event.dx)
            .attr("y", parseInt(dragTarget.select("text").attr("y")) + d3.event.dy);
        spareFacets.forEach(function(d,i) {
            if(d != "undefined") {
            if(d.__data__.name == name) {
                d.__data__.centroid.X = x, d.__data__.facetHeader.x = x;
                d.__data__.centroid.Y = y, d.__data__.facetHeader.y = y;
            }
            }
        });
    }

    var onMouseDragEndInFacetName = function(d, i) {
        var dragTarget = d3.select(this);
        var name = dragTarget.attr("name");
        // A newly inserted facet may overlap with existing ones.
        // Iteratively reduce weights to provide enough space for the new facet
        var i;
        spareFacets.forEach(function(d,i) {
            var facetToDrop = d.__data__;
            if(typeof facetToDrop !== "undefined") {
            if(facetToDrop.name === name) {
                var olfs = getOverlapedFacets(facetToDrop, facetToDrop.weight);
                while(olfs.length > 0) {
                    facetToDrop.weight *= 0.5;
                    var f;
                    var minDist = Number.MAX_VALUE;
                    var minDistOlf;
                    for(f = 0; f < olfs.length; f++) {
                        if(olfs[f].dist < minDist) {
                            minDist = olfs[f].dist;
                            minDistOlf = olfs[f].olfacet;
                        }
                    }
                    minDistOlf.weight *= 0.5;
                    olfs = getOverlapedFacets(facetToDrop, facetToDrop.weight);
                }
                resizeFacet(facetToDrop);
            }
            }
        });
        // END overlap code
        var idxToDelete;
        if(parseInt(dragTarget.attr("x")) < width) {
            spareFacets.forEach(function(d, i) {
                if(d !== "undefined") {
                if(d.__data__.name === name) {
                    facetData.push(d.__data__);
                    svg[0][0].appendChild(d);
                    idxToDelete = i;
                }
                }
            });
            spareFacets[idxToDelete] = "undefined";
            dragTarget.remove();
        }
        refreshLayout();
    }

    function getOverlapedFacets(facet, newWeight) {
        var overlappingFacets = [];
        var distance = 0.0;
        var isNotOverlapping = true;
        for(var i = 0; i < facetData.length; i++) {
            if(facetData[i].name !== facet.name) {
                distance = Math.sqrt(Math.pow(facet.centroid.X - facetData[i].centroid.X, 2) + Math.pow(facet.centroid.Y - facetData[i].centroid.Y, 2));
                if(distance < (facetData[i].weight + newWeight)) {
                    isNotOverlapping = isNotOverlapping && false;
                    overlappingFacets.push({"olfacet":facetData[i], "dist":distance});
                }
            }
        }
        return overlappingFacets;
    }

    var onMouseWheel = function(d, i) {
        var facet = this.parentNode.__data__;
        var evt = window.event;
        evt.preventDefault();
        var delta = evt.detail ? evt.detail * -120 : evt.wheelDelta;
        if(delta > 0) {
            var newWeight = facet.weight + STEP_WEIGHT;
            var distance = 0.0;
            var isNotOverlapping = true;
            for(var i = 0; i < facetData.length; i++) {
                if(facetData[i].name !== facet.name) {
                    distance = Math.sqrt(Math.pow(facet.centroid.X - facetData[i].centroid.X, 2) + Math.pow(facet.centroid.Y - facetData[i].centroid.Y, 2));
                    if(distance < (facetData[i].weight + newWeight)) {
                        isNotOverlapping = isNotOverlapping && false;
                        var collFacet = d3.select("g#"+facetData[i].name).select("path");
                        collFacet.style("stroke", "#1F914F").style("stroke-width", "5px").transition().duration(1000).style("stroke", "#000000").style("stroke-width", "1px");
                    }
                }
            }
            if(isNotOverlapping) {
                this.parentNode.__data__.weight += STEP_WEIGHT;
            }
        }
        if(delta < 0) {
            if(this.parentNode.__data__.weight > STEP_WEIGHT) {
                this.parentNode.__data__.weight -= STEP_WEIGHT;
            }
        }
        refreshLayout();
    }

    var onMouseOverFilterTagFunction = function(d, i) {
        var hoverTarget = d3.select(this);
        hoverTarget.attr("id", "RS_Header_Filter_Tag_hover");
    }

    var onMouseOutFilterTagFunction = function(d, i) {
        var hoverTarget = d3.select(this);
        hoverTarget.attr("id", "RS_Header_Filter_Tag");
    }

    var onMouseClickFilterTagFunction = function(d, i) {
        var index = tagSelection['filter'].indexOf(d3.select(this).text());
        tagSelection['filter'].splice(index, 1);
        d3.select(this).remove();
        if(d3.selectAll("div#RS_Header_Filter_Tag")[0].length == 0) {
            d3.select("div#RS_Header_Filter_Tags").style("height", "1px");
        }
        refreshResultList();
        updateFrequencies();
        drawTagCloud();
    }

    init();

    //////////////////////////////////////////////////////////////////////
    //
    // INITIALIZATION: Create visual elements, enrich data with layout
    //                 information, draw elements
    //
    //////////////////////////////////////////////////////////////////////
    function init() {
        FSQueryPanel();
        svg = root.append("svg").attr("id", "facetScape").attr("width", svgWidth).attr("height",svgHeight);
        spareArea = svg.append("svg:g").attr("id", "spareArea").attr("width", widthSpare).attr("height", svgHeight);
        spareArea.append("svg:rect").attr("class", "spareArea").attr("x", width).attr("y",0).attr("width", widthSpare).attr("height",svgHeight);
        createRadialGradients();
        voronoi = VoronoiPartitioner([[0,0],[width,svgHeight]]);
        facetCentroids = FSLayoutUniform();
        for(var i = 0; i < facetCentroids.length; i++) {
            facetWeights.push((1.0 / facetCentroids.length)*200);
        }
        facetPolygons = voronoi.layout(facetCentroids, facetWeights);
        facetData = createFacetData(facets, facetCentroids, facetPolygons, facetWeights);
        svg.selectAll("g#facetGroup").data(facetData).enter().append("g").attr("class", "facetGroup").attr("id", function(d) { return d.name; });
        enrichWithLayoutInfo(facetData);
        for(var i = 0; i < facetData.length; i++) {
            cloudLayout(facetData[i]);
        }
        console.log(facetData);
        console.log(resultItems);
        drawVoronoi();
        drawTagCloud();
        FSResultLayout();
    }

    function createFacetData(ifacets, iCentroids, iPolygons, iWeights) {
        var data = [];
        for(var f = 0; f < ifacets.length; f++) {
            data.push({
                "name": ifacets[f].name,
                "isVisible": true,
                "centroid": iCentroids[f],
                "weight": iWeights[f],
                "polygon": iPolygons[f],
                "color": ifacets[f].color,
                "tags": ifacets[f].tags
            });
        }
        return data;
    }

    /*
     Calculate Font Size and Bounding Box of each tag and add this info to 'fData'
     */
    function enrichWithLayoutInfo(fData) {
        var f, t;
        for(f = 0; f < fData.length; f++) {
            if(typeof fData[f].tags[0] === "undefined") {
                continue;
            }
            fData[f].tags.sort(sortfunction);
            maxFrequency = fData[f].tags[0].frequency;
            for(t = 0; t < fData[f].tags.length; t++) {
                var l = fData[f].tags[t].word.length;
                fData[f].tags[t].wordShort = (l > 15) ? fData[f].tags[t].word.substring(0, 14) + ".." : fData[f].tags[t].word;
                var fontSize = mapFreqToFontSize(fData[f].tags[t].frequency);
                var rTag = d3.select("body").append('div').attr("id","tag").style("font-size",fontSize+"px").text(facetData[f].tags[t].wordShort);
                fData[f].tags[t].id = t;
                fData[f].tags[t].bbWidth = parseInt(rTag.style("width"), 10) + 2 * TAG_PADDING_X;
                fData[f].tags[t].bbHeight = parseInt(rTag.style("height"), 10) + 2 * TAG_PADDING_Y;
                fData[f].tags[t].fontSize = fontSize;
                fData[f].tags[t].x = fData[f].centroid.X;
                fData[f].tags[t].y = fData[f].centroid.Y;
                fData[f].tags[t].isFixed = false;
                fData[f].tags[t].isSelected = false;
                d3.selectAll("#tag").remove();
            }
            var fHeader = d3.select("body").append('div').attr("id","facet_Header").text(fData[f].name.toUpperCase());
            fData[f]['visibleTags'] = 0;
            fData[f]['facetHeader'] = {
                "word":fData[f].name.toUpperCase(),
                "bbHeight": parseInt(fHeader.style("height"), 10),
                "bbWidth": parseInt(fHeader.style("width"), 10),
                "isFixed": true,
                "isSelected": false,
                "x":fData[f].centroid.X,
                "y":fData[f].centroid.Y
            }
            d3.selectAll("#facet_Header").remove();
        }
        return fData;
    }

    /*
        Create Layout with MAX_FACETS_HORIZONTAL facets per row and arbitrary number of rows.
        x   x   x   x
        x   x   x   x
           x     x
        Return Array of Centroids [[x1,y1],[x2,y2],..] for facets.
     */
    function FSLayoutUniform() {
        var nFacets = facets.length;
        var facetCentroids = [];
        var facetsLastRow =  (nFacets % MAX_FACETS_HORIZONTAL);
        var facetRows = Math.floor(nFacets / MAX_FACETS_HORIZONTAL);
        var horizontalSpacePerFacet = (width) / MAX_FACETS_HORIZONTAL;
        var verticalSpacePerFacet = svgHeight / (facetRows + ((facetsLastRow != 0) ? 1 : 0));
        var tmpFacetCentroid = [];
        for(var r = 0; r < facetRows; r++) {
            for(var c = 0; c < MAX_FACETS_HORIZONTAL; c++) {
                tmpFacetCentroid = {X:horizontalSpacePerFacet/2 + c * horizontalSpacePerFacet, Y:verticalSpacePerFacet/2 + r * verticalSpacePerFacet};
                facetCentroids.push(tmpFacetCentroid);
            }
        }
        if(facetsLastRow != 0) {
            horizontalSpacePerFacet = (width) / facetsLastRow;
            var ypos = verticalSpacePerFacet / 2 + facetRows * verticalSpacePerFacet;
            for(var c = 0; c < facetsLastRow; c++) {
                tmpFacetCentroid = {X:horizontalSpacePerFacet/2 + c * horizontalSpacePerFacet, Y: ypos};
                facetCentroids.push(tmpFacetCentroid);
            }
        }
        for(var i = 0; i < nFacets; i++) {
            facetData[i] = {weight: ((1.0/nFacets) * 100)};
        }
        return facetCentroids;
    }
    function FSQueryPanel() {
        var resultList = root.append("div").attr("id","RS_Panel").style("width", svgWidth+"px");
        var resultHeader = resultList.append("div").attr("id", "RS_Header");
        var resultHeaderSearch = resultHeader.append("div").attr("id", "RS_Header_Search");
        resultHeaderSearch.append("input").attr("id", "RS_Query").attr("type", "text").attr("name", "query").attr("value",searchTerm);
//        var select = resultHeaderSearch.append("select").attr("id", "RS_provider_selection").attr("name", "provider");
//        select.append("option").attr("value", "europeana").text("Europeana");
//        select.append("option").attr("value", "recommender").text("FRecommender");
//        $( "#RS_provider_selection" ).on('change', function() {
//            provider = $(this).val();
//        });

        resultHeaderSearch.append("input").attr("id", "RS_SubmitButtonId").attr("class","RS_SubmitButton").attr("type", "submit").attr("value", STR_BTN_SEARCH);

        $('#RS_Query').change(function() {
            search($(this).val());
        });
        $('#RS_Query').keypress(function(e){
            if (e.which == 13) {
                search(e.currentTarget.value);
            }
        });
        $('#RS_SubmitButtonId').click(function(e) {
            search($('#RS_Query')[0].value);
        });
        resultHeader.append("div").attr("id", "RS_Header_FlowArrow_Right").append("div");
        resultHeader.append("div").attr("id", "RS_Header_Text").text(STR_QUERY_RESULTS+":");
        resultHeader.append("div").attr("id", "RS_Header_FlowArrow_Left").append("div");

        var resultHeaderFilter = resultHeader.append("div").attr("id", "RS_Header_Filter");
        resultHeaderFilter.append("input").attr("id", "RS_Keyword_Query").attr("type", "text").attr("name", "keywordQuery").attr("value","");
        resultHeaderFilter.append("input").attr("id", "RS_Keyword_SubmitButtonId").attr("class","RS_Keyword_SubmitButton").attr("type", "submit").attr("value", STR_BTN_FILTER);
        $('#RS_Keyword_Query').keypress(function(e){
            if (e.which == 13) {
                evaluateKeywordFilter(e.currentTarget.value);
            }
        });
        $('#RS_Keyword_SubmitButtonId').click(function(e) {
            evaluateKeywordFilter($('#RS_Keyword_Query')[0].value);
        });
        var resultHeaderFilterTags = resultList.append("div").attr("id", "RS_Header_Filter_Tags");
        //var headerHeight =  parseInt(resultHeader.style("height")) + parseInt(resultHeaderFilterTags.style("height"));
    }

    function FSResultLayout() {
        root.append("div").attr("id", "RS_ResultList").style("height", height-svgHeight+"px").style("width", svgWidth+"px");
        refreshResultList();
    }

    //////////////////////////////////////////////////////////////////////
    //
    // REDRAW: Methods for redrawing voronoi cells, tag layout and
    //         result list.
    //
    //////////////////////////////////////////////////////////////////////
    function refreshResultList() {

        var results = d3.select("div#RS_ResultList");
        results.selectAll("div").remove();

        selectedResults = evaluateSelection(tagSelection);
        d3.select("div#RS_Header_Text").text("Query Results ("+selectedResults.length+") :");

        var resultNodes = results.selectAll("div").data(selectedResults);

        var singleResultNode = resultNodes.enter().append("div").attr("id", "RS_QueryResultItem");
        singleResultNode.append("img").attr("id", "RS_QueryResultItem_Thumbnail").attr("src", function(d,i) { return (d.hasOwnProperty("edmPreview")) ? d.edmPreview[0] : ""; });
        singleResultNode.append("a").attr("id", "RS_QueryResultItem_Title")
            .attr("href", function(d, i) { return d.uri/*d.guid*/;})
            .attr("target", "_blank")
            .text(function(d,i) {
                var title = (d.hasOwnProperty("title")) ? d.title : "no title";
                return (title.length > 80) ? title.substring(0, 80) + "..." : title;
            });

        var secDesc = singleResultNode.append("div").attr("id", "RS_QueryResultItem_AsynchDesc");
        //var l = secDesc.append("div").attr("id", "RS_QueryResultItem_Loader");
        //var d = secDesc.append("div").attr("id", "RS_QueryResultItem_Description1");
        var providerIcon = secDesc.append("div").attr("id", "RS_QueryResultItem_Provider");
        var img = providerIcon.append("img").attr("src", function(d,i) { return "../../media/icons/"+ ((typeof d.partner != "undefined") ? d.partner : "europeana") + "-favicon.ico";});
//        providerIcon.text(function(d,i) {
//            if(d.provider == "mendeley") {
//                return "mendeley";
//            }
//            if(d.provider == "econbiz") {
//                return "econbiz";
//            }
//            if(d.provider == "europeana") {
//                return "europeana";
//            }
//        })
//        d.text(function(d,i) {
//            //TODO: load additional info for each result
//                //loadDetailedInfo(d.link, d3.select(this.parentNode), loadDescriptionCallback);
//            });

        singleResultNode.append("p").attr("id", "RS_QueryResultItem_Description2")
            .text(function(d,i) {
                return (d.hasOwnProperty("country")) ? d.country : "no Country";
            });
    }

    function drawVoronoi() {
        var polySelection = svg.selectAll("g.facetGroup").selectAll("path").data(function(d) {return [d.polygon];});
        polySelection.enter().append("path").attr("class", "VoronoiPolygon");
        polySelection.attr("d", function(d, i) {
            var path = "", j;
            for(j = 0; j < d.length; j++) {
                if (!j) path += "M";
                else path += "L";
                path += d[j].X + ", " + d[j].Y;
            }
            path += "Z";
            return path;
            })
            .on("mousewheel.zoom", onMouseWheel)
            .on("mouseenter", onFacetEntered);

        var facets = svg.selectAll("g.facetGroup");
        var facetNameSelection = facets.selectAll("g#facet_Header_group").data(function(d) { return [d]; });

        var groupSel = facetNameSelection.enter().append("g").attr("id", "facet_Header_group")
            .call(d3.behavior.drag().on("drag", move)
                .on("dragstart", onMouseDragStartFacetName)
                .on("dragend", onMouseDragEndFacetName))
            .on("click", onMouseClickFacetName)
            .on("mousewheel.zoom", onMouseWheel);

        groupSel.append("rect").attr("id", "facet_Header_bg")
            .attr("width", function(d) { return d.facetHeader.bbWidth; })
            .attr("height", function(d) { return d.facetHeader.bbHeight; })
            .attr("rx",5)
            .attr("ry",3)
            //.style("filter", "url(#drop-shadow0)");
        groupSel.append("rect").attr("id", "facet_Header_selectionBar")
            .attr("width", 0)
            .attr("height", function(d) { return d.facetHeader.bbHeight;})
            .attr("rx", 5)
            .attr("ry", 3);
        groupSel.append("text").attr("id", "facet_Header");

        facetNameSelection.select("rect#facet_Header_bg")
            .attr("x", function(d) { return d.facetHeader.x - d.facetHeader.bbWidth/2; })
            .attr("y", function(d) { return d.facetHeader.y - d.facetHeader.bbHeight/2; });
        facetNameSelection.select("text#facet_Header")
            .attr("x", function(d) { return d.facetHeader.x; })
            .attr("y", function(d) { return d.facetHeader.y; })
            .text(function(d) { return d.facetHeader.word;});

        svg.selectAll("g.facetGroup").select("path").style("fill", function(d) { return "url(#gradient-"+ d.name+")";});
    }

    function drawTagCloud() {

        var clouds = svg.selectAll("g.facetGroup");

        // Bind Data to Tags
        var tagSelection = clouds.selectAll("g#tag").data(function(d) { return d.tags.filter(function(d) { return d.isFixed});});

        // Create Tags
        var groupSel = tagSelection.enter().append("g").attr("id", "tag")
            .on("mouseover", onMouseOverFunction)
            .on("mouseout", onMouseOutFunction)
            .on("mousewheel.zoom", onMouseWheel)
            .on("click", onMouseClickFunction);
        groupSel.append("rect")
            .attr("id", "tag_bg")
            .attr("rx", 5)
            .attr("ry", 5);
        groupSel.append("text")
            .attr("id", "tag_text");
        groupSel.append("text")
            .attr("id", "tag_freq")
            .style("fill","#494949")
            .style("font-size","8px");

        // Update Tags
        tagSelection.select("rect#tag_bg")
            .attr("x", function(d) { return d.x - d.bbWidth/2; })
            .attr("y", function(d) { return d.y - d.bbHeight/2; })
            .attr("width", function(d) { return d.bbWidth; })
            .attr("height", function(d) { return d.bbHeight; })
            .style("fill", function(d,i) {return (d.isSelected ? "#1F914F"/*"#B7DBEB"*/ : "none"); });
        tagSelection.select("text#tag_text")
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return (d.y); })
            .style("text-anchor", "middle")
            .style("font-size",function(d) { return d.fontSize;})
            .attr("alignment-baseline", "central")
            .text(function(d) { return d.wordShort;})
            .style("fill", function(d,i) {return (d.isSelected ? "#FFFFFF" : "#000000"); });
            //.style("filter", function(d) { return ("url(#drop-shadow"+mapToShadowGroup(d.fontSize)+")");});
        tagSelection.select("text#tag_freq")
            .text(function(d) { return d.frequency;})
            .attr("x", function(d) { return d.x+d.bbWidth/2;})
            .attr("y", function(d) { return d.y- d.bbHeight/4;});
        tagSelection.exit().remove();

        clouds.select("rect#facet_Header_selectionBar")
            .attr("width", function(d) {
                var nrSelTags = d.tags.filter(function(d) { return d.isSelected; }).length;
                return d.facetHeader.bbWidth / d.tags.length * nrSelTags;
            })
            .attr("x", function(d) {
                return d.facetHeader.x - d.facetHeader.bbWidth / 2;
            })
            .attr("y", function(d) {
                return d.facetHeader.y - d.facetHeader.bbHeight / 2;
            });
    }

    function refreshLayout() {
        var centrds = [];
        var weights = [];
        facetData.forEach(function(d,i) { centrds.push(d.centroid);});
        facetData.forEach(function(d,i) { weights.push(d.weight);});
        var polys = voronoi.layout(centrds, weights);
        facetData.forEach(function(d,i) { d.polygon = polys[i];});
        drawVoronoi();
        facetData.forEach(function(d) { cloudLayout(d);});
        drawTagCloud();
    }

    //////////////////////////////////////////////////////////////////////
    //
    // TAG LAYOUT: Calculate valid positions of tags for each facet
    //             along a virtual spiral originating at the voronoi
    //             centroid.
    //
    //////////////////////////////////////////////////////////////////////
    function cloudLayout(singleFacetData) {
        singleFacetData.tags.forEach(function(d,i) {d.isFixed = false;});
        singleFacetData.facetHeader.x = singleFacetData.centroid.X;
        singleFacetData.facetHeader.y = singleFacetData.centroid.Y;
        var pos;
        var tagIndex = 0;
        var cumWithin = false;
        var cumValidTagPos = false;
        for(var i = 0; i < 500; i++) {
            pos = fermatSpiral(i);
            pos.dx += singleFacetData.centroid.X;
            pos.dy += singleFacetData.centroid.Y;

            var bool = isWithinBounds(pos.dx, pos.dy, singleFacetData.polygon);
            cumWithin = cumWithin || bool;
            if(bool) {
                if(tagIndex < singleFacetData.tags.length) {
                    var bool2 = testTagPosition(singleFacetData.tags[tagIndex], singleFacetData, pos.dx, pos.dy);
                    cumValidTagPos = cumValidTagPos || bool2;
                    if(bool2) {
                        singleFacetData.tags[tagIndex].x = pos.dx;
                        singleFacetData.tags[tagIndex].y = pos.dy;
                        tagIndex++;
                    }
                }
            }
        }
        singleFacetData.visibleTags = tagIndex;
    }


    function testTagPosition(tag, singleFacet, x, y) {

        var minx = x - tag.bbWidth/2;
        var maxx = x + tag.bbWidth/2;
        var miny = y - tag.bbHeight/2;
        var maxy = y + tag.bbHeight/2;
        tag.x = x;
        tag.y = y;
        if(isWithinBounds(minx, miny, singleFacet.polygon) && isWithinBounds(maxx, miny, singleFacet.polygon)
            && isWithinBounds(minx, maxy, singleFacet.polygon) && isWithinBounds(maxx, maxy, singleFacet.polygon)) {

            var fCollides = false;
            if(collidesWith(tag, singleFacet.facetHeader)) {
                return false;
            }
            for(var i = 0; i < singleFacet.tags.length; i++) {
                var otherTag = singleFacet.tags[i];
                if(otherTag.isFixed) {
                    if(collidesWith(tag, otherTag)) {
                        fCollides = true;
                        break;
                    }
                }
            }
            if(!fCollides) {
                tag.isFixed = true;
                return true;
            } else {
                return false;
            }
        }
    }

    function isWithinBounds(x, y, polygon) {
        var j = polygon.length - 1;
        var oddNodes = false;

        for(var i = 0; i < polygon.length; i++) {
            if(polygon[i].Y < y && polygon[j].Y >= y ||
               polygon[j].Y < y && polygon[i].Y >= y) {
                if(polygon[i].X + (y - polygon[i].Y) / (polygon[j].Y - polygon[i].Y) * (polygon[j].X - polygon[i].X) < x) {
                    oddNodes = !oddNodes;
                }
            }
            j = i;
        }
        return oddNodes;
    }

    function collidesWith(tag1, tag2) {
        var x1 = tag1.x - tag1.bbWidth/ 2, y1 = tag1.y - tag1.bbHeight/ 2, w1 = tag1.bbWidth, h1 = tag1.bbHeight;
        var x2 = tag2.x - tag2.bbWidth/ 2, y2 = tag2.y - tag2.bbHeight/ 2, w2 = tag2.bbWidth, h2 = tag2.bbHeight;
        var xl = x1, yo = y1, xr = x2 + w2, yu = y2 + h2;
        if(x2 < x1) { xl = x2; }
        if(y2 < y1) { yo = y2; }
        if(x1 + w1 > x2 + w2) { xr = x1 + w1; }
        if(y1 + h1 > y2 + h2) { yu = y1 + h1; }

        if((w1 + w2 > xr - xl) && (h1 + h2 > yu - yo)) {
            return true;
        } else {
            return false;
        }
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

    function hasAttribute(item, facetName, tag) {
        if(item.hasOwnProperty(facetName)) {
            if(item[facetName] instanceof Array) {
                for(var i = 0; i < item[facetName].length; i++) {
                    if(getCanonicalString(item[facetName][i]) == getCanonicalString(tag)) {
                        return true;
                    }
                }
                return false;
            } else {
                if(getCanonicalString(item[facetName]) == getCanonicalString(tag)) {
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }

    function updateFrequencies() {
        for(var f = 0; f < facetData.length; f++) {
            var key = facetData[f].name;
            var tags = facetData[f].tags;
            for(var t = 0; t < facetData[f].tags.length; t++) {
                facetData[f].tags[t].frequency = 0;
                for(var i = 0; i < selectedResults.length; i++) {
                    if(selectedResults[i].hasOwnProperty(key)) {
                        if(selectedResults[i][key] instanceof Array) {
                            for(var tt = 0; tt < selectedResults[i][key].length; tt++) {
                                var canonTag = getCanonicalString(selectedResults[i][key][tt]);
                                if(canonTag == getCanonicalString(facetData[f].tags[t].word)){
                                    facetData[f].tags[t].frequency++;
                                }
                            }
                        } else {
                            var canonTag = getCanonicalString(selectedResults[i][key]);
                            if(canonTag == getCanonicalString(facetData[f].tags[t].word)){
                                facetData[f].tags[t].frequency++;
                            }
                        }
                    }
                }
            }
        }
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

    facetScapeObject.draw = function(term, facetData, resultData) {
       drawTagCloud();
    }

    function search(term) {
        //chrome.runtime.sendMessage(chrome.i18n.getMessage('@@extension_id'), {method: {parent: 'model', func: 'query'}, data: [{weight:1,text:term}]});
        var queryTerm = term;
        var onReceiveData = function(processedData, items) {
            d3.select("div#RS_Panel").remove();
            d3.select("svg#facetScape").remove();
            d3.select("div#RS_ResultList").remove();
            facetScape(root, svgWidth, height, processedData, items, queryTerm);
        }
        //requestEuropeana(term,onReceiveData);
        requestPlugin(onReceiveData);
    }

    return facetScapeObject;
}