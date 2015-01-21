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
    var voronoi;
    var facetCentroids;
    var facetPolygons;
    var facetWeights = [];
    var spareFacets = [];

    var recentSelectedFacet = "";


    var searchTerm = term;
    // Main Data Object holding facet information required for visualization
    var facetData = [];
    // Main Data Object holding all result items received for a queried term
    var resultItems = queryResultItems;
    // Main Data Object holding a users current selection
    var tagSelection = {};
    // Main Data Object holding currently selected items
    var selectedResults = queryResultItems;

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

    // configuration parameters for tag clouds
    var MIN_FONT_SIZE = 11;
    var MAX_FONT_SIZE = 16;
    var TAG_PADDING_X = 2;
    var TAG_PADDING_Y = 1;
    var SPIRAL_FERMAT_SCALE = 40;
    var MAX_LENGTH = 15;
    var maxFrequency;

    // Animation
    var FACET_POLYGON_COLLISION_COLOR = "#0371a6";
    var FACET_POLYGON_COLLISION_WIDTH = 5;
    var FACET_POLYGON_COLOR = "#e8e8e8";
    var FACET_POLYGON_WIDTH = 2;

    /////////////////////////////////////////////////////////////////
    //
    // INTERACTIVITY: MouseEvents
    //
    ////////////////////////////////////////////////////////////////
    var INTERACTION = (function() {
<<<<<<< HEAD
        var internal = {
            // Animation
            facetResizeHandle: null,
            resizingFacet: null,
            recentlyHoveredTag: null,
            resizeFacet: function(d) {
                if (typeof internal.resizingFacet != "undefined") {
=======
        var internal = {
            // Animation
            facetResizeHandle: null,
            resizingFacet: null,
            recentlyHoveredTag: null,
            resizeFacet: function(d) {
                if (typeof internal.resizingFacet != "undefined") {
>>>>>>> origin/master
                    clearInterval(internal.facetResizeHandle);
                }
                internal.resizingFacet = d;
                var minDist = Number.MAX_VALUE;
                var minFacet = null;
                var distance = 0.0;
<<<<<<< HEAD
                for (var i = 0; i < facetData.length; i++) {
                    if (facetData[i] != d) {
                        //facetData[i].weight = 1;
                        distance = Math.sqrt(Math.pow(d.centroid.X - facetData[i].centroid.X, 2) + Math.pow(d.centroid.Y - facetData[i].centroid.Y, 2));
                        if (distance < minDist) {
=======
                for (var i = 0; i < facetData.length; i++) {
                    if (facetData[i] != d) {
                        //facetData[i].weight = 1;
                        distance = Math.sqrt(Math.pow(d.centroid.X - facetData[i].centroid.X, 2) + Math.pow(d.centroid.Y - facetData[i].centroid.Y, 2));
                        if (distance < minDist) {
>>>>>>> origin/master
                            minDist = distance;
                            minFacet = facetData[i];
                        }
                    }
                }
                internal.facetResizeHandle = internal.createInterval(internal.enlargeFacet, d, minDist, 30);
            },
            createInterval: function(f, facet, maxDist, interval) {
<<<<<<< HEAD
                return setInterval(function() {
                    f(facet, maxDist);
                }, interval);
            },
            enlargeFacet: function(facet, maxWeight) {
                for (var i = 0; i < facetData.length; i++) {
                    if (facetData[i] != facet && facetData[i].weight > STEP_WEIGHT) {
=======
                return setInterval(function() {
                    f(facet, maxDist);
                }, interval);
            },
            enlargeFacet: function(facet, maxWeight) {
                for (var i = 0; i < facetData.length; i++) {
                    if (facetData[i] != facet && facetData[i].weight > STEP_WEIGHT) {
>>>>>>> origin/master
                        facetData[i].weight -= STEP_WEIGHT;
                    }
                }
                var newWeight = facet.weight + STEP_WEIGHT;
<<<<<<< HEAD
                if (newWeight < maxWeight) {
                    if (facet.visibleTags == facet.tags.length) {
=======
                if (newWeight < maxWeight) {
                    if (facet.visibleTags == facet.tags.length) {
>>>>>>> origin/master
                        window.clearInterval(internal.facetResizeHandle);
                    } else {
                        facet.weight = newWeight;
                        RENDERING.refreshFacetScape();
                    }
                } else {
                    facet.weight = maxWeight;
                    RENDERING.refreshFacetScape();
                    window.clearInterval(internal.facetResizeHandle);
<<<<<<< HEAD
                    var collFacet = d3.select("g#" + facet.name).select("path");
                    collFacet.style("stroke", FACET_POLYGON_COLLISION_COLOR).style("stroke-width", FACET_POLYGON_COLLISION_WIDTH + "px").transition().duration(1000).style("stroke", FACET_POLYGON_COLOR).style("stroke-width", FACET_POLYGON_WIDTH + "px");
=======
                    var collFacet = d3.select("g#" + facet.name).select("path");
                    collFacet.style("stroke", FACET_POLYGON_COLLISION_COLOR).style("stroke-width", FACET_POLYGON_COLLISION_WIDTH + "px").transition().duration(1000).style("stroke", FACET_POLYGON_COLOR).style("stroke-width", FACET_POLYGON_WIDTH + "px");
>>>>>>> origin/master

                }
            },
            getOverlapedFacets: function(facet, newWeight) {
                var overlappingFacets = [];
                var distance = 0.0;
                var isNotOverlapping = true;
<<<<<<< HEAD
                for (var i = 0; i < facetData.length; i++) {
                    if (facetData[i].name !== facet.name) {
                        distance = Math.sqrt(Math.pow(facet.centroid.X - facetData[i].centroid.X, 2) + Math.pow(facet.centroid.Y - facetData[i].centroid.Y, 2));
                        if (distance < (facetData[i].weight + newWeight)) {
                            isNotOverlapping = isNotOverlapping && false;
                            overlappingFacets.push({"olfacet": facetData[i], "dist": distance});
=======
                for (var i = 0; i < facetData.length; i++) {
                    if (facetData[i].name !== facet.name) {
                        distance = Math.sqrt(Math.pow(facet.centroid.X - facetData[i].centroid.X, 2) + Math.pow(facet.centroid.Y - facetData[i].centroid.Y, 2));
                        if (distance < (facetData[i].weight + newWeight)) {
                            isNotOverlapping = isNotOverlapping && false;
                            overlappingFacets.push({"olfacet": facetData[i], "dist": distance});
>>>>>>> origin/master
                        }
                    }
                }
                return overlappingFacets;
            },
            setHoveredElement: function(D3OBJ_Tag) {
<<<<<<< HEAD
                if (internal.recentlyHoveredTag) {
=======
                if (internal.recentlyHoveredTag) {
>>>>>>> origin/master
                    INTERACTION.hideHoverTooltip(internal.recentlyHoveredTag);
                }
                internal.recentlyHoveredTag = D3OBJ_Tag;
            }
        }
        return {
            showHoverTooltip: function(D3OBJ_Tag) {
                var targetTagGroup = d3.select(D3OBJ_Tag);
                var d = D3OBJ_Tag.__data__;
                D3OBJ_Tag.parentNode.appendChild(D3OBJ_Tag);
                D3OBJ_Tag.parentNode.parentNode.appendChild(D3OBJ_Tag.parentNode);
                targetTagGroup.style("cursor", "pointer");
                targetTagGroup.select("text.tag-freq").text("");
                var tagHovered = targetTagGroup.select("text.tag-text").text(d.word);
                var selRect = targetTagGroup.select("rect.tag-bg");
                var nBBWidth = tagHovered.node().getBBox().width + 2 * TAG_PADDING_X;
                var nBBHeight = selRect.node().getBBox().height + TAG_PADDING_Y;
<<<<<<< HEAD
                selRect.attr("x", d.x - nBBWidth / 2).attr("y", d.y - nBBHeight * 0.75).attr("width", nBBWidth).attr("height", nBBHeight);
                var gain = 0;
                var facetName = D3OBJ_Tag.parentNode.__data__.name;
                if (!d.isSelected) {
                    selRect.classed("tag-bg", true)
                            .classed("tag-bg-hovered", true);//selRect.style("fill", "#D9D3C7");//.style("fill", "#E1EDF2");
                    if (tagSelection.hasOwnProperty(facetName)) {
=======
                selRect.attr("x", d.x - nBBWidth / 2).attr("y", d.y - nBBHeight * 0.75).attr("width", nBBWidth).attr("height", nBBHeight);
                var gain = 0;
                var facetName = D3OBJ_Tag.parentNode.__data__.name;
                if (!d.isSelected) {
                    selRect.classed("tag-bg", true)
                            .classed("tag-bg-hovered", true);//selRect.style("fill", "#D9D3C7");//.style("fill", "#E1EDF2");
                    if (tagSelection.hasOwnProperty(facetName)) {
>>>>>>> origin/master
                        tagSelection[facetName].push(d.word);
                    } else {
                        tagSelection[facetName] = [d.word];
                    }
                    var hypoResults = QUERYING.evaluateSelection(tagSelection);
                    gain = hypoResults.length - selectedResults.length;
                    var id = tagSelection[facetName].indexOf(d.word);
                    tagSelection[facetName].splice(id, 1);
<<<<<<< HEAD
                    if (tagSelection[facetName].length == 0) {
=======
                    if (tagSelection[facetName].length == 0) {
>>>>>>> origin/master
                        delete tagSelection[facetName];
                    }
                } else {
                    selRect.classed("tag-bg", true)
<<<<<<< HEAD
                            .classed("tag-bg-hovered", true)
                            .classed("tag-selected", true);
                    var id = tagSelection[facetName].indexOf(d.word);
                    tagSelection[facetName].splice(id, 1);
                    if (tagSelection[facetName].length == 0) {
=======
                            .classed("tag-bg-hovered", true)
                            .classed("tag-selected", true);
                    var id = tagSelection[facetName].indexOf(d.word);
                    tagSelection[facetName].splice(id, 1);
                    if (tagSelection[facetName].length == 0) {
>>>>>>> origin/master
                        delete tagSelection[facetName];
                    }
                    var hypoResults = QUERYING.evaluateSelection(tagSelection);
                    gain = hypoResults.length - selectedResults.length;
<<<<<<< HEAD
                    if (tagSelection.hasOwnProperty(facetName)) {
=======
                    if (tagSelection.hasOwnProperty(facetName)) {
>>>>>>> origin/master
                        tagSelection[facetName].push(d.word);
                    } else {
                        tagSelection[facetName] = [d.word];
                    }
                }
                var info = targetTagGroup.append("g").attr("class", "hoverInfo");
                info.append("rect").attr("class", "tag-quantity-bg")
<<<<<<< HEAD
                        .attr("x", d.x + nBBWidth / 2 - 46)
                        .attr("y", d.y - nBBHeight * 0.75 - 10)
                        .attr("width", 38)
                        .attr("height", 13)
                        .attr("rx", 5)
                        .attr("ry", 5)
                info.append("rect")
                        .attr("class", function() {
                    if (gain < 0) {
                        return "tag-quantity-bg-loss"
                    } else if (gain == 0) {
                        return "tag-quantity-bg-neutral"
                    } else {
                        return "tag-quantity-bg-gain"
                    }
                })
                        .attr("x", d.x + nBBWidth / 2 - 10)
                        .attr("y", d.y - nBBHeight * 0.75 - 10)
                        .attr("width", 20)
                        .attr("height", 13)
                        .attr("rx", 5)
                        .attr("ry", 5);
                info.append("text")
                        .attr("class", "tag-quantity-text")
                        .attr("x", d.x + nBBWidth / 2)
                        .attr("y", d.y - nBBHeight * 0.75 - 1)
                        .text(function() {
                    if (gain > 0) {
                        return "+" + gain;
                    } else {
                        return gain;
                    }
                });
                info.append("text")
                        .attr("class", "tag-quantity-text")
                        .attr("x", d.x + nBBWidth / 2 - 27)
                        .attr("y", d.y - nBBHeight * 0.75 - 1)
                        .text(function(d) {
                    return d.frequency + "/" + selectedResults.length;
                });
=======
                        .attr("x", d.x + nBBWidth / 2 - 46)
                        .attr("y", d.y - nBBHeight * 0.75 - 10)
                        .attr("width", 38)
                        .attr("height", 13)
                        .attr("rx", 5)
                        .attr("ry", 5)
                info.append("rect")
                        .attr("class", function() {
                    if (gain < 0) {
                        return "tag-quantity-bg-loss"
                    } else if (gain == 0) {
                        return "tag-quantity-bg-neutral"
                    } else {
                        return "tag-quantity-bg-gain"
                    }
                })
                        .attr("x", d.x + nBBWidth / 2 - 10)
                        .attr("y", d.y - nBBHeight * 0.75 - 10)
                        .attr("width", 20)
                        .attr("height", 13)
                        .attr("rx", 5)
                        .attr("ry", 5);
                info.append("text")
                        .attr("class", "tag-quantity-text")
                        .attr("x", d.x + nBBWidth / 2)
                        .attr("y", d.y - nBBHeight * 0.75 - 1)
                        .text(function() {
                    if (gain > 0) {
                        return "+" + gain;
                    } else {
                        return gain;
                    }
                });
                info.append("text")
                        .attr("class", "tag-quantity-text")
                        .attr("x", d.x + nBBWidth / 2 - 27)
                        .attr("y", d.y - nBBHeight * 0.75 - 1)
                        .text(function(d) {
                    return d.frequency + "/" + selectedResults.length;
                });
>>>>>>> origin/master
            },
            hideHoverTooltip: function(D3OBJ_Tag) {
                var targetTagGroup = d3.select(D3OBJ_Tag);
                var d = D3OBJ_Tag.__data__;
                var selectedTag = targetTagGroup.select("rect.tag-bg");
<<<<<<< HEAD
                selectedTag.attr("x", d.x - d.bbWidth / 2)/*.attr("y", d.y - d.bbHeight/2)*/.attr("width", d.bbWidth).attr("height", d.bbHeight);
                targetTagGroup.select("text.tag-text").text(d.wordShort);
                if (!d.isSelected) {
=======
                selectedTag.attr("x", d.x - d.bbWidth / 2)/*.attr("y", d.y - d.bbHeight/2)*/.attr("width", d.bbWidth).attr("height", d.bbHeight);
                targetTagGroup.select("text.tag-text").text(d.wordShort);
                if (!d.isSelected) {
>>>>>>> origin/master
                    selectedTag.attr("class", "tag-bg");
                } else {
                    selectedTag.attr("class", "tag-bg tag-selected");
                }
                targetTagGroup.selectAll("g.hoverInfo").remove();
<<<<<<< HEAD
                targetTagGroup.select("text.tag-freq").text(function(d) {
                    return d.frequency;
                });
=======
                targetTagGroup.select("text.tag-freq").text(function(d) {
                    return d.frequency;
                });
>>>>>>> origin/master
            },
            onMouseOverFunction: function(d, i) {
                if (d.isHovered) {
                    return;
                }
                d.isHovered = true;
                internal.setHoveredElement(this);
                INTERACTION.showHoverTooltip(this);
            },
            onMouseOutFunction: function(d) {
                d.isHovered = false;
                INTERACTION.hideHoverTooltip(this);
            },
            onMouseClickFunction: function(d, i) {
                var targetTag = d3.select(this);
                var selectedTag = targetTag.select("rect.tag-bg");
                d.isSelected = !d.isSelected;
                var facetName = this.parentNode.__data__.name;
<<<<<<< HEAD
                if (d.isSelected) {
                    LOGGING.logInteraction({'mode': 'selection', 'facetName': facetName, 'facetValue': d.word});
                    recentSelectedFacet = facetName;
                    if (tagSelection.hasOwnProperty(facetName)) {
=======
                if (d.isSelected) {
                    LOGGING.logInteraction({'mode': 'selection', 'facetName': facetName, 'facetValue': d.word});
                    recentSelectedFacet = facetName;
                    if (tagSelection.hasOwnProperty(facetName)) {
>>>>>>> origin/master
                        tagSelection[facetName].push(d.word);
                    } else {
                        tagSelection[facetName] = [d.word];
                    }
                } else {
                    LOGGING.logInteraction({'mode': 'deselection', 'facetName': facetName, 'facetValue': d.word});
                    var id = tagSelection[facetName].indexOf(d.word);
                    tagSelection[facetName].splice(id, 1);
<<<<<<< HEAD
                    if (tagSelection[facetName].length == 0) {
=======
                    if (tagSelection[facetName].length == 0) {
>>>>>>> origin/master
                        delete tagSelection[facetName];
                    }
                }
                RENDERING.drawResultList();
                QUERYING.updateFrequencies();
                RENDERING.drawTagCloud();
                d.isHovered = false;
                INTERACTION.showHoverTooltip(this);
            },
            onMouseClickFacetName: function(d, i) {
<<<<<<< HEAD
                if (d3.event.defaultPrevented == false) {
                    var selTag = d3.select(this).select("rect");
                    var nrSelTags = this.__data__.tags.filter(function(d) {
=======
                if (d3.event.defaultPrevented == false) {
                    var selTag = d3.select(this).select("rect");
                    var nrSelTags = this.__data__.tags.filter(function(d) {
>>>>>>> origin/master
                        return d.isSelected;
                    }).length;
                    if (nrSelTags == this.__data__.tags.length) {
                        d.isSelected = true;
                    }
                    d.isSelected = !d.isSelected;
                    var facetName = this.__data__.name;
                    if (d.isSelected) {
                        LOGGING.logInteraction({'mode': 'selection', 'facetName': facetName, 'facetValue': null});
                        if (tagSelection.hasOwnProperty(facetName)) {
<<<<<<< HEAD
                            this.__data__.tags.forEach(function(d, i) {
=======
                            this.__data__.tags.forEach(function(d, i) {
>>>>>>> origin/master
                                d.isSelected = true;
                                tagSelection[facetName].push(d.word);
                            });
                        } else {
                            tagSelection[facetName] = [];
<<<<<<< HEAD
                            this.__data__.tags.forEach(function(d, i) {
=======
                            this.__data__.tags.forEach(function(d, i) {
>>>>>>> origin/master
                                d.isSelected = true;
                                tagSelection[facetName].push(d.word);
                            });
                        }
                    } else {
                        LOGGING.logInteraction({'mode': 'deselection', 'facetName': facetName, 'facetValue': null});
<<<<<<< HEAD
                        this.__data__.tags.forEach(function(d, i) {
=======
                        this.__data__.tags.forEach(function(d, i) {
>>>>>>> origin/master
                            d.isSelected = false;
                        });
                        delete tagSelection[facetName];
                    }
                    RENDERING.drawResultList();
                    QUERYING.updateFrequencies();
                    RENDERING.drawTagCloud();
                }
            },
            onMouseDragStartFacetName: function(d, i) {
                LOGGING.logInteraction({'mode': 'move', 'facetName': d.name, 'facetValue': null});
                d.weight = 1;
                spareArea.select("rect#spareArea").attr("class", "spareArea spareArea-highlighted");
                var txt = spareArea.append("text").attr("id", "spareArea_text").attr("class", "spareArea-text");
                txt.attr("x", width + parseInt(spareArea.attr("width") / 2) + "px")
<<<<<<< HEAD
                        .attr("y", parseInt(spareArea.attr("height") / 2) + "px")
                        .text(STR_DROP_HERE);
            },
            startFacetResizing: function(D3OBJ_Facet) {
                var data = D3OBJ_Facet.__data__;
                if (internal.resizingFacet != data) {
=======
                        .attr("y", parseInt(spareArea.attr("height") / 2) + "px")
                        .text(STR_DROP_HERE);
            },
            startFacetResizing: function(D3OBJ_Facet) {
                var data = D3OBJ_Facet.__data__;
                if (internal.resizingFacet != data) {
>>>>>>> origin/master
                    internal.resizeFacet(data);
                    D3OBJ_Facet.parentNode.appendChild(D3OBJ_Facet);
                }
            },
            onFacetEntered: function(d) {

                INTERACTION.startFacetResizing(this);
            },
            onMouseDragEndFacetName: function(d, i) {
                var facet = this.parentNode.__data__;
                spareArea.select("rect").attr("class", "spareArea");
                spareArea.select("text#spareArea_text").remove();
<<<<<<< HEAD
                if (facet.centroid.X > width) {
                    if (spareFacets.indexOf(this.parentNode) == -1 && facetData.length > 1) {
                        var freeSlot = spareFacets.length;
                        for (var idx = 0; idx < spareFacets.length; idx++) {
                            if (spareFacets[idx] == "undefined") {
=======
                if (facet.centroid.X > width) {
                    if (spareFacets.indexOf(this.parentNode) == -1 && facetData.length > 1) {
                        var freeSlot = spareFacets.length;
                        for (var idx = 0; idx < spareFacets.length; idx++) {
                            if (spareFacets[idx] == "undefined") {
>>>>>>> origin/master
                                freeSlot = idx;
                                break;
                            }
                        }

                        LOGGING.logInteraction({'mode': 'exclude', 'facetName': facet.name, 'facetValue': null});
<<<<<<< HEAD
                        facet.centroid.X = width + widthSpare / 2;
=======
                        facet.centroid.X = width + widthSpare / 2;
>>>>>>> origin/master
                        facet.centroid.Y = freeSlot * 30 + 20;
                        facet.facetHeader.x = facet.centroid.X;
                        facet.facetHeader.y = facet.centroid.Y;
                        spareFacets[freeSlot] = this.parentNode;
                        d3.select(this.parentNode).remove();
                        var groupSel = spareArea.append("g").attr("id", "facet_Header_group").attr("name", facet.name)
<<<<<<< HEAD
                                .call(d3.behavior.drag().on("drag", INTERACTION.onMouseMoveIn).on("dragend", INTERACTION.onMouseDragEndInFacetName))
                                .attr("x", facet.centroid.X)
                                .attr("y", facet.centroid.Y);
                        groupSel.append("rect")
                                .attr("class", "facetHeader-bg")
                                .attr("width", facet.facetHeader.bbWidth)
                                .attr("height", facet.facetHeader.bbHeight)
                                .attr("x", facet.centroid.X - facet.facetHeader.bbWidth / 2)
                                .attr("y", facet.centroid.Y - facet.facetHeader.bbHeight / 2)
                                .attr("rx", 5)
                                .attr("ry", 3)
                                .attr("stroke", "#ffffff");
                        //.style("filter", "url(#drop-shadow0)");
                        groupSel.append("rect")
                                .attr("class", "facetHeader-selectionBar")
                                .attr("width", function(d) {
                            var nrSelTags = facet.tags.filter(function(d) {
                                return d.isSelected;
                            }).length;
                            return facet.facetHeader.bbWidth / facet.tags.length * nrSelTags;
                        })
                                .attr("height", function(d) {
                            return facet.facetHeader.bbHeight;
                        })
                                .attr("x", facet.centroid.X - facet.facetHeader.bbWidth / 2)
                                .attr("y", facet.centroid.Y - facet.facetHeader.bbHeight / 2)
                                .attr("rx", 5)
                                .attr("ry", 3);
                        groupSel.append("text")
                                .attr("class", "facetHeader")
                                .text(facet.facetHeader.word)
                                .attr("x", facet.centroid.X)
                                .attr("y", facet.centroid.Y + facet.facetHeader.bbHeight / 4);
=======
                                .call(d3.behavior.drag().on("drag", INTERACTION.onMouseMoveIn).on("dragend", INTERACTION.onMouseDragEndInFacetName))
                                .attr("x", facet.centroid.X)
                                .attr("y", facet.centroid.Y);
                        groupSel.append("rect")
                                .attr("class", "facetHeader-bg")
                                .attr("width", facet.facetHeader.bbWidth)
                                .attr("height", facet.facetHeader.bbHeight)
                                .attr("x", facet.centroid.X - facet.facetHeader.bbWidth / 2)
                                .attr("y", facet.centroid.Y - facet.facetHeader.bbHeight / 2)
                                .attr("rx", 5)
                                .attr("ry", 3)
                                .attr("stroke", "#ffffff");
                        //.style("filter", "url(#drop-shadow0)");
                        groupSel.append("rect")
                                .attr("class", "facetHeader-selectionBar")
                                .attr("width", function(d) {
                            var nrSelTags = facet.tags.filter(function(d) {
                                return d.isSelected;
                            }).length;
                            return facet.facetHeader.bbWidth / facet.tags.length * nrSelTags;
                        })
                                .attr("height", function(d) {
                            return facet.facetHeader.bbHeight;
                        })
                                .attr("x", facet.centroid.X - facet.facetHeader.bbWidth / 2)
                                .attr("y", facet.centroid.Y - facet.facetHeader.bbHeight / 2)
                                .attr("rx", 5)
                                .attr("ry", 3);
                        groupSel.append("text")
                                .attr("class", "facetHeader")
                                .text(facet.facetHeader.word)
                                .attr("x", facet.centroid.X)
                                .attr("y", facet.centroid.Y + facet.facetHeader.bbHeight / 4);
>>>>>>> origin/master
                        var idx = facetData.indexOf(facet);
                        facetData.splice(idx, 1);
                        RENDERING.refreshFacetScape();
                    }
                } else {
                    internal.resizeFacet(facet);
                }
            },
            onMouseMoveIn: function(d, i) {
                svg[0][0].appendChild(this);
                var dragTarget = d3.select(this);
                var name = dragTarget.attr("name");
                var x = d3.event.dx + parseInt(dragTarget.attr("x"));
                var y = d3.event.dy + parseInt(dragTarget.attr("y"));
                dragTarget.attr("x", x).attr("y", y);
                dragTarget.selectAll("rect").attr("x", parseInt(dragTarget.select("rect").attr("x")) + d3.event.dx)
<<<<<<< HEAD
                        .attr("y", parseInt(dragTarget.select("rect").attr("y")) + d3.event.dy);
                dragTarget.select("text").attr("x", parseInt(dragTarget.select("text").attr("x")) + d3.event.dx)
                        .attr("y", parseInt(dragTarget.select("text").attr("y")) + d3.event.dy);
                spareFacets.forEach(function(d, i) {
                    if (d != "undefined") {
                        if (d.__data__.name == name) {
=======
                        .attr("y", parseInt(dragTarget.select("rect").attr("y")) + d3.event.dy);
                dragTarget.select("text").attr("x", parseInt(dragTarget.select("text").attr("x")) + d3.event.dx)
                        .attr("y", parseInt(dragTarget.select("text").attr("y")) + d3.event.dy);
                spareFacets.forEach(function(d, i) {
                    if (d != "undefined") {
                        if (d.__data__.name == name) {
>>>>>>> origin/master
                            d.__data__.centroid.X = x, d.__data__.facetHeader.x = x;
                            d.__data__.centroid.Y = y, d.__data__.facetHeader.y = y;
                        }
                    }
                });
            },
            onMouseDragEndInFacetName: function(d, i) {
                var dragTarget = d3.select(this);
                var name = dragTarget.attr("name");

                // A newly inserted facet may overlap with existing ones.
                // Iteratively reduce weights to provide enough space for the new facet
                var i;
<<<<<<< HEAD
                spareFacets.forEach(function(d, i) {
                    var facetToDrop = d.__data__;

                    if (typeof facetToDrop !== "undefined") {
                        if (facetToDrop.name === name) {
                            LOGGING.logInteraction({'mode': 'move', 'facetName': facetToDrop.name, 'facetValue': null});
                            LOGGING.logInteraction({'mode': 'include', 'facetName': facetToDrop.name, 'facetValue': null});
                            var olfs = internal.getOverlapedFacets(facetToDrop, facetToDrop.weight);
                            while (olfs.length > 0) {
=======
                spareFacets.forEach(function(d, i) {
                    var facetToDrop = d.__data__;

                    if (typeof facetToDrop !== "undefined") {
                        if (facetToDrop.name === name) {
                            LOGGING.logInteraction({'mode': 'move', 'facetName': facetToDrop.name, 'facetValue': null});
                            LOGGING.logInteraction({'mode': 'include', 'facetName': facetToDrop.name, 'facetValue': null});
                            var olfs = internal.getOverlapedFacets(facetToDrop, facetToDrop.weight);
                            while (olfs.length > 0) {
>>>>>>> origin/master
                                facetToDrop.weight *= 0.5;
                                var f;
                                var minDist = Number.MAX_VALUE;
                                var minDistOlf;
<<<<<<< HEAD
                                for (f = 0; f < olfs.length; f++) {
                                    if (olfs[f].dist < minDist) {
=======
                                for (f = 0; f < olfs.length; f++) {
                                    if (olfs[f].dist < minDist) {
>>>>>>> origin/master
                                        minDist = olfs[f].dist;
                                        minDistOlf = olfs[f].olfacet;
                                    }
                                }
                                minDistOlf.weight *= 0.5;
                                olfs = internal.getOverlapedFacets(facetToDrop, facetToDrop.weight);
                            }
                            internal.resizeFacet(facetToDrop);
                        }
                    }
                });
                // END overlap code
                var idxToDelete;
<<<<<<< HEAD
                if (parseInt(dragTarget.attr("x")) < width) {
                    spareFacets.forEach(function(d, i) {
                        if (d !== "undefined") {
                            if (d.__data__.name === name) {
=======
                if (parseInt(dragTarget.attr("x")) < width) {
                    spareFacets.forEach(function(d, i) {
                        if (d !== "undefined") {
                            if (d.__data__.name === name) {
>>>>>>> origin/master
                                facetData.push(d.__data__);
                                svg[0][0].appendChild(d);
                                idxToDelete = i;
                            }
                        }
                    });
                    spareFacets[idxToDelete] = "undefined";
                    dragTarget.remove();
                }
                RENDERING.refreshFacetScape();
            },
            onMouseWheel: function(d, i) {
                var facet = this.parentNode.__data__;
                var evt = window.event;
                evt.preventDefault();
                var delta = evt.detail ? evt.detail * -120 : evt.wheelDelta;
<<<<<<< HEAD
                if (delta > 0) {
                    var newWeight = facet.weight + STEP_WEIGHT;
                    var distance = 0.0;
                    var isNotOverlapping = true;
                    for (var i = 0; i < facetData.length; i++) {
                        if (facetData[i].name !== facet.name) {
                            distance = Math.sqrt(Math.pow(facet.centroid.X - facetData[i].centroid.X, 2) + Math.pow(facet.centroid.Y - facetData[i].centroid.Y, 2));
                            if (distance < (facetData[i].weight + newWeight)) {
                                isNotOverlapping = isNotOverlapping && false;
                                var collFacet = d3.select("g#" + facetData[i].name).select("path");
                                collFacet.style("stroke", FACET_POLYGON_COLLISION_COLOR).style("stroke-width", FACET_POLYGON_COLLISION_WIDTH + "px").transition().duration(1000).style("stroke", FACET_POLYGON_COLOR).style("stroke-width", FACET_POLYGON_WIDTH + "px");
                            }
                        }
                    }
                    if (isNotOverlapping) {
                        this.parentNode.__data__.weight += STEP_WEIGHT;
                    }
                }
                if (delta < 0) {
                    if (this.parentNode.__data__.weight > STEP_WEIGHT) {
=======
                if (delta > 0) {
                    var newWeight = facet.weight + STEP_WEIGHT;
                    var distance = 0.0;
                    var isNotOverlapping = true;
                    for (var i = 0; i < facetData.length; i++) {
                        if (facetData[i].name !== facet.name) {
                            distance = Math.sqrt(Math.pow(facet.centroid.X - facetData[i].centroid.X, 2) + Math.pow(facet.centroid.Y - facetData[i].centroid.Y, 2));
                            if (distance < (facetData[i].weight + newWeight)) {
                                isNotOverlapping = isNotOverlapping && false;
                                var collFacet = d3.select("g#" + facetData[i].name).select("path");
                                collFacet.style("stroke", FACET_POLYGON_COLLISION_COLOR).style("stroke-width", FACET_POLYGON_COLLISION_WIDTH + "px").transition().duration(1000).style("stroke", FACET_POLYGON_COLOR).style("stroke-width", FACET_POLYGON_WIDTH + "px");
                            }
                        }
                    }
                    if (isNotOverlapping) {
                        this.parentNode.__data__.weight += STEP_WEIGHT;
                    }
                }
                if (delta < 0) {
                    if (this.parentNode.__data__.weight > STEP_WEIGHT) {
>>>>>>> origin/master
                        this.parentNode.__data__.weight -= STEP_WEIGHT;
                    }
                }
                RENDERING.refreshFacetScape();
            },
<<<<<<< HEAD
            move: function() {
                var facet = this.__data__;
                if (facet.facetHeader.x < facet.facetHeader.bbWidth / 2) {
                    facet.facetHeader.x = facet.facetHeader.bbWidth / 2;
                    facet.centroid.X = facet.facetHeader.bbWidth / 2;
                }
                if (facet.facetHeader.x > svgWidth) {
                    facet.facetHeader.x = svgWidth - facet.facetHeader.bbWidth / 2;
                    facet.centroid.X = svgWidth - facet.facetHeader.bbWidth / 2;
                }
                if (facet.facetHeader.y < facet.facetHeader.bbHeight / 2) {
                    facet.facetHeader.y = facet.facetHeader.bbHeight / 2;
                    facet.centroid.Y = facet.facetHeader.bbHeight / 2;
                }
                if (facet.facetHeader.y > svgHeight - facet.facetHeader.bbHeight / 2) {
                    facet.facetHeader.y = svgHeight - facet.facetHeader.bbHeight / 2;
                    facet.centroid.Y = svgHeight - facet.facetHeader.bbHeight / 2;
=======
            move: function() {
                var facet = this.__data__;
                if (facet.facetHeader.x < facet.facetHeader.bbWidth / 2) {
                    facet.facetHeader.x = facet.facetHeader.bbWidth / 2;
                    facet.centroid.X = facet.facetHeader.bbWidth / 2;
                }
                if (facet.facetHeader.x > svgWidth) {
                    facet.facetHeader.x = svgWidth - facet.facetHeader.bbWidth / 2;
                    facet.centroid.X = svgWidth - facet.facetHeader.bbWidth / 2;
                }
                if (facet.facetHeader.y < facet.facetHeader.bbHeight / 2) {
                    facet.facetHeader.y = facet.facetHeader.bbHeight / 2;
                    facet.centroid.Y = facet.facetHeader.bbHeight / 2;
                }
                if (facet.facetHeader.y > svgHeight - facet.facetHeader.bbHeight / 2) {
                    facet.facetHeader.y = svgHeight - facet.facetHeader.bbHeight / 2;
                    facet.centroid.Y = svgHeight - facet.facetHeader.bbHeight / 2;
>>>>>>> origin/master
                }

                this.parentNode.parentNode.appendChild(this.parentNode);
                var dragTarget = d3.select(this);
                var newX = this.__data__.centroid.X + d3.event.dx;
                var newY = this.__data__.centroid.Y + d3.event.dy;
                var distance = 0.0;
                var isNotOverlapping = true;
                var overlappedFacet;
                var overlappedDist;
<<<<<<< HEAD
                for (var i = 0; i < facetData.length; i++) {
                    if (facetData[i] != facet) {
                        distance = Math.sqrt(Math.pow(newX - facetData[i].centroid.X, 2) + Math.pow(newY - facetData[i].centroid.Y, 2));
                        if (distance < (facetData[i].weight + facet.weight)) {
=======
                for (var i = 0; i < facetData.length; i++) {
                    if (facetData[i] != facet) {
                        distance = Math.sqrt(Math.pow(newX - facetData[i].centroid.X, 2) + Math.pow(newY - facetData[i].centroid.Y, 2));
                        if (distance < (facetData[i].weight + facet.weight)) {
>>>>>>> origin/master
                            isNotOverlapping = isNotOverlapping && false;
                            facetData[i].weight = 0;
                            overlappedFacet = facetData[i];
                            overlappedDist = distance;
<<<<<<< HEAD
                            var collFacet = d3.select("g#" + facetData[i].name).select("path");
                            collFacet.style("stroke", FACET_POLYGON_COLLISION_COLOR).style("stroke-width", FACET_POLYGON_COLLISION_WIDTH + "px").transition().duration(1000).style("stroke", FACET_POLYGON_COLOR).style("stroke-width", FACET_POLYGON_WIDTH + "px");
                        }
                    }
                }
                if (isNotOverlapping) {
=======
                            var collFacet = d3.select("g#" + facetData[i].name).select("path");
                            collFacet.style("stroke", FACET_POLYGON_COLLISION_COLOR).style("stroke-width", FACET_POLYGON_COLLISION_WIDTH + "px").transition().duration(1000).style("stroke", FACET_POLYGON_COLOR).style("stroke-width", FACET_POLYGON_WIDTH + "px");
                        }
                    }
                }
                if (isNotOverlapping) {
>>>>>>> origin/master
                    this.__data__.centroid.X = newX;
                    this.__data__.centroid.Y = newY;
                    this.__data__.facetHeader.x = newX;
                    this.__data__.facetHeader.y = newY;
                } else {
<<<<<<< HEAD
                    if (overlappedDist <= facet.weight) {
                        var vec = {X: ((overlappedFacet.centroid.X - newX) / overlappedDist) * -(facet.weight + 1), Y: ((overlappedFacet.centroid.Y - newY) / overlappedDist) * -(facet.weight + 1)};
=======
                    if (overlappedDist <= facet.weight) {
                        var vec = {X: ((overlappedFacet.centroid.X - newX) / overlappedDist) * -(facet.weight + 1), Y: ((overlappedFacet.centroid.Y - newY) / overlappedDist) * -(facet.weight + 1)};
>>>>>>> origin/master
                        this.__data__.centroid.X = overlappedFacet.centroid.X + vec.X;
                        this.__data__.centroid.Y = overlappedFacet.centroid.Y + vec.Y;
                        this.__data__.facetHeader.x = overlappedFacet.centroid.X + vec.X;
                        this.__data__.facetHeader.y = overlappedFacet.centroid.Y + vec.Y;
                    }

                }

                RENDERING.refreshFacetScape();
            },
            onMouseClickFilterTagFunction: function(d, i) {
                var index = tagSelection['filter'].indexOf(d3.select(this).text());
                tagSelection['filter'].splice(index, 1);
                d3.select(this).remove();
<<<<<<< HEAD
                if (d3.selectAll("div.queryPanel-filter-tag")[0].length == 0) {
=======
                if (d3.selectAll("div.queryPanel-filter-tag")[0].length == 0) {
>>>>>>> origin/master
                    d3.select("div#RS_Header_Filter_Tags").style("height", "1px");
                }
                RENDERING.drawResultList();
                QUERYING.updateFrequencies();
                RENDERING.drawTagCloud();
            },
            onKeywordEntered: function(keywords) {

<<<<<<< HEAD
                if (keywords.length == 0) {
=======
                if (keywords.length == 0) {
>>>>>>> origin/master
                    tagSelection['filter'] = [];
                    d3.selectAll("div#RS_Header_Filter_Tag").remove();
                    d3.select("div#RS_Header_Filter_Tags").style("height", "1px");
                } else {
                    $('input#RS_Keyword_Query')[0].value = "";
<<<<<<< HEAD
                    if (typeof tagSelection['filter'] == "undefined") {
                        tagSelection['filter'] = [keywords];
                        d3.select("div#RS_Header_Filter_Tags").style("height", "30px");
                        var filterTag = d3.select("div#RS_Header_Filter_Tags").append("div").attr("class", "queryPanel-filter-tag")
                                .on("click", INTERACTION.onMouseClickFilterTagFunction);
                        filterTag.text(keywords);
                    } else {
                        if (tagSelection['filter'].indexOf(keywords) == -1) {
                            tagSelection['filter'].push(keywords);
                            d3.select("div#RS_Header_Filter_Tags").style("height", "30px");
                            var filterTag = d3.select("div#RS_Header_Filter_Tags").append("div").attr("class", "queryPanel-filter-tag")
                                    .on("click", INTERACTION.onMouseClickFilterTagFunction);
=======
                    if (typeof tagSelection['filter'] == "undefined") {
                        tagSelection['filter'] = [keywords];
                        d3.select("div#RS_Header_Filter_Tags").style("height", "30px");
                        var filterTag = d3.select("div#RS_Header_Filter_Tags").append("div").attr("class", "queryPanel-filter-tag")
                                .on("click", INTERACTION.onMouseClickFilterTagFunction);
                        filterTag.text(keywords);
                    } else {
                        if (tagSelection['filter'].indexOf(keywords) == -1) {
                            tagSelection['filter'].push(keywords);
                            d3.select("div#RS_Header_Filter_Tags").style("height", "30px");
                            var filterTag = d3.select("div#RS_Header_Filter_Tags").append("div").attr("class", "queryPanel-filter-tag")
                                    .on("click", INTERACTION.onMouseClickFilterTagFunction);
>>>>>>> origin/master
                            filterTag.text(keywords);
                        }
                    }
                }

                RENDERING.drawResultList();
                QUERYING.updateFrequencies();
                RENDERING.drawTagCloud();
            }
        }
    })();

    var DATA = (function() {
        var internal = {
            sortfunction: function(a, b) {
<<<<<<< HEAD
                if (a.frequency > b.frequency) {
                    return -1;
                } else if (a.frequency === b.frequency) {
=======
                if (a.frequency > b.frequency) {
                    return -1;
                } else if (a.frequency === b.frequency) {
>>>>>>> origin/master
                    return 0;
                } else {
                    return 1;
                }
            },
            mapFreqToFontSize: function(frequency) {
                return (frequency / maxFrequency) * (MAX_FONT_SIZE - MIN_FONT_SIZE) + MIN_FONT_SIZE;
            }
        }
        return {
            createFacetData: function(ifacets, iCentroids, iPolygons, iWeights) {
                var data = [];
<<<<<<< HEAD
                for (var f = 0; f < ifacets.length; f++) {
=======
                for (var f = 0; f < ifacets.length; f++) {
>>>>>>> origin/master
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
            },
            enrichWithLayoutInfo: function(fData) {
                var f, t;
<<<<<<< HEAD
                for (f = 0; f < fData.length; f++) {
                    if (typeof fData[f].tags[0] === "undefined") {
=======
                for (f = 0; f < fData.length; f++) {
                    if (typeof fData[f].tags[0] === "undefined") {
>>>>>>> origin/master
                        continue;
                    }
                    fData[f].tags.sort(internal.sortfunction);
                    maxFrequency = fData[f].tags[0].frequency;
<<<<<<< HEAD
                    for (t = 0; t < fData[f].tags.length; t++) {
                        var l = fData[f].tags[t].word.length;
                        fData[f].tags[t].wordShort = (l > MAX_LENGTH) ? fData[f].tags[t].word.substring(0, MAX_LENGTH - 1) + ".." : fData[f].tags[t].word;
                        var fontSize = internal.mapFreqToFontSize(fData[f].tags[t].frequency);
                        var rTag = d3.select("body").append('div').attr("class", "tag").style("font-size", fontSize + "px").text(facetData[f].tags[t].wordShort);
=======
                    for (t = 0; t < fData[f].tags.length; t++) {
                        var l = fData[f].tags[t].word.length;
                        fData[f].tags[t].wordShort = (l > MAX_LENGTH) ? fData[f].tags[t].word.substring(0, MAX_LENGTH - 1) + ".." : fData[f].tags[t].word;
                        var fontSize = internal.mapFreqToFontSize(fData[f].tags[t].frequency);
                        var rTag = d3.select("body").append('div').attr("class", "tag").style("font-size", fontSize + "px").text(facetData[f].tags[t].wordShort);
>>>>>>> origin/master
                        fData[f].tags[t].id = t;
                        fData[f].tags[t].facetName = fData[f].name;
                        fData[f].tags[t].bbWidth = parseInt(rTag.style("width"), 10) + 2 * TAG_PADDING_X;
                        fData[f].tags[t].bbHeight = parseInt(rTag.style("height"), 10) + 2 * TAG_PADDING_Y;
                        fData[f].tags[t].fontSize = fontSize;
                        fData[f].tags[t].x = fData[f].centroid.X;
                        fData[f].tags[t].y = fData[f].centroid.Y;
                        fData[f].tags[t].isFixed = false;
                        fData[f].tags[t].isSelected = false;
                        d3.selectAll(".tag").remove();
                    }
                    var fHeader = d3.select("body").append('div').attr("class", "facetHeader").text(fData[f].name.toUpperCase());
                    fData[f]['visibleTags'] = 0;
                    fData[f]['facetHeader'] = {
<<<<<<< HEAD
                        "word": fData[f].name.toUpperCase(),
=======
                        "word": fData[f].name.toUpperCase(),
>>>>>>> origin/master
                        "bbHeight": parseInt(fHeader.style("height"), 10),
                        "bbWidth": parseInt(fHeader.style("width"), 10),
                        "isFixed": true,
                        "isSelected": false,
<<<<<<< HEAD
                        "x": fData[f].centroid.X,
                        "y": fData[f].centroid.Y
=======
                        "x": fData[f].centroid.X,
                        "y": fData[f].centroid.Y
>>>>>>> origin/master
                    }
                    d3.selectAll(".facetHeader").remove();
                }
                return fData;
            }
        }
    })();

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
<<<<<<< HEAD
        var facetsLastRow = (nFacets % MAX_FACETS_HORIZONTAL);
=======
        var facetsLastRow = (nFacets % MAX_FACETS_HORIZONTAL);
>>>>>>> origin/master
        var facetRows = Math.floor(nFacets / MAX_FACETS_HORIZONTAL);
        var horizontalSpacePerFacet = (width) / MAX_FACETS_HORIZONTAL;
        var verticalSpacePerFacet = svgHeight / (facetRows + ((facetsLastRow != 0) ? 1 : 0));
        var tmpFacetCentroid = [];
<<<<<<< HEAD
        for (var r = 0; r < facetRows; r++) {
            for (var c = 0; c < MAX_FACETS_HORIZONTAL; c++) {
                tmpFacetCentroid = {X: horizontalSpacePerFacet / 2 + c * horizontalSpacePerFacet, Y: verticalSpacePerFacet / 2 + r * verticalSpacePerFacet};
                facetCentroids.push(tmpFacetCentroid);
            }
        }
        if (facetsLastRow != 0) {
            horizontalSpacePerFacet = (width) / facetsLastRow;
            var ypos = verticalSpacePerFacet / 2 + facetRows * verticalSpacePerFacet;
            for (var c = 0; c < facetsLastRow; c++) {
                tmpFacetCentroid = {X: horizontalSpacePerFacet / 2 + c * horizontalSpacePerFacet, Y: ypos};
                facetCentroids.push(tmpFacetCentroid);
            }
        }
        for (var i = 0; i < nFacets; i++) {
            facetData[i] = {weight: ((1.0 / nFacets) * 100)};
=======
        for (var r = 0; r < facetRows; r++) {
            for (var c = 0; c < MAX_FACETS_HORIZONTAL; c++) {
                tmpFacetCentroid = {X: horizontalSpacePerFacet / 2 + c * horizontalSpacePerFacet, Y: verticalSpacePerFacet / 2 + r * verticalSpacePerFacet};
                facetCentroids.push(tmpFacetCentroid);
            }
        }
        if (facetsLastRow != 0) {
            horizontalSpacePerFacet = (width) / facetsLastRow;
            var ypos = verticalSpacePerFacet / 2 + facetRows * verticalSpacePerFacet;
            for (var c = 0; c < facetsLastRow; c++) {
                tmpFacetCentroid = {X: horizontalSpacePerFacet / 2 + c * horizontalSpacePerFacet, Y: ypos};
                facetCentroids.push(tmpFacetCentroid);
            }
        }
        for (var i = 0; i < nFacets; i++) {
            facetData[i] = {weight: ((1.0 / nFacets) * 100)};
>>>>>>> origin/master
        }
        return facetCentroids;
    }
    function FSQueryPanel() {
<<<<<<< HEAD
        var resultList = root.append("div").attr("id", "RS_Panel").attr("class", "theme").style("width", svgWidth + "px");
        var resultHeader = resultList.append("div").attr("id", "RS_Header");
        var resultHeaderSearch = resultHeader.append("div").attr("id", "RS_Header_Search").attr("class", "queryPanel-search");
        resultHeaderSearch.append("input").attr("id", "RS_Query").attr("class", "queryPanel-searchField").attr("type", "text").attr("name", "query").attr("value", searchTerm);

        resultHeaderSearch.append("input").attr("id", "RS_SubmitButtonId").attr("class", "queryPanel-searchButton").attr("type", "submit").attr("value", STR_BTN_SEARCH);
        if(resultItems.length === EEXCESS.config.NUM_RESULTS) {
            resultHeaderSearch.append('p').attr('id', 'moreHint').text('<- hit the search button again to explore more results');
        }

        $('#RS_Query').keypress(function(e) {
            if (e.which == 13) {
                $('#facetScape').hide();
                $('#RS_ResultList').hide();
                $('#moreHint').hide();
                $('#loader p').hide();
                $('#loader img').show();
                $('#loader').show();
=======
        var resultList = root.append("div").attr("id", "RS_Panel").attr("class", "theme").style("width", svgWidth + "px");
        var resultHeader = resultList.append("div").attr("id", "RS_Header");
        var resultHeaderSearch = resultHeader.append("div").attr("id", "RS_Header_Search").attr("class", "queryPanel-search");
        resultHeaderSearch.append("input").attr("id", "RS_Query").attr("class", "queryPanel-searchField").attr("type", "text").attr("name", "query").attr("value", searchTerm);

        resultHeaderSearch.append("input").attr("id", "RS_SubmitButtonId").attr("class", "queryPanel-searchButton").attr("type", "submit").attr("value", STR_BTN_SEARCH);
        if(resultItems.length === EEXCESS.config.NUM_RESULTS) {
            resultHeaderSearch.append('p').attr('id', 'moreHint').text('<- hit the search button again to explore more results');
        }

        $('#RS_Query').keypress(function(e) {
            if (e.which == 13) {
                $('#facetScape').hide();
                $('#RS_ResultList').hide();
                $('#moreHint').hide();
                $('#loader p').hide();
                $('#loader img').show();
                $('#loader').show();
>>>>>>> origin/master
                QUERYING.search(e.currentTarget.value);
            }
        });
        $('#RS_SubmitButtonId').click(function(e) {
<<<<<<< HEAD
            $('#facetScape').hide();
            $('#RS_ResultList').hide();
            $('#moreHint').hide();
                $('#loader p').hide();
                $('#loader img').show();
                $('#loader').show();
            QUERYING.search($('#RS_Query')[0].value);
        });

        var resultHeaderFilter = resultHeader.append("div").attr("id", "RS_Header_Filter").attr("class", "queryPanel-filter");
        resultHeaderFilter.append("input").attr("id", "RS_Keyword_Query").attr("class", "queryPanel-filterField").attr("type", "text").attr("name", "keywordQuery").attr("value", "");
        resultHeaderFilter.append("input").attr("id", "RS_Keyword_SubmitButtonId").attr("class", "queryPanel-filterButton").attr("type", "submit").attr("value", STR_BTN_FILTER);
        resultHeader.append("div").attr("id", "RS_Header_Text").attr("class", "queryPanel-text").text(STR_QUERY_RESULTS + ":");

        $('#RS_Keyword_Query').keypress(function(e) {
=======
            $('#facetScape').hide();
            $('#RS_ResultList').hide();
            $('#moreHint').hide();
                $('#loader p').hide();
                $('#loader img').show();
                $('#loader').show();
            QUERYING.search($('#RS_Query')[0].value);
        });
        
        var resultHeaderFilter = resultHeader.append("div").attr("id", "RS_Header_Filter").attr("class", "queryPanel-filter");
        resultHeaderFilter.append("input").attr("id", "RS_Keyword_Query").attr("class", "queryPanel-filterField").attr("type", "text").attr("name", "keywordQuery").attr("value", "");
        resultHeaderFilter.append("input").attr("id", "RS_Keyword_SubmitButtonId").attr("class", "queryPanel-filterButton").attr("type", "submit").attr("value", STR_BTN_FILTER);
        resultHeader.append("div").attr("id", "RS_Header_Text").attr("class", "queryPanel-text").text(STR_QUERY_RESULTS + ":");
        
        $('#RS_Keyword_Query').keypress(function(e) {
>>>>>>> origin/master
            if (e.which == 13) {
                INTERACTION.onKeywordEntered(e.currentTarget.value);
            }
        });
        $('#RS_Keyword_SubmitButtonId').click(function(e) {
            INTERACTION.onKeywordEntered($('#RS_Keyword_Query')[0].value);
        });
<<<<<<< HEAD
        var resultHeaderFilterTags = resultList.append("div").attr("id", "RS_Header_Filter_Tags").attr("class", "queryPanel-filter-tags")

        var loaderDiv = root.append('div').attr('id', 'loader');
        loaderDiv.append('img').attr('src', '../../media/loading.gif').attr('alt', 'loading');
        loaderDiv.append('p').attr('id','errorMsg');
    }

    function FSResultLayout() {
        root.append("div").attr("id", "RS_ResultList").attr("class", "resultList").style("max-height", svgHeight - 40 + "px");//.style("width", svgWidth-2+"px");
        var rList = EEXCESS.searchResultList($('#RS_ResultList'), {itemsShown: 9999, pathToMedia: '../../../media/', pathToLibs: '../../../libs/'});
=======
        var resultHeaderFilterTags = resultList.append("div").attr("id", "RS_Header_Filter_Tags").attr("class", "queryPanel-filter-tags")

        var loaderDiv = root.append('div').attr('id', 'loader');
        loaderDiv.append('img').attr('src', '../../media/loading.gif').attr('alt', 'loading');
        loaderDiv.append('p').attr('id','errorMsg');
    }

    function FSResultLayout() {
        root.append("div").attr("id", "RS_ResultList").attr("class", "resultList").style("max-height", svgHeight - 40 + "px");//.style("width", svgWidth-2+"px");
        var rList = EEXCESS.searchResultList($('#RS_ResultList'), {itemsShown: 9999, pathToMedia: '../../../media/', pathToLibs: '../../../libs/'});
>>>>>>> origin/master
        RENDERING.drawResultList();
    }

    //////////////////////////////////////////////////////////////////////
    //
    // REDRAW: Methods for redrawing voronoi cells, tag layout and
    //         result list.
    //
    //////////////////////////////////////////////////////////////////////
    var RENDERING = (function() {
<<<<<<< HEAD
        var internal = {
=======
        var internal = {
>>>>>>> origin/master
        }
        return {
            drawResultList: function() {

                selectedResults = QUERYING.evaluateSelection(tagSelection);
//                d3.select("div#RS_ResultList").style("max-height", svgHeight);
                $("div#RS_Header_Text").text("Query Results (" + selectedResults.length + ")");
                var allResults = $("div#RS_ResultList ul.block_list li");
                allResults.each(function(idx) {
                    var item = $(this);
                    item.hide();
<<<<<<< HEAD
                    for (var r in selectedResults) {
                        if (item.attr("data-id") == selectedResults[r].id) {
=======
                    for (var r in selectedResults) {
                        if (item.attr("data-id") == selectedResults[r].id) {
>>>>>>> origin/master
                            item.show();
                        }
                    }
                });
                var noResultsNode = $("div#RS_ResultList ul.block_list #noResults");
<<<<<<< HEAD
                if (selectedResults.length == 0) {
                    if (!noResultsNode.length) {
=======
                if (selectedResults.length == 0) {
                    if (!noResultsNode.length) {
>>>>>>> origin/master
                        $("div#RS_ResultList ul.block_list").append($('<li id="noResults">no results</li>'));
                    }
                    noResultsNode.show();
                } else {
<<<<<<< HEAD
                    if (noResultsNode.length) {
=======
                    if (noResultsNode.length) {
>>>>>>> origin/master
                        noResultsNode.remove();
                    }
                }
            },
            drawVoronoi: function() {
<<<<<<< HEAD
                var polySelection = svg.selectAll("g.facetGroup").selectAll("path").data(function(d) {
                    return [d.polygon];
                });
                polySelection.enter().append("path").attr("class", "voronoiPolygon");
                polySelection.attr("d", function(d, i) {
                    var path = "", j;
                    for (j = 0; j < d.length; j++) {
                        if (!j)
                            path += "M";
                        else
                            path += "L";
=======
                var polySelection = svg.selectAll("g.facetGroup").selectAll("path").data(function(d) {
                    return [d.polygon];
                });
                polySelection.enter().append("path").attr("class", "voronoiPolygon");
                polySelection.attr("d", function(d, i) {
                    var path = "", j;
                    for (j = 0; j < d.length; j++) {
                        if (!j)
                            path += "M";
                        else
                            path += "L";
>>>>>>> origin/master
                        path += d[j].X + ", " + d[j].Y;
                    }
                    path += "Z";
                    return path;
                })
<<<<<<< HEAD
                        .on("mousewheel.zoom", INTERACTION.onMouseWheel);

                var facets = svg.selectAll("g.facetGroup").on("mouseenter", INTERACTION.onFacetEntered);
                var facetNameSelection = facets.selectAll("g.facetHeader-group").data(function(d) {
                    return [d];
                });

                var groupSel = facetNameSelection.enter().append("g").attr("class", "facetHeader-group")
                        .call(d3.behavior.drag().on("drag", INTERACTION.move)
                        .on("dragstart", INTERACTION.onMouseDragStartFacetName)
                        .on("dragend", INTERACTION.onMouseDragEndFacetName))
                        .on("click", INTERACTION.onMouseClickFacetName)
                        .on("mousewheel.zoom", INTERACTION.onMouseWheel);

                groupSel.append("rect")
                        .attr("class", "facetHeader-bg")
                        .attr("width", function(d) {
                    return d.facetHeader.bbWidth;
                })
                        .attr("height", function(d) {
                    return d.facetHeader.bbHeight;
                })
                        .attr("rx", 5)
                        .attr("ry", 3)
                groupSel.append("rect")
                        .attr("class", "facetHeader-selectionBar")
                        .attr("width", 0)
                        .attr("height", function(d) {
                    return d.facetHeader.bbHeight;
                })
                        .attr("rx", 5)
                        .attr("ry", 3);
                groupSel.append("text").attr("class", "facetHeader");

                facetNameSelection.select("rect.facetHeader-bg")
                        .attr("x", function(d) {
                    return d.facetHeader.x - d.facetHeader.bbWidth / 2;
                })
                        .attr("y", function(d) {
                    return d.facetHeader.y - d.facetHeader.bbHeight * 0.75;
                });
                facetNameSelection.select("text.facetHeader")
                        .attr("x", function(d) {
                    return d.facetHeader.x;
                })
                        .attr("y", function(d) {
                    return d.facetHeader.y;
                })
                        .text(function(d) {
                    return d.facetHeader.word;
                });

                svg.selectAll("g.facetGroup").select("path").style("fill", function(d) {
                    return "url(#gradient-" + d.name + ")";
                });
=======
                        .on("mousewheel.zoom", INTERACTION.onMouseWheel);

                var facets = svg.selectAll("g.facetGroup").on("mouseenter", INTERACTION.onFacetEntered);
                var facetNameSelection = facets.selectAll("g.facetHeader-group").data(function(d) {
                    return [d];
                });

                var groupSel = facetNameSelection.enter().append("g").attr("class", "facetHeader-group")
                        .call(d3.behavior.drag().on("drag", INTERACTION.move)
                        .on("dragstart", INTERACTION.onMouseDragStartFacetName)
                        .on("dragend", INTERACTION.onMouseDragEndFacetName))
                        .on("click", INTERACTION.onMouseClickFacetName)
                        .on("mousewheel.zoom", INTERACTION.onMouseWheel);

                groupSel.append("rect")
                        .attr("class", "facetHeader-bg")
                        .attr("width", function(d) {
                    return d.facetHeader.bbWidth;
                })
                        .attr("height", function(d) {
                    return d.facetHeader.bbHeight;
                })
                        .attr("rx", 5)
                        .attr("ry", 3)
                groupSel.append("rect")
                        .attr("class", "facetHeader-selectionBar")
                        .attr("width", 0)
                        .attr("height", function(d) {
                    return d.facetHeader.bbHeight;
                })
                        .attr("rx", 5)
                        .attr("ry", 3);
                groupSel.append("text").attr("class", "facetHeader");

                facetNameSelection.select("rect.facetHeader-bg")
                        .attr("x", function(d) {
                    return d.facetHeader.x - d.facetHeader.bbWidth / 2;
                })
                        .attr("y", function(d) {
                    return d.facetHeader.y - d.facetHeader.bbHeight * 0.75;
                });
                facetNameSelection.select("text.facetHeader")
                        .attr("x", function(d) {
                    return d.facetHeader.x;
                })
                        .attr("y", function(d) {
                    return d.facetHeader.y;
                })
                        .text(function(d) {
                    return d.facetHeader.word;
                });

                svg.selectAll("g.facetGroup").select("path").style("fill", function(d) {
                    return "url(#gradient-" + d.name + ")";
                });
>>>>>>> origin/master
            },
            drawTagCloud: function() {

                var clouds = svg.selectAll("g.facetGroup");

                // Bind Data to Tags
                var tagsSelection = clouds.selectAll("g.tag").data(
<<<<<<< HEAD
                        function(d) {
                            return d.tags.filter(function(d) {
                                return d.isFixed;
                            }
                            );
                        },
                        function(d) {
                            return d.word;
                        }
=======
                        function(d) {
                            return d.tags.filter(function(d) {
                                return d.isFixed;
                            }
                            );
                        },
                        function(d) {
                            return d.word;
                        }
>>>>>>> origin/master
                );

                // Create Tags
                var groupSel = tagsSelection.enter().append("g")
<<<<<<< HEAD
                        .attr("class", "tag")
                        .on("mouseenter", INTERACTION.onMouseOverFunction)
                        .on("mouseleave", INTERACTION.onMouseOutFunction)
                        .on("mousewheel.zoom", INTERACTION.onMouseWheel)
                        .on("click", INTERACTION.onMouseClickFunction);
                groupSel.append("rect")
                        .attr("class", "tag-bg")
                        .attr("rx", 5)
                        .attr("ry", 5);
                groupSel.append("text")
                        .attr("class", "tag-text");
                groupSel.append("text")
                        .attr("class", "tag-freq");

                // Update Tags
                tagsSelection.select("rect.tag-bg")
                        .classed("tag-bg", true)
                        .classed("tag-bg-hovered", false)
                        .attr("x", function(d) {
                    return d.x - d.bbWidth / 2;
                })
                        .attr("y", function(d) {
                    return d.y - d.bbHeight * 0.75;
                })
                        .attr("width", function(d) {
                    return d.bbWidth;
                })
                        .attr("height", function(d) {
                    return d.bbHeight;
                })
                        .classed("tag-selected", function(d) {
                    return d.isSelected;
                });
                tagsSelection.select("text.tag-text")
                        .attr("x", function(d) {
                    return d.x;
                })
                        .attr("y", function(d) {
                    return (d.y);
                })
                        .style("font-size", function(d) {
                    return d.fontSize + "px";
                })
//                    .attr("alignment-baseline", "central")
                        .text(function(d) {
                    return d.wordShort;
                })
                        .attr("class", function(d) {
                    var myClass = "tag-text";
                    myClass += (!tagSelection[d.facetName] && d.frequency == 0) ? " tag-zero-frequency" : "";
                    myClass += (d.isSelected) ? " tag-selected-text" : "";
                    return myClass;
                });
                tagsSelection.select("text.tag-freq")
                        .text(function(d) {
                    return d.frequency;
                })
                        .attr("x", function(d) {
                    return d.x + (d.bbWidth / 2) + 3;
                })
                        .attr("y", function(d) {
                    return d.y - d.bbHeight / 2;
                });
                tagsSelection.exit().remove();

                clouds.select("rect.facetHeader-selectionBar")
                        .attr("width", function(d) {
                    var nrSelTags = d.tags.filter(function(d) {
                        return d.isSelected;
                    }).length;
                    return d.facetHeader.bbWidth / d.tags.length * nrSelTags;
                })
                        .attr("x", function(d) {
                    return d.facetHeader.x - d.facetHeader.bbWidth / 2;
                })
                        .attr("y", function(d) {
                    return d.facetHeader.y - d.facetHeader.bbHeight * 0.75;
                });
=======
                        .attr("class", "tag")
                        .on("mouseenter", INTERACTION.onMouseOverFunction)
                        .on("mouseleave", INTERACTION.onMouseOutFunction)
                        .on("mousewheel.zoom", INTERACTION.onMouseWheel)
                        .on("click", INTERACTION.onMouseClickFunction);
                groupSel.append("rect")
                        .attr("class", "tag-bg")
                        .attr("rx", 5)
                        .attr("ry", 5);
                groupSel.append("text")
                        .attr("class", "tag-text");
                groupSel.append("text")
                        .attr("class", "tag-freq");

                // Update Tags
                tagsSelection.select("rect.tag-bg")
                        .classed("tag-bg", true)
                        .classed("tag-bg-hovered", false)
                        .attr("x", function(d) {
                    return d.x - d.bbWidth / 2;
                })
                        .attr("y", function(d) {
                    return d.y - d.bbHeight * 0.75;
                })
                        .attr("width", function(d) {
                    return d.bbWidth;
                })
                        .attr("height", function(d) {
                    return d.bbHeight;
                })
                        .classed("tag-selected", function(d) {
                    return d.isSelected;
                });
                tagsSelection.select("text.tag-text")
                        .attr("x", function(d) {
                    return d.x;
                })
                        .attr("y", function(d) {
                    return (d.y);
                })
                        .style("font-size", function(d) {
                    return d.fontSize + "px";
                })
//                    .attr("alignment-baseline", "central")
                        .text(function(d) {
                    return d.wordShort;
                })
                        .attr("class", function(d) {
                    var myClass = "tag-text";
                    myClass += (!tagSelection[d.facetName] && d.frequency == 0) ? " tag-zero-frequency" : "";
                    myClass += (d.isSelected) ? " tag-selected-text" : "";
                    return myClass;
                });
                tagsSelection.select("text.tag-freq")
                        .text(function(d) {
                    return d.frequency;
                })
                        .attr("x", function(d) {
                    return d.x + (d.bbWidth / 2) + 3;
                })
                        .attr("y", function(d) {
                    return d.y - d.bbHeight / 2;
                });
                tagsSelection.exit().remove();

                clouds.select("rect.facetHeader-selectionBar")
                        .attr("width", function(d) {
                    var nrSelTags = d.tags.filter(function(d) {
                        return d.isSelected;
                    }).length;
                    return d.facetHeader.bbWidth / d.tags.length * nrSelTags;
                })
                        .attr("x", function(d) {
                    return d.facetHeader.x - d.facetHeader.bbWidth / 2;
                })
                        .attr("y", function(d) {
                    return d.facetHeader.y - d.facetHeader.bbHeight * 0.75;
                });
>>>>>>> origin/master
            },
            refreshFacetScape: function() {
                var centrds = [];
                var weights = [];
<<<<<<< HEAD
                facetData.forEach(function(d, i) {
                    centrds.push(d.centroid);
                });
                facetData.forEach(function(d, i) {
                    weights.push(d.weight);
                });
                var polys = voronoi.layout(centrds, weights);
                if (polys.length > 0) {
                    facetData.forEach(function(d, i) {
                        d.polygon = polys[i];
                    });
                    RENDERING.drawVoronoi();
                    facetData.forEach(function(d) {
                        TAGLAYOUT.cloudLayout(d);
                    });
=======
                facetData.forEach(function(d, i) {
                    centrds.push(d.centroid);
                });
                facetData.forEach(function(d, i) {
                    weights.push(d.weight);
                });
                var polys = voronoi.layout(centrds, weights);
                if (polys.length > 0) {
                    facetData.forEach(function(d, i) {
                        d.polygon = polys[i];
                    });
                    RENDERING.drawVoronoi();
                    facetData.forEach(function(d) {
                        TAGLAYOUT.cloudLayout(d);
                    });
>>>>>>> origin/master
                    RENDERING.drawTagCloud();
                }
            }
        }
    })();

    //////////////////////////////////////////////////////////////////////
    //
    // TAG LAYOUT: Calculate valid positions of tags for each facet
    //             along a virtual spiral originating at the voronoi
    //             centroid.
    //
    //////////////////////////////////////////////////////////////////////
    var TAGLAYOUT = (function() {
        var internal = {
            testTagPosition: function(tag, singleFacet, x, y) {
<<<<<<< HEAD
                var minx = x - tag.bbWidth / 2;
                var maxx = x + tag.bbWidth / 2;
=======
                var minx = x - tag.bbWidth / 2;
                var maxx = x + tag.bbWidth / 2;
>>>>>>> origin/master
                var miny = y - tag.bbHeight * 0.75;
                var maxy = y + tag.bbHeight * 0.25;
                tag.x = x;
                tag.y = y;
<<<<<<< HEAD
                if (internal.isWithinBounds(minx, miny, singleFacet.polygon) && internal.isWithinBounds(maxx, miny, singleFacet.polygon)
                        && internal.isWithinBounds(minx, maxy, singleFacet.polygon) && internal.isWithinBounds(maxx, maxy, singleFacet.polygon)) {

                    var fCollides = false;
                    if (internal.collidesWith(tag, singleFacet.facetHeader)) {
                        return false;
                    }
                    for (var i = 0; i < singleFacet.tags.length; i++) {
                        var otherTag = singleFacet.tags[i];
                        if (otherTag.isFixed) {
                            if (internal.collidesWith(tag, otherTag)) {
=======
                if (internal.isWithinBounds(minx, miny, singleFacet.polygon) && internal.isWithinBounds(maxx, miny, singleFacet.polygon)
                        && internal.isWithinBounds(minx, maxy, singleFacet.polygon) && internal.isWithinBounds(maxx, maxy, singleFacet.polygon)) {

                    var fCollides = false;
                    if (internal.collidesWith(tag, singleFacet.facetHeader)) {
                        return false;
                    }
                    for (var i = 0; i < singleFacet.tags.length; i++) {
                        var otherTag = singleFacet.tags[i];
                        if (otherTag.isFixed) {
                            if (internal.collidesWith(tag, otherTag)) {
>>>>>>> origin/master
                                fCollides = true;
                                break;
                            }
                        }
                    }
<<<<<<< HEAD
                    if (!fCollides) {
=======
                    if (!fCollides) {
>>>>>>> origin/master
                        tag.isFixed = true;
                        return true;
                    } else {
                        return false;
                    }
                }
            },
            isWithinBounds: function(x, y, polygon) {
                var j = polygon.length - 1;
                var oddNodes = false;
<<<<<<< HEAD
                for (var i = 0; i < polygon.length; i++) {
                    if (polygon[i].Y < y && polygon[j].Y >= y ||
                            polygon[j].Y < y && polygon[i].Y >= y) {
                        if (polygon[i].X + (y - polygon[i].Y) / (polygon[j].Y - polygon[i].Y) * (polygon[j].X - polygon[i].X) < x) {
=======
                for (var i = 0; i < polygon.length; i++) {
                    if (polygon[i].Y < y && polygon[j].Y >= y ||
                            polygon[j].Y < y && polygon[i].Y >= y) {
                        if (polygon[i].X + (y - polygon[i].Y) / (polygon[j].Y - polygon[i].Y) * (polygon[j].X - polygon[i].X) < x) {
>>>>>>> origin/master
                            oddNodes = !oddNodes;
                        }
                    }
                    j = i;
                }
                return oddNodes;
            },
            collidesWith: function(tag1, tag2) {
<<<<<<< HEAD
                var x1 = tag1.x - tag1.bbWidth / 2, y1 = tag1.y - tag1.bbHeight / 2, w1 = tag1.bbWidth, h1 = tag1.bbHeight;
                var x2 = tag2.x - tag2.bbWidth / 2, y2 = tag2.y - tag2.bbHeight / 2, w2 = tag2.bbWidth, h2 = tag2.bbHeight;
                var xl = x1, yo = y1, xr = x2 + w2, yu = y2 + h2;
                if (x2 < x1) {
                    xl = x2;
                }
                if (y2 < y1) {
                    yo = y2;
                }
                if (x1 + w1 > x2 + w2) {
                    xr = x1 + w1;
                }
                if (y1 + h1 > y2 + h2) {
                    yu = y1 + h1;
                }

                if ((w1 + w2 > xr - xl) && (h1 + h2 > yu - yo)) {
=======
                var x1 = tag1.x - tag1.bbWidth / 2, y1 = tag1.y - tag1.bbHeight / 2, w1 = tag1.bbWidth, h1 = tag1.bbHeight;
                var x2 = tag2.x - tag2.bbWidth / 2, y2 = tag2.y - tag2.bbHeight / 2, w2 = tag2.bbWidth, h2 = tag2.bbHeight;
                var xl = x1, yo = y1, xr = x2 + w2, yu = y2 + h2;
                if (x2 < x1) {
                    xl = x2;
                }
                if (y2 < y1) {
                    yo = y2;
                }
                if (x1 + w1 > x2 + w2) {
                    xr = x1 + w1;
                }
                if (y1 + h1 > y2 + h2) {
                    yu = y1 + h1;
                }

                if ((w1 + w2 > xr - xl) && (h1 + h2 > yu - yo)) {
>>>>>>> origin/master
                    return true;
                } else {
                    return false;
                }
            },
            fermatSpiral: function(phi) {

                var r = Math.sqrt(SPIRAL_FERMAT_SCALE * phi);
                var dx = r * Math.cos(phi);
                var dy = r * Math.sin(phi);
<<<<<<< HEAD
                return {"dx": dx, "dy": dy};
=======
                return {"dx": dx, "dy": dy};
>>>>>>> origin/master
            },
            archimedeanSpiral: function(phi) {
                var r = (0.5 * phi);
                var dx = r * Math.cos(phi);
                var dy = r * Math.sin(phi);
<<<<<<< HEAD
                return {"dx": dx, "dy": dy};
=======
                return {"dx": dx, "dy": dy};
>>>>>>> origin/master
            }
        }
        return {
            cloudLayout: function(singleFacetData) {
                var globMax = Number.MIN_VALUE;
                var p = 0;
<<<<<<< HEAD
                for (p; p < singleFacetData.polygon.length; p++) {
                    var myMax = Math.sqrt(Math.pow(singleFacetData.polygon[p].X - singleFacetData.centroid.X, 2) + Math.pow(singleFacetData.polygon[p].Y - singleFacetData.centroid.Y, 2));
                    globMax = myMax > globMax ? myMax : globMax;
                }
                singleFacetData.tags.forEach(function(d, i) {
                    d.isFixed = false;
                });
=======
                for (p; p < singleFacetData.polygon.length; p++) {
                    var myMax = Math.sqrt(Math.pow(singleFacetData.polygon[p].X - singleFacetData.centroid.X, 2) + Math.pow(singleFacetData.polygon[p].Y - singleFacetData.centroid.Y, 2));
                    globMax = myMax > globMax ? myMax : globMax;
                }
                singleFacetData.tags.forEach(function(d, i) {
                    d.isFixed = false;
                });
>>>>>>> origin/master
                singleFacetData.facetHeader.x = singleFacetData.centroid.X;
                singleFacetData.facetHeader.y = singleFacetData.centroid.Y;
                var pos;
                var tagIndex = 0;
                var cumWithin = false;
                var cumValidTagPos = false;
                var i = 0;
                pos = internal.fermatSpiral(i);
<<<<<<< HEAD
                while (Math.sqrt((pos.dx * pos.dx) + (pos.dy * pos.dy)) < globMax) {
=======
                while (Math.sqrt((pos.dx * pos.dx) + (pos.dy * pos.dy)) < globMax) {
>>>>>>> origin/master

                    pos.dx += singleFacetData.centroid.X;
                    pos.dy += singleFacetData.centroid.Y;

                    var bool = internal.isWithinBounds(pos.dx, pos.dy, singleFacetData.polygon);
                    cumWithin = cumWithin || bool;
<<<<<<< HEAD
                    if (bool) {
                        if (tagIndex < singleFacetData.tags.length) {
                            var bool2 = internal.testTagPosition(singleFacetData.tags[tagIndex], singleFacetData, pos.dx, pos.dy);
                            cumValidTagPos = cumValidTagPos || bool2;
                            if (bool2) {
=======
                    if (bool) {
                        if (tagIndex < singleFacetData.tags.length) {
                            var bool2 = internal.testTagPosition(singleFacetData.tags[tagIndex], singleFacetData, pos.dx, pos.dy);
                            cumValidTagPos = cumValidTagPos || bool2;
                            if (bool2) {
>>>>>>> origin/master
                                singleFacetData.tags[tagIndex].x = pos.dx;
                                singleFacetData.tags[tagIndex].y = pos.dy;
                                tagIndex++;
                            }
                        }
                    }
                    i++;
                    pos = internal.fermatSpiral(i);
                }
                singleFacetData.visibleTags = tagIndex;
            }
        }
    })();

    //////////////////////////////////////////////////////////////////////
    //
    // PROGRAM LOGIC: Mainly containing methods for evaluating
    //                a user's selection of both facet search and
    //                and keyword search.
    //
    //////////////////////////////////////////////////////////////////////
    var QUERYING = (function() {
        var internal = {
            hasAttribute: function(item, facetName, tag) {
<<<<<<< HEAD
                if (item.hasOwnProperty(facetName)) {
                    if (item[facetName] instanceof Array) {
                        for (var i = 0; i < item[facetName].length; i++) {
                            if (PROVIDER.getCanonicalString(item[facetName][i]) == PROVIDER.getCanonicalString(tag)) {
=======
                if (item.hasOwnProperty(facetName)) {
                    if (item[facetName] instanceof Array) {
                        for (var i = 0; i < item[facetName].length; i++) {
                            if (PROVIDER.getCanonicalString(item[facetName][i]) == PROVIDER.getCanonicalString(tag)) {
>>>>>>> origin/master
                                return true;
                            }
                        }
                        return false;
                    } else {
<<<<<<< HEAD
                        if (PROVIDER.getCanonicalString(item[facetName]) == PROVIDER.getCanonicalString(tag)) {
=======
                        if (PROVIDER.getCanonicalString(item[facetName]) == PROVIDER.getCanonicalString(tag)) {
>>>>>>> origin/master
                            return true;
                        } else {
                            return false;
                        }
                    }
                } else {
                    return (tag == "unknown") ? true : false;
                }
            }
        }
        return {
            search: function(terms) {
<<<<<<< HEAD
                var query_terms = terms.split(' ');
                var query = [];
                for (var i = 0; i < query_terms.length; i++) {
                    var tmp = {
                        weight: 1,
                        text: query_terms[i]
                    };
                    query.push(tmp);
                }

                EEXCESS.messaging.callBG({method: {parent: 'model', func: 'query'}, data: {numResults: EEXCESS.config.NUM_RESULTS_FACET_SCAPE, terms: query, reason: {reason: 'manual'}}});
=======
                var query_terms = terms.split(' ');
                var query = [];
                for (var i = 0; i < query_terms.length; i++) {
                    var tmp = {
                        weight: 1,
                        text: query_terms[i]
                    };
                    query.push(tmp);
                }

                EEXCESS.messaging.callBG({method: {parent: 'model', func: 'query'}, data: {numResults: EEXCESS.config.NUM_RESULTS_FACET_SCAPE, terms: query, reason: {reason: 'manual'}}});
>>>>>>> origin/master
                PROVIDER.buildFacetScape(terms, PROVIDER.getRequestedProvider(), root, iwidth, iheight);
            },
            evaluateSelection: function(selection) {
                var words = [];
                var regexs = [];
<<<<<<< HEAD
                if (tagSelection.hasOwnProperty("filter")) {
                    words = tagSelection['filter'];
                }
                for (var k = 0; k < words.length; k++) {
                    var terms = words[k].split(' ');
                    var reg = '(';
                    for (var t = 0; t < terms.length; t++) {
                        reg += terms[t] + '';
                        if (t < terms.length - 1) {
                            reg += '|';
                        }
=======
                if (tagSelection.hasOwnProperty("filter")) {
                    words = tagSelection['filter'];
                }
                for (var k = 0; k < words.length; k++) {
                    var terms = words[k].split(' ');
                    var reg = '(';
                    for (var t = 0; t < terms.length; t++) {
                        reg += terms[t] + '';
                        if (t < terms.length - 1) {
                            reg += '|';
                        }
>>>>>>> origin/master
                    }
                    reg += ')';
                    regexs[k] = new RegExp(reg, 'i');
                }
                var filtRes = resultItems.filter(function(d, i) {
                    var item_str = JSON.stringify(d);
                    var booleanAND = true;
<<<<<<< HEAD
                    for (var facet in tagSelection) {
                        if (facet !== "filter") {
                            var booleanOR = false;
                            for (var i = 0; i < tagSelection[facet].length; i++) {
=======
                    for (var facet in tagSelection) {
                        if (facet !== "filter") {
                            var booleanOR = false;
                            for (var i = 0; i < tagSelection[facet].length; i++) {
>>>>>>> origin/master
                                booleanOR |= internal.hasAttribute(d, facet, tagSelection[facet][i]);
                            }
                            booleanAND = booleanAND && booleanOR;
                        }
                    }
<<<<<<< HEAD
                    for (var k = 0; k < regexs.length; k++) {
=======
                    for (var k = 0; k < regexs.length; k++) {
>>>>>>> origin/master
                        booleanAND = booleanAND && regexs[k].test(item_str);
                    }
                    return booleanAND;
                });
                return filtRes;
            },
            updateFrequencies: function() {
<<<<<<< HEAD
                for (var f = 0; f < facetData.length; f++) {
                    var key = facetData[f].name;
                    var tags = facetData[f].tags;
                    for (var t = 0; t < facetData[f].tags.length; t++) {
                        facetData[f].tags[t].frequency = 0;
                        var unknownFreq = 0;
                        for (var i = 0; i < selectedResults.length; i++) {
                            if (selectedResults[i].hasOwnProperty(key)) {
                                if (selectedResults[i][key] instanceof Array) {
                                    for (var tt = 0; tt < selectedResults[i][key].length; tt++) {
                                        var canonTag = PROVIDER.getCanonicalString(selectedResults[i][key][tt]);
                                        if (canonTag == PROVIDER.getCanonicalString(facetData[f].tags[t].word)) {
=======
                for (var f = 0; f < facetData.length; f++) {
                    var key = facetData[f].name;
                    var tags = facetData[f].tags;
                    for (var t = 0; t < facetData[f].tags.length; t++) {
                        facetData[f].tags[t].frequency = 0;
                        var unknownFreq = 0;
                        for (var i = 0; i < selectedResults.length; i++) {
                            if (selectedResults[i].hasOwnProperty(key)) {
                                if (selectedResults[i][key] instanceof Array) {
                                    for (var tt = 0; tt < selectedResults[i][key].length; tt++) {
                                        var canonTag = PROVIDER.getCanonicalString(selectedResults[i][key][tt]);
                                        if (canonTag == PROVIDER.getCanonicalString(facetData[f].tags[t].word)) {
>>>>>>> origin/master
                                            facetData[f].tags[t].frequency++;
                                        }
                                    }
                                } else {
                                    var canonTag = PROVIDER.getCanonicalString(selectedResults[i][key]);
<<<<<<< HEAD
                                    if (canonTag == PROVIDER.getCanonicalString(facetData[f].tags[t].word)) {
=======
                                    if (canonTag == PROVIDER.getCanonicalString(facetData[f].tags[t].word)) {
>>>>>>> origin/master
                                        facetData[f].tags[t].frequency++;
                                    }
                                }
                            } else {
                                unknownFreq += 1;
                            }
                        }
<<<<<<< HEAD
                        if (facetData[f].tags[t].word == "unknown") {
=======
                        if (facetData[f].tags[t].word == "unknown") {
>>>>>>> origin/master
                            facetData[f].tags[t].frequency = unknownFreq;
                        }
                    }
                }
            }
        }
    })();

    //////////////////////////////////////////////////////////////////////
    //
    // HELPER METHODS
    //
    //////////////////////////////////////////////////////////////////////
    function loadDescriptionCallback(result, container, success) {
        container.select("div#RS_QueryResultItem_Loader").remove();
        var str = '';
<<<<<<< HEAD
        if (success) {
            if (typeof result.object != "undefined") {
                if (result.object.proxies[0].hasOwnProperty('dcDescription')) {
                    if (result.object.proxies[0].dcDescription.hasOwnProperty('def')) {
                        str = result.object.proxies[0].dcDescription.def[0];
                        str = (str.length > 115) ? str.substring(0, 115) + "..." : str;
=======
        if (success) {
            if (typeof result.object != "undefined") {
                if (result.object.proxies[0].hasOwnProperty('dcDescription')) {
                    if (result.object.proxies[0].dcDescription.hasOwnProperty('def')) {
                        str = result.object.proxies[0].dcDescription.def[0];
                        str = (str.length > 115) ? str.substring(0, 115) + "..." : str;
>>>>>>> origin/master
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



    function createRadialGradients() {
<<<<<<< HEAD
        for (var f in facets) {
            var defs = svg.append("defs");
            var radialGradient = defs.append("radialGradient")
                    .attr("id", "gradient-" + facets[f].name)
                    .attr("cx", "50%")
                    .attr("cy", "50%")
                    .attr("r", "70%")
                    .attr("fx", "50%")
                    .attr("fy", "50%");
            radialGradient.append("stop")
                    .attr("offset", "0%")
                    .attr("class", "voronoiCell-outerGradient")
//                .style("stop-color", "rgb(234, 229, 220)")
//                .style("stop-opacity", "0.5");
            radialGradient.append("stop")
                    .attr("offset", "100%")
                    .attr("class", "voronoiCell-innerGradient")
=======
        for (var f in facets) {
            var defs = svg.append("defs");
            var radialGradient = defs.append("radialGradient")
                    .attr("id", "gradient-" + facets[f].name)
                    .attr("cx", "50%")
                    .attr("cy", "50%")
                    .attr("r", "70%")
                    .attr("fx", "50%")
                    .attr("fy", "50%");
            radialGradient.append("stop")
                    .attr("offset", "0%")
                    .attr("class", "voronoiCell-outerGradient")
//                .style("stop-color", "rgb(234, 229, 220)")
//                .style("stop-opacity", "0.5");
            radialGradient.append("stop")
                    .attr("offset", "100%")
                    .attr("class", "voronoiCell-innerGradient")
>>>>>>> origin/master
//                .style("stop-color", facets[f].color)
//                .style("stop-opacity", "1");
        }
    }


    var facetScapeObject = {};

    init();

    //////////////////////////////////////////////////////////////////////
    //
    // INITIALIZATION: Create visual elements, enrich data with layout
    //                 information, draw elements
    //
    //////////////////////////////////////////////////////////////////////
    function init() {
        FSQueryPanel();
<<<<<<< HEAD
        svg = root.append("svg").attr("id", "facetScape").attr("width", svgWidth).attr("height", svgHeight);
        spareArea = svg.append("svg:g").attr("id", "spareArea").attr("width", widthSpare).attr("height", svgHeight);
        spareArea.append("svg:rect").attr("class", "spareArea").attr("x", width).attr("y", 0).attr("width", widthSpare).attr("height", svgHeight);
        createRadialGradients();
        voronoi = VoronoiPartitioner([[0, 0], [width, svgHeight]]);
        facetCentroids = FSLayoutUniform();
        for (var i = 0; i < facetCentroids.length; i++) {
            facetWeights.push((1.0 / facetCentroids.length) * 200);
        }
        facetPolygons = voronoi.layout(facetCentroids, facetWeights);
        facetData = DATA.createFacetData(facets, facetCentroids, facetPolygons, facetWeights);
        svg.selectAll("g.facetGroup").data(facetData).enter().append("g").attr("class", "facetGroup").attr("id", function(d) {
            return d.name;
        });
        DATA.enrichWithLayoutInfo(facetData);
        QUERYING.updateFrequencies();
        for (var i = 0; i < facetData.length; i++) {
=======
        svg = root.append("svg").attr("id", "facetScape").attr("width", svgWidth).attr("height", svgHeight);
        spareArea = svg.append("svg:g").attr("id", "spareArea").attr("width", widthSpare).attr("height", svgHeight);
        spareArea.append("svg:rect").attr("class", "spareArea").attr("x", width).attr("y", 0).attr("width", widthSpare).attr("height", svgHeight);
        createRadialGradients();
        voronoi = VoronoiPartitioner([[0, 0], [width, svgHeight]]);
        facetCentroids = FSLayoutUniform();
        for (var i = 0; i < facetCentroids.length; i++) {
            facetWeights.push((1.0 / facetCentroids.length) * 200);
        }
        facetPolygons = voronoi.layout(facetCentroids, facetWeights);
        facetData = DATA.createFacetData(facets, facetCentroids, facetPolygons, facetWeights);
        svg.selectAll("g.facetGroup").data(facetData).enter().append("g").attr("class", "facetGroup").attr("id", function(d) {
            return d.name;
        });
        DATA.enrichWithLayoutInfo(facetData);
        QUERYING.updateFrequencies();
        for (var i = 0; i < facetData.length; i++) {
>>>>>>> origin/master
            TAGLAYOUT.cloudLayout(facetData[i]);
        }
        RENDERING.drawVoronoi();
        RENDERING.drawTagCloud();

        FSResultLayout();
    }

    facetScapeObject.Interaction = INTERACTION;
    facetScapeObject.Data = DATA;
    facetScapeObject.Querying = QUERYING;
    facetScapeObject.Rendering = RENDERING;

    facetScapeObject.draw = function(terms, facetData, resultData) {
        d3.select("div#RS_Panel").remove();
        d3.select("svg#facetScape").remove();
        d3.select("div#RS_ResultList").remove();
<<<<<<< HEAD
        d3.select("div#loader").remove();
        d3.select("p#moreHint").remove();
=======
        d3.select("div#loader").remove();
        d3.select("p#moreHint").remove();
>>>>>>> origin/master
        facetScape(root, svgWidth, height, facetData, resultData, terms);
    }

    return facetScapeObject;
}
