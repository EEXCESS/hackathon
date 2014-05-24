function display_querycrumbs(domElem) {

    // Query Crumbs dimensions
    var HISTORY_LENGTH = 11;
    var DENSE_PIXELS = 16;
    var rectHeight = 20;
    var rectWidth = 20;
    var docRectHorizontal = 4;
    var docRectVertical = 4;
    var docRectHeight = rectHeight / docRectVertical;
    var docRectWidth = rectWidth / docRectHorizontal;

    var edgeWidth = 10;
    var edgeHeight = 10;

    // node border and padding of additional info on mouse over
    var rectBorderWidth = 2;
    var rectInfoVertPadding = 15;
    var edgeInfoVertPadding = 17;

    // params for color-coded similarity
    var newDocOpacity = 0.1;
    var oldDocOpacity = 0.5;
    // if similarity of a node exceeds this threshold it gets the same color
    var color_threshold = 0.1;

    // A list of the HISTORY_LENGTH recent queries
    var historyData = [];
    // A list of similarities of one node to its predecessor
    var similarities = [];
    // The main data object for visualization. Holding queries, positional information and similarities. This is what we need to redraw when new queries are issued.
    var visualData = {};

    // Reference to the currently selected query node
    var currentNode = null;
    var currentIdx = 0;

    // A flag indicating that a user clicked on a recent query node. Thus, no new query node is append to the QueryCrumbs.
    var fWait_BackNaviResults = false;

    // Temporarily stores the result documents which are identical to those of the currently hovered node.
    var simResults = [];

    // The dimension of the svg panel
    var width = HISTORY_LENGTH * (rectWidth + edgeWidth) - edgeWidth + 4;
    var height = rectHeight + rectInfoVertPadding + edgeInfoVertPadding;

    var svgContainer = domElem.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "queryCrumbs-svg");

    /*
        Several basic distinct colors can be defined here. When appending a new node to the QueryCrumbs, we assign
        one of these colors to the node. If the similarity of the new node compared to the previous node is below a
        certain threshold 'color_threshold', we assign the color which comes next in this list to the new node. Otherwise
        the new node gets the same color as the previous nod.
     */
    var BaseColors = {
        current: 0,
        currentFirstBaseColor: null,
        base_colors: [
            d3.rgb("hsl(240,50%,50%)"),  // blue
            d3.rgb("hsl(0,50%, 50%)"),   // red
            d3.rgb("hsl(180,50%, 50%)"), // cyan
            d3.rgb("hsl(30,50%, 50%)"),  // orange
            d3.rgb("hsl(120,50%, 50%)") // green
        ],
        getColor: function(preNodeColor, similarity) {
            if(preNodeColor) {
                if(similarity > color_threshold) {
                    return preNodeColor;
                } else {
                    var cIdx = (BaseColors.base_colors.indexOf(preNodeColor) + 1) % BaseColors.base_colors.length;
                    return BaseColors.base_colors[cIdx];
                }
            } else {
                return BaseColors.base_colors[0];
            }
        },
        getFirstColor: function() {
            if(BaseColors.currentFirstBaseColor) {
                return BaseColors.currentFirstBaseColor;
            } else {
                return BaseColors.base_colors[0];
            }
        }
    };

    var INTERACTION = {
        onClick: function(d, i) {

            // TODO: log backnavigation
            var termsOfPreviouslyVisitedNode = currentNode.query;
            // end

            var weightedTerms = [];
            for(var term in d.query) {
                var weightedTerm = {
                    text: d.query[term],
                    weight: 1
                }
                weightedTerms.push(weightedTerm);
            }
            currentNode = d;
            currentIdx = i;

            fWait_BackNaviResults = true;

            // TODO: log nacknavigation
            var termsOfCurrentNode = d.query;
            // end

            EEXCESS.searchResults.loading();
            EEXCESS.callBG({method: {parent: 'model', func: 'query'}, data: weightedTerms});
        },
        onMouseOverNode: function(d, i) {
            var infoBox = svgContainer.select("g").append("g").attr("class", "infoBoxNode");
            d3.select(this).select("rect.queryRectBg").classed("queryRectBg", true).classed("queryRectBgHovered", true).style("cursor","pointer");
            infoBox.append("text")
                .text(d.query.toString())
                .attr("class", "nodeInfo")
                .attr("text-anchor", "start")
                .attr("x", d.x_pos)
                .attr("y", d.y_pos)
                .attr("dy", -5);
            var jqNode = $("g text.nodeInfo");
            var w = jqNode.width();
            var h = jqNode.height();
            var ttX = d.x_pos - rectBorderWidth;
            ttX = (ttX + w > width) ? width - w - (2 * rectBorderWidth): ttX - (2 * rectBorderWidth);
            ttX = (ttX < 0) ? 0 : ttX;
            infoBox.select("text.nodeInfo").attr("x", ttX);
            infoBox.append("rect")
                .attr("class", "nodeBg")
                .attr("x", ttX)
                .attr("y", d.y_pos - rectInfoVertPadding)
                .attr("width", w)
                .attr("height", h)
                .style("fill", d.base_color)
            $("rect.nodeBg").insertBefore(jqNode);

            simResults = [];
            var rootGroup = d3.select(this.parentNode);
            var iDocs = CORE.collectIdenticalDocs(i);
            for(var n in iDocs) {
                var docRects = rootGroup.selectAll("g.queryNode").filter(function(d,i) { return (d.timestamp == visualData.visualDataNodes[n].timestamp);}).select("g").selectAll("rect.docNode").filter(function(d,i) { return (iDocs[n].indexOf(i) != -1);});
                simResults.push(docRects);
                docRects.classed("docNode", true).classed("docNode-highlighted", true).style("opacity", 1);
            }
        },
        onMouseOutNode: function(d) {
            svgContainer.selectAll("g.infoBoxNode").remove();
            d3.select(this).select("rect.queryRectBg").classed("queryRectBg", true).classed("queryRectBgHovered", false).style("cursor",null);
            for(var n in simResults) {
                simResults[n].classed("docNode", true).classed("docNode-highlighted", false)
                    .style("opacity", function(d) { return ((d.preIdx == -1) ? newDocOpacity : oldDocOpacity);});
            }
            simResults = [];
        },
        onMouseOverEdge: function(d, i) {

            RENDERING.createGradient(d.baseColorStart, d.baseColorEnd);
            d3.select(this).style("fill", "url(#gradient)").style("opacity", 1.0);

            var infoBox = svgContainer.select("g").append("g").attr("class", "infoBoxEdge");

            infoBox.append("text")
                .text(d.diffTerms.toString())
                .attr("class", "edgeInfo")
                .attr("x", d.end_x)
                .attr("y", d.end_y);
            var jqNode = $("g text.edgeInfo");
            var w = jqNode.width();
            var h = jqNode.height();
            var ttX = d.end_x - w / 2 - edgeWidth / 2;
            ttX = (ttX + w > width) ? width - w - 2: ttX;
            ttX = (ttX < 0) ? 0 : ttX;
            infoBox.select("text.edgeInfo").attr("x", ttX).attr("y", d.end_y + edgeInfoVertPadding + 4/5 * h);

            infoBox.append("rect")
                .attr("class", "edgeBg")
                .attr("x", ttX)
                .attr("y", d.end_y + edgeInfoVertPadding)
                .attr("width", w)
                .attr("height", h)
                .style("fill", "url(#gradient)")
            $("rect.edgeBg").insertBefore(jqNode);
        },
        onMouseOutEdge: function(d) {
            d3.select(this).style("fill", null).style("opacity", function(d) { return d.simTerms;});
            svgContainer.selectAll("g.infoBoxEdge").remove();
            RENDERING.removeGradient();
        }
    };

    /*
        There are two ways for the QueryCrumbs visualization to obtain data. One is to load the user's query history
        from the IndexedDB. This is what we do initially when QueryCrumbs are generated. The second one is to listen to
        queries that are issued from the EEXCESS extension.
     */
    var QUERYING = {
        loadDataFromIndexedDB: function() {
            var queries = [];
            var db;
            var reqDB = indexedDB.open('eexcess_db', 42);
            reqDB.onerror = function(event) {
                console.error("No access to IndexedDB.");
            };
            reqDB.onsuccess = function(event) {

                db = reqDB.result;

                var tx1 = db.transaction("queries")
                var index = tx1.objectStore("queries").index("timestamp");
                var i = 0;

                index.openCursor(null, "prev").onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor && i < HISTORY_LENGTH) {
                        queries.push(cursor.value);
                        i += 1;
                        cursor.continue();
                    }
                }
                tx1.oncomplete = function(event) {

                    var fLoadSuccess = 0;

                    var pushResults = function(q) {
                        queries[q].results = [];
                        var tx_sub = db.transaction("recommendations");
                        var recIndex = tx_sub.objectStore("recommendations").index("query");
                        var queryString = '';
                        queries[q].query.forEach(function(d) { queryString += d.text + ' ';});
                        queryString = queryString.trim();
                        queries[q].query = queryString.split(' ');
                        var singleKeyRange = IDBKeyRange.only(queryString);
                        recIndex.openCursor(singleKeyRange).onsuccess = function(event) {
                            var cursor2 = event.target.result;
                            if (cursor2) {
                                var result = {
                                    title: cursor2.value.result.title,
                                    uri: cursor2.value.result.uri
                                };
                                queries[q].results.push(result);
                                cursor2.continue();
                            }
                        }

                        tx_sub.oncomplete = function(event) {
                            fLoadSuccess += 1;
                            if(fLoadSuccess == queries.length) {
                                init(queries);
                            }
                        }
                    };

                    for(var q = 0; q < queries.length; q++) {
                        pushResults(q);
                    }
                }
            };
        },
        /*
            A callback function for the EEXCESS extension's background script. It gets called each time a query is issued.
            When receiving results, we insert the query as new node immediately after the node that is currently
            selected ('currentNode') and remove all subsequent nodes.
         */
        SearchTriggeredListener: function(request, sender, sendResponse) {
            if (request.method === 'newSearchTriggered') {
                if(historyData.length == 0) {
                    QUERYING.loadDataFromIndexedDB();
                } else {
                    var latestNode = {
                        query: request.data.query.split(" "),
                        timestamp: new Date().getTime(),
                        results: []
                    }
                    for(var r in request.data.results.results) {
                        latestNode.results.push({
                            title: request.data.results.results[r].title,
                            uri: request.data.results.results[r].uri
                        });
                    }

                    currentNode = latestNode;
                    if(fWait_BackNaviResults) {
                        currentNode = latestNode;
                        historyData[currentIdx] = currentNode;
                    } else {
                        if(currentIdx == HISTORY_LENGTH-1) {
                            historyData.splice(-HISTORY_LENGTH,1);
                            BaseColors.currentFirstBaseColor = visualData.visualDataNodes[1].base_color;
                        } else {
                            currentIdx += 1;
                            historyData = historyData.splice(0, currentIdx);
                        }
                        historyData.push(latestNode);
                    }

                    similarities = CORE.calculateSimilarities(historyData);
                    visualData = CORE.generateVisualData(historyData, similarities);
                    RENDERING.redraw(visualData);

                    fWait_BackNaviResults = false;
                }
            }
        }
    };

    /*
        The CORE component contains any methods related to transforming the input data into a data object that can be visualized
        directly with D3.
     */
    var CORE = {
        /*
            Calculates the similarities between nodes and returns a list of similarity-objects of length HISTORY_LENGTH
            each of which contains information on how similar node i is compared to node i-1.
        */
        calculateSimilarities: function(history) {
            var sims = [];
            for(var i = 0; i < history.length; i++) {
                var rsSimilarity, qSimilarity;
                var preResults = [], preQuery = [];
                if((i-1) < 0) {
                    preResults = [];
                    preQuery = [];
                } else {
                    preResults = history[i-1].results;
                    preQuery = history[i-1].query;
                }

                rsSimilarity = CORE.calcResultSetSimilarity(preResults, history[i].results);
                qSimilarity = CORE.calcQueryTermSimilarity(preQuery, history[i].query);

                var similarity = {
                    rsSimScore: rsSimilarity,
                    qSimScore: qSimilarity
                }
                sims.push(similarity);
            }
            return sims;
        },
        /*
            A simple heuristic to determine how similar two queries (nodes) are based on the number of results they
            have in common. Returns the score [0,1] and a list of indices 'recurrence' referring to the indices of the results of
            the preceding node. If a result of the current node has already appeared at position j in the result list of the preceding
            node, 'recurrence' contains an element j. If a result didn't show up before, 'recurrence' contains the value
            -1 at that position.
         */
        calcResultSetSimilarity: function(predecessor, current) {
            var sim = 0;
            var recurrence = [];
            for(var i = 0; i < current.length; i++) {
                var docAlreadyKnown = false;
                var docAlreadyKnownIdx = -1;
                for(var j = 0; j < predecessor.length; j++) {
                    if(current[i].uri == predecessor[j].uri) {
                        sim++;
                        docAlreadyKnown = true;
                        docAlreadyKnownIdx = j;
                        break;
                    }
                }

                recurrence.push(docAlreadyKnownIdx);
            }
            return {sim: sim/current.length, recurrence: recurrence};
        },
        /*
            A simple heuristic to determine the similarity of two queries (nodes) based on the number of query terms
            they have in common. Returns the score [0,1] and a delta 'diff' containing the terms of both queries that
            are not in the intersection of both sets of query terms.
            (List of query terms Q1, Q2. Then 'diff' = (Q1 OR Q2)\(Q1 AND Q2) )
         */
        calcQueryTermSimilarity: function(predecessor, current) {
            var sim = 0;
            var intersectWords = [];
            var differenceWords = [];
            for(var term1 in predecessor) {
                if(current.indexOf(predecessor[term1]) != -1) {
                    intersectWords.push(predecessor[term1]);
                    sim++;
                } else {
                    differenceWords.push(predecessor[term1]);
                }
            }
            for(var term2 in current) {
                if(predecessor.indexOf(current[term2]) == -1) {
                    differenceWords.push(current[term2]);
                }
            }
            return {sim: sim / (intersectWords.length + differenceWords.length), diff: differenceWords};
        },
        /*
            Generates the main data object for visualization from the input data 'history' and the calculated
            similarities 'similarities' and enriches it with positional and graphical information.
         */
        generateVisualData: function(history, similarities) {
            var visualDataNodes = [];
            var visualDataEdges = [];
            for(var nodeIdx = 0; nodeIdx < history.length; nodeIdx++) {
                var vNode = {};
                vNode.query = history[nodeIdx].query;
                vNode.timestamp = history[nodeIdx].timestamp;
                vNode.sim = similarities[nodeIdx].rsSimScore.sim;
                vNode.base_color = (visualDataNodes[nodeIdx-1]) ? BaseColors.getColor(visualDataNodes[nodeIdx-1].base_color, vNode.sim) : BaseColors.getFirstColor();
                vNode.x_pos = nodeIdx * (rectWidth + edgeWidth);
                vNode.y_pos = 0;
                vNode.width = rectWidth;
                vNode.height = rectHeight;
                vNode.results = [];
                for(var docIdx = 0; docIdx < DENSE_PIXELS; docIdx++) {
                    var vDoc = {};
                    vDoc.x_pos = vNode.x_pos + (docIdx % docRectHorizontal) * docRectWidth;
                    vDoc.y_pos = vNode.y_pos + Math.floor(docIdx / docRectVertical) * docRectHeight;
                    vDoc.width = docRectWidth;
                    vDoc.height = docRectHeight;
                    vDoc.sim = (similarities[nodeIdx].rsSimScore.recurrence[docIdx] == -1) ? 1 : 0;
                    vDoc.preIdx = (typeof similarities[nodeIdx].rsSimScore.recurrence[docIdx] != "undefined") ? similarities[nodeIdx].rsSimScore.recurrence[docIdx] : -1;
                    vDoc.uri = (history[nodeIdx].results[docIdx]) ? history[nodeIdx].results[docIdx].uri : "";
                    vNode.results.push(vDoc);
                }
                visualDataNodes.push(vNode);
                if(nodeIdx > 0) {
                    var vEdge = {};
                    vEdge.start_x = vNode.x_pos - edgeWidth;
                    vEdge.start_y = rectHeight / 2 - edgeHeight / 2;
                    vEdge.end_x = vNode.x_pos;
                    vEdge.end_y = rectHeight / 2 - edgeHeight / 2;
                    vEdge.diffTerms = similarities[nodeIdx].qSimScore.diff;
                    vEdge.simTerms = similarities[nodeIdx].qSimScore.sim;
                    vEdge.simResults = similarities[nodeIdx].rsSimScore.sim;
                    vEdge.baseColorStart = visualDataNodes[nodeIdx-1].base_color;
                    vEdge.baseColorEnd = visualDataNodes[nodeIdx].base_color;
                    visualDataEdges.push(vEdge);
                }
            }
            return {visualDataNodes: visualDataNodes, visualDataEdges: visualDataEdges};
        },
        /*
            This method returns a 2-dim list of indices referring to results that are identical to those of a given
            reference node 'refNodeIdx'.
         */
        collectIdenticalDocs: function(refNodeIdx) {

            var sims = [];
            for(var node = 0; node < historyData.length; node++) {
                var nodeSims = [];
                for(var r = 0; r < historyData[refNodeIdx].results.length; r++) {
                    for(var rn = 0; rn < historyData[node].results.length; rn++) {
                        if(historyData[refNodeIdx].results[r].uri == historyData[node].results[rn].uri) {
                            nodeSims.push(rn);
                        }
                    }
                }
                sims.push(nodeSims);
            }
            return sims;
        }
    };

    var RENDERING = {
        createGradient: function(color1, color2) {
            var defs = svgContainer.append("svg:defs");
            var gradient = defs.append("svg:linearGradient")
                .attr("id", "gradient")
                .attr("x1", "0%")
                .attr("y1", "50%")
                .attr("x2", "100%")
                .attr("y2", "50%")
                .attr("spreadMethod", "pad");

            gradient.append("svg:stop")
                .attr("offset", "0%")
                .attr("stop-color", color1)
                .attr("stop-opacity", 0.8);

            gradient.append("svg:stop")
                .attr("offset", "100%")
                .attr("stop-color", color2)
                .attr("stop-opacity", 0.8);
        },
        removeGradient: function() {
            d3.select("svg defs").remove();
        },
        redraw: function(visualData) {

            var crumbsSel = svgContainer.selectAll("g.crumbs").data([visualData]);
            crumbsSel.enter().append("g").attr("class", "crumbs");
            var crumbsUpd = crumbsSel.attr("transform", "translate(2, "+15+")");
            crumbsSel.exit().remove();

            var queryNodesSel = crumbsUpd.selectAll("g.queryNode").data(function(d) { return d.visualDataNodes; }, function(d) { return d.timestamp;});
            var nodeEnter = queryNodesSel.enter().append("g");
            queryNodesSel.classed("queryNode", true)
                .on("mouseenter", INTERACTION.onMouseOverNode)
                .on("mouseleave", INTERACTION.onMouseOutNode)
                .on("click", INTERACTION.onClick);
            nodeEnter.append("rect").attr("class", "queryRectBg");
            nodeEnter.append("rect").attr("class", "queryRect");
            nodeEnter.append("g");
            queryNodesSel.exit().transition().style("opacity", 0).attr("transform", function(d,i) { if(fWait_BackNaviResults) { return "translate(0,0)"; } else { return ("translate(0, 100)");}}).remove();
            nodeEnter.attr("transform", function(d,i) {
                if(fWait_BackNaviResults) {
                    return "translate(0,0)";
                } else {
                    var lOffset = edgeWidth + rectWidth;
                    return ("translate("+parseInt(-lOffset)+", 0)");
                }
            });

            queryNodesSel.select("rect.queryRectBg").attr("x", function (d) { return d.x_pos - rectBorderWidth; })
                .attr("y", function (d) { return d.y_pos - rectBorderWidth; } )
                .attr("width", function (d) { return d.width + 2 * rectBorderWidth; })
                .attr("height", function (d) { return d.height + 2 * rectBorderWidth; })
                .classed("queryRectBg", true)
                .classed("queryRectBg-selected", function(d,i) { return (i == currentIdx);});
            queryNodesSel.select("rect.queryRect").attr("x", function (d) { return d.x_pos; })
                .attr("y", function (d) { return d.y_pos; } )
                .attr("width", function (d) { return d.width; })
                .attr("height", function (d) { return d.height; })
                .style("fill", function (d) { return d.base_color; })
                .classed("queryRect", true);
            nodeEnter.transition().attr("transform", "translate(0,0)");

            var queryDocRects = queryNodesSel.select("g").selectAll("rect.docNode").data(function(d) { return d.results; });
            queryDocRects.enter().append("rect");
            queryDocRects.attr("class", "docNode")
                .attr("x", function(d) { return d.x_pos; })
                .attr("y", function(d) { return d.y_pos; })
                .attr("width", function(d) { return d.width; })
                .attr("height", function(d) { return d.height; })
                .style("opacity", function(d) { return ((d.preIdx == -1) ? newDocOpacity : oldDocOpacity);});

            var queryEdgesSel = crumbsUpd.selectAll("rect.queryEdge").data(function(d) { return d.visualDataEdges;});
            var queryEdgesEnter = queryEdgesSel.enter()
                .append("rect")
                .attr("class", "queryEdge")
                .on("mouseover", INTERACTION.onMouseOverEdge)
                .on("mouseout", INTERACTION.onMouseOutEdge);

            queryEdgesSel.exit().transition().style("opacity", 0).attr("transform", function(d,i) { if(fWait_BackNaviResults) { return "translate(0,0)"; } else { return ("translate(0, 100)");}}).remove();

            queryEdgesSel.attr("x",function (d) { return d.start_x; } )
                .attr("y",function (d) { return d.start_y; } )
                .attr("width", edgeWidth )
                .attr("height", edgeHeight)
                .style("opacity", function(d) { return d.simTerms;});


//            svgContainer.selectAll("g").remove();
//            var group = svgContainer.append("g").attr("transform", "translate(2, "+15+")");
//
//            var queryRects = group.selectAll("g.queryNode")
//                .data(visualData.visualDataNodes);
//
//            queryRects.enter()
//                .append("g")
//                .classed("queryNode", true)
//                .on("mouseenter", INTERACTION.onMouseOverNode)
//                .on("mouseleave", INTERACTION.onMouseOutNode)
//                .on("click", INTERACTION.onClick);
//
//            queryRects.append("rect")
//                .attr("x", function (d) { return d.x_pos - rectBorderWidth; })
//                .attr("y", function (d) { return d.y_pos - rectBorderWidth; } )
//                .attr("width", function (d) { return d.width + 2 * rectBorderWidth; })
//                .attr("height", function (d) { return d.height + 2 * rectBorderWidth; })
//                .classed("queryRectBg", true)
//                .classed("queryRectBg-selected", function(d,i) { return (i == currentIdx);});
//
//            queryRects.append("rect")
//                .attr("x", function (d) { return d.x_pos; })
//                .attr("y", function (d) { return d.y_pos; } )
//                .attr("width", function (d) { return d.width; })
//                .attr("height", function (d) { return d.height; })
//                .style("fill", function (d) { return d.base_color; })
//                .classed("queryRect", true)
//                .append("svg:title")
//                .text(function(d) { return d.query.toString(); });
//
//            var queryDocRects = queryRects.append("g").selectAll("rect").data(function(d) { return d.results; })
//                .enter()
//                .append("rect");
//
//            queryDocRects.attr("class", "docNode")
//                .attr("x", function(d) { return d.x_pos; })
//                .attr("y", function(d) { return d.y_pos; })
//                .attr("width", function(d) { return d.width; })
//                .attr("height", function(d) { return d.height; })
//                .style("opacity", function(d) { return ((d.preIdx == -1) ? newDocOpacity : oldDocOpacity);});
//
//            var queryEdges =  group.selectAll("rect.queryEdge")
//                .data(visualData.visualDataEdges)
//                .enter()
//                .append("rect")
//                .attr("class", "queryEdge")
//                .on("mouseover", INTERACTION.onMouseOverEdge)
//                .on("mouseout", INTERACTION.onMouseOutEdge);
//
//            queryEdges.attr("x",function (d) { return d.start_x; } )
//                .attr("y",function (d) { return d.start_y; } )
//                .attr("width", edgeWidth )
//                .attr("height", edgeHeight)
//                .style("opacity", function(d) { return d.simTerms;});
        },
        transitionTo: function(visualData, currIdx) {
            var nodesToFadeOut = svgContainer.selectAll("g.queryNode").filter(function(d,i) { return (i > currIdx);});
            var edgesToFadeOut = svgContainer.selectAll("rect.queryEdge").filter(function(d,i) { return (i >= currIdx);});
            nodesToFadeOut.transition()
                .delay(0)
                .duration(500)
                .attr("transform", "translate(0, 100)")
                .style("opacity", 0)
                .each("end",function() {
                    d3.select(this).remove();
                });
            edgesToFadeOut.transition()
                .delay(0)
                .duration(500)
                .attr("transform", "translate(0,100)")
                .style("opacity", 0)
                .each("end", function() {
                    d3.select(this).remove;
                });
        }
    };

    EEXCESS.messageListener(QUERYING.SearchTriggeredListener);

    function init(data) {
        historyData = data.reverse();
        currentIdx = historyData.length-1;
        currentNode = historyData[currentIdx];
        similarities = CORE.calculateSimilarities(historyData);
        visualData = CORE.generateVisualData(historyData, similarities);
        RENDERING.redraw(visualData);
    }
}