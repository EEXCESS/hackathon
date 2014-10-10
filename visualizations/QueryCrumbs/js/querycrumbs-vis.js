function display_querycrumbs(domElem) {

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
    var width = QueryCrumbsConfiguration.dimensions.HISTORY_LENGTH * (QueryCrumbsConfiguration.dimensions.rectWidth + QueryCrumbsConfiguration.dimensions.edgeWidth) - QueryCrumbsConfiguration.dimensions.edgeWidth + 5;
    var height = QueryCrumbsConfiguration.dimensions.rectHeight + QueryCrumbsConfiguration.dimensions.rectInfoVertPadding + QueryCrumbsConfiguration.dimensions.edgeInfoVertPadding;

    var svgContainer = domElem.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "queryCrumbs-svg");

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
            EEXCESS.messaging.callBG({method: {parent: 'model', func: 'query'}, data: {reason:'queryCrumbs',terms:weightedTerms}});
        },
        onMouseOverNode: function(d, i) {
            
            
            if(QueryCrumbsConfiguration.nodeForm == "SQUARE") {
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
                var ttX = d.x_pos - QueryCrumbsConfiguration.dimensions.rectBorderWidth;
                ttX = (ttX + w > width) ? width - w - (2 * QueryCrumbsConfiguration.dimensions.rectBorderWidth): ttX - (2 * QueryCrumbsConfiguration.dimensions.rectBorderWidth);
                ttX = (ttX < 0) ? 0 : ttX;
                infoBox.select("text.nodeInfo").attr("x", ttX + 1);

                infoBox.append("rect")
                    .attr("class", "nodeBg")
                    .attr("x", ttX + 1)
                    .attr("y", d.y_pos - QueryCrumbsConfiguration.dimensions.rectInfoVertPadding)
                    .attr("width", w)
                    .attr("height", h)
                    .style("fill", d.base_color)

                $("rect.nodeBg").insertBefore(jqNode);


                if(QueryCrumbsConfiguration.skillLevel == "EXPERT") {
                    simResults = [];
                    var rootGroup = d3.select(this.parentNode);
                    var iDocs = CORE.collectIdenticalDocs(i);
                    for(var n in iDocs) {
                        var docRects = rootGroup.selectAll("g.queryNode")
                            .filter(function(d,i) { return (d.timestamp == visualData.visualDataNodes[n].timestamp);})
                            .select("g").selectAll("rect.docNode")
                            .filter(function(d,i) { return (iDocs[n].indexOf(i) != -1);});
                        simResults.push(docRects);
                        docRects.classed("docNode", true).classed("docNode-highlighted", true).style("opacity", 1);
                    }
                }
            } else {

                var infoBox = svgContainer.select("g").append("g").attr("class", "infoBoxNode");
                d3.select(this).select("rect.queryRectBg").classed("queryRectBg", true).classed("queryRectBgHovered", true).style("cursor","pointer");

                infoBox.append("text")
                    .text(d.query.toString())
                    .attr("class", "nodeInfo")
                    .attr("text-anchor", "start")
                    .attr("x", d.x_pos)
                    .attr("y", d.y_pos)
                    .attr("dy", 10);
                var jqNode = $("g text.nodeInfo");
                    var w = jqNode.width();
                    var h = jqNode.height();
                    var ttX = d.x_pos;
                    ttX = (ttX + w > width) ? width - w - (2 * QueryCrumbsConfiguration.dimensions.rectBorderWidth): ttX - (2 * QueryCrumbsConfiguration.dimensions.rectBorderWidth);
                    if(ttX < 0) {
                        ttX = 5;
                    }
                    infoBox.select("text.nodeInfo").attr("x", ttX + QueryCrumbsConfiguration.dimensions.circle_r);

                    infoBox.append("rect")
                        .attr("class", "nodeBg")
                        .attr("x", ttX + QueryCrumbsConfiguration.dimensions.circle_r)
                        .attr("y", d.y_pos)
                        .attr("width", w)
                        .attr("height", h)
                        .style("fill", d.base_color)

                    $("rect.nodeBg").insertBefore(jqNode);

                if(QueryCrumbsConfiguration.skillLevel == "EXPERT") {
                    simResults = [];
                    var rootGroup = d3.select(this.parentNode);
                    var iDocs = CORE.collectIdenticalDocs(i);
                    for(var n in iDocs) {
                        var queryNode = rootGroup.selectAll("g.queryNode")
                            .filter(function(d,i) { return (d.timestamp == visualData.visualDataNodes[n].timestamp);})
                            .select("g").selectAll("path.docNode")
                            .filter(function(d,i) { return (iDocs[n].indexOf(i) != -1);});
                        simResults.push(queryNode);
                        queryNode.classed("docNode", true).classed("docNode-highlighted", true).style("opacity", 1);
                    }   
                }
            }
        },
        onMouseOutNode: function(d) {
            svgContainer.selectAll("g.infoBoxNode").remove();
            if(QueryCrumbsConfiguration.nodeForm == "SQUARE") {
                d3.select(this).select("rect.queryRectBg").classed("queryRectBg", true).classed("queryRectBgHovered", false).style("cursor",null);
                for(var n in simResults) {
                    simResults[n].classed("docNode", true).classed("docNode-highlighted", false)
                        .style("opacity", function(d) { return ((d.preIdx == -1) ? QueryCrumbsConfiguration.colorSettings.newDocOpacity : QueryCrumbsConfiguration.colorSettings.oldDocOpacity);});
                } 
            } else {
                d3.select(this).select("circle.queryCircleBg").classed("queryCircleBg", true).classed("queryCircleBgHovered", false).style("cursor",null);
                for(var n in simResults) {
                    simResults[n].classed("docNode", true).classed("docNode-highlighted", false)
                        .style("opacity", function(d) { return ((d.preIdx == -1) ? QueryCrumbsConfiguration.colorSettings.newDocOpacity : QueryCrumbsConfiguration.colorSettings.oldDocOpacity);});
                } 
          }
          
          simResults = [];
        }
        // ,
        // onMouseOverEdge: function(d, i) {

        //     RENDERING.createGradient(d.baseColorStart, d.baseColorEnd);
        //     d3.select(this).style("fill", "url(#gradient)").style("opacity", 1.0);

        //     var infoBox = svgContainer.select("g").append("g").attr("class", "infoBoxEdge");

        //     infoBox.append("text")
        //         .text(d.diffTerms.toString())
        //         .attr("class", "edgeInfo")
        //         .attr("x", d.end_x)
        //         .attr("y", d.end_y);
        //     var jqNode = $("g text.edgeInfo");
        //     var w = jqNode.width();
        //     var h = jqNode.height();
        //     var ttX = d.end_x - w / 2 - QueryCrumbsConfiguration.dimensions.edgeWidth / 2;
        //     ttX = (ttX + w > width) ? width - w - 2: ttX;
        //     ttX = (ttX < 0) ? 0 : ttX;
        //     infoBox.select("text.edgeInfo").attr("x", ttX).attr("y", d.end_y + QueryCrumbsConfiguration.dimensions.edgeInfoVertPadding + 4/5 * h);

        //     infoBox.append("rect")
        //         .attr("class", "edgeBg")
        //         .attr("x", ttX)
        //         .attr("y", d.end_y + QueryCrumbsConfiguration.dimensions.edgeInfoVertPadding)
        //         .attr("width", w)
        //         .attr("height", h)
        //         .style("fill", "url(#gradient)")
        //     $("rect.edgeBg").insertBefore(jqNode);
        // },
        // onMouseOutEdge: function(d) {
        //     d3.select(this).style("fill", null).style("opacity", function(d) { return d.simTerms;});
        //     svgContainer.selectAll("g.infoBoxEdge").remove();
        //     RENDERING.removeGradient();
        // }
    };

    /*
        There are two ways for the QueryCrumbs visualization to obtain data. One is to load the user's query history
        from the IndexedDB. This is what we do initially when QueryCrumbs are generated. The second one is to listen to
        queries that are issued from the EEXCESS extension.
     */
    var QUERYING = {
        loadDataFromIndexedDB: function() {
            EEXCESS.storage.loadQueryCrumbsData(QueryCrumbsConfiguration.dimensions.HISTORY_LENGTH, init);
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
                        if(currentIdx == QueryCrumbsConfiguration.dimensions.HISTORY_LENGTH-1) {
                            historyData.splice(-QueryCrumbsConfiguration.dimensions.HISTORY_LENGTH,1);
                            BaseColorManager.currentFirstBaseColor = visualData.visualDataNodes[1].base_color;
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
                vNode.base_color = (visualDataNodes[nodeIdx-1]) ? BaseColorManager.getColor(visualDataNodes[nodeIdx-1].base_color, vNode.sim) : BaseColorManager.getFirstColor();
                vNode.x_pos = nodeIdx * (QueryCrumbsConfiguration.dimensions.rectWidth + QueryCrumbsConfiguration.dimensions.edgeWidth);
                vNode.y_pos = 0;
                vNode.width = QueryCrumbsConfiguration.dimensions.rectWidth;
                vNode.height = QueryCrumbsConfiguration.dimensions.rectHeight;
                vNode.results = [];
                for(var docIdx = 0; docIdx < QueryCrumbsConfiguration.dimensions.DENSE_PIXELS; docIdx++) {
                    var vDoc = {};
                    vDoc.index = docIdx;
                    vDoc.x_pos = vNode.x_pos + (docIdx % QueryCrumbsConfiguration.dimensions.docRectHorizontal) * QueryCrumbsConfiguration.dimensions.docRectWidth;
                    vDoc.y_pos = vNode.y_pos + Math.floor(docIdx / QueryCrumbsConfiguration.dimensions.docRectVertical) * QueryCrumbsConfiguration.dimensions.docRectHeight;
                    vDoc.width = QueryCrumbsConfiguration.dimensions.docRectWidth;
                    vDoc.height = QueryCrumbsConfiguration.dimensions.docRectHeight;
                    // Beginners see only the base colors
                    if(QueryCrumbsConfiguration.skillLevel == "BEGINNER") {
                        vDoc.sim = 1;
                        vDoc.preIdx = -1;
                    } else if(QueryCrumbsConfiguration.skillLevel == "EXPERT"){
                        vDoc.sim = (similarities[nodeIdx].rsSimScore.recurrence[docIdx] == -1) ? 1 : 0;
                        vDoc.preIdx = (typeof similarities[nodeIdx].rsSimScore.recurrence[docIdx] != "undefined") ? similarities[nodeIdx].rsSimScore.recurrence[docIdx] : -1;
                    }
                    
                    vDoc.uri = (history[nodeIdx].results[docIdx]) ? history[nodeIdx].results[docIdx].uri : "";
                    vNode.results.push(vDoc);
                }
                visualDataNodes.push(vNode);
                if(nodeIdx > 0) {
                    var vEdge = {};
                    vEdge.start_x = vNode.x_pos - QueryCrumbsConfiguration.dimensions.edgeWidth;
                    vEdge.start_y = QueryCrumbsConfiguration.dimensions.rectHeight / 2 - QueryCrumbsConfiguration.dimensions.edgeHeight / 2;
                    vEdge.end_x = vNode.x_pos;
                    vEdge.end_y = QueryCrumbsConfiguration.dimensions.rectHeight / 2 - QueryCrumbsConfiguration.dimensions.edgeHeight / 2;
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
            svgContainer.selectAll("g.crumbs").selectAll("*").remove();

            var crumbsSel = svgContainer.selectAll("g.crumbs").data([visualData]);
            crumbsSel.enter().append("g").attr("class", "crumbs");

            if(QueryCrumbsConfiguration.nodeForm == "CIRCLE") {
                

                var crumbsUpd = crumbsSel.attr("transform", "translate(-15, 10)");
                crumbsSel.exit().remove();

                var queryNodesSel = crumbsUpd.selectAll("g.queryNode").data(function(d) { return d.visualDataNodes; }, function(d) { return d.timestamp;});
                var nodeEnter = queryNodesSel.enter().append("g");

                queryNodesSel.classed("queryNode", true)
                    .on("mouseenter", INTERACTION.onMouseOverNode)
                    .on("mouseleave", INTERACTION.onMouseOutNode)
                    .on("click", INTERACTION.onClick);

                nodeEnter.append("circle").attr("class", "queryCircleBg").attr({
                    cx: QueryCrumbsConfiguration.dimensions.circle_cxy,
                    cy: QueryCrumbsConfiguration.dimensions.circle_cxy,
                    r:  function(d,i) { return (i == currentIdx) ? QueryCrumbsConfiguration.dimensions.circle_bg_r + 1 : QueryCrumbsConfiguration.dimensions.circle_bg_r }
                }).classed("queryRectBg-selected", function(d,i) { return (i == currentIdx);});


                nodeEnter.append("circle").attr("class", "queryCircle").attr({
                    cx: QueryCrumbsConfiguration.dimensions.circle_cxy,
                    cy: QueryCrumbsConfiguration.dimensions.circle_cxy,
                    r:  QueryCrumbsConfiguration.dimensions.circle_r
                });      

                nodeEnter.append("g");

                queryNodesSel.select("circle.queryCircle")
                    .attr("x", function (d) { return d.x_pos; })
                    .attr("y", function (d) { return d.y_pos; } )
                    .style("fill", function (d) { return d.base_color; })
                    .classed("queryCircle", true);

                nodeEnter.transition().attr("transform", function(d,i) { return ("translate("+ (d.x_pos + 2 ) +", 0)"); }); 


                var arc = d3.svg.arc().outerRadius(QueryCrumbsConfiguration.dimensions.circle_r);

                queryNodesSel.select("g").attr("transform", function(d,i) { return ("translate(25, 25)"); });

                var queryDocRects = queryNodesSel.select("g").selectAll("path.docNode").data(function(d) { return d.results; });

                var p = Math.PI * 2;

                var arc = d3.svg.arc()
                    .innerRadius(0)
                    .outerRadius(QueryCrumbsConfiguration.dimensions.circle_r)
                    .startAngle(function(d) { 
                        return ((360 / 16) * (Math.PI / 180)) * d.index;     
                    })
                    .endAngle(function(d) {
                       return ((360 / 16) * (Math.PI / 180)) * (d.index + 1);
                    }) 

                queryDocRects.enter().append("path").attr("d", arc);
                queryDocRects.attr("class", "docNode")
                    .attr("d", arc)
                    .style("opacity", function(d) { return ((d.preIdx == -1) ? QueryCrumbsConfiguration.colorSettings.newDocOpacity : QueryCrumbsConfiguration.colorSettings.oldDocOpacity);});

            } else {

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
                      var lOffset = QueryCrumbsConfiguration.dimensions.edgeWidth + QueryCrumbsConfiguration.dimensions.rectWidth;
                      return ("translate("+parseInt(-lOffset)+", 0)");
                  }
                });

                queryNodesSel.select("rect.queryRectBg")
                  .attr("x", function (d, i) { 
                      return (i == currentIdx) ? (d.x_pos - QueryCrumbsConfiguration.dimensions.rectBorderWidth) : d.x_pos - QueryCrumbsConfiguration.dimensions.rectBorderWidth + 1;
                  })
                  .attr("y", function (d, i) { 
                      return (i == currentIdx) ? (d.y_pos - QueryCrumbsConfiguration.dimensions.rectBorderWidth) : d.y_pos - QueryCrumbsConfiguration.dimensions.rectBorderWidth + 1; 
                  })
                  .attr("width", function (d, i) { 
                      return (i == currentIdx) ? (d.width + 2 * QueryCrumbsConfiguration.dimensions.rectBorderWidth) : d.width + 2 * QueryCrumbsConfiguration.dimensions.rectBorderWidth - 2; 
                  })
                  .attr("height", function (d, i) { 
                      return (i == currentIdx) ? (d.height + 2 * QueryCrumbsConfiguration.dimensions.rectBorderWidth) : d.height + 2 * QueryCrumbsConfiguration.dimensions.rectBorderWidth - 2; 
                  })
                  .attr("ry", 0)
                  .classed("queryRectBg", true)
                  .classed("queryRectBg-selected", function(d,i) { return (i == currentIdx);});

                queryNodesSel.select("rect.queryRect").attr("x", function (d) { return d.x_pos; })
                  .attr("y", function (d) { return d.y_pos; } )
                  .attr("width", function (d) { return d.width; })
                  .attr("height", function (d) { return d.height; })
                  .attr("ry", 0)
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
                  .style("opacity", function(d) { return ((d.preIdx == -1) ? QueryCrumbsConfiguration.colorSettings.newDocOpacity : QueryCrumbsConfiguration.colorSettings.oldDocOpacity);});

                // var queryEdgesSel = crumbsUpd.selectAll("rect.queryEdge").data(function(d) { return d.visualDataEdges;});
                // var queryEdgesEnter = queryEdgesSel.enter()
                //   .append("rect")
                //   .attr("class", "queryEdge")
                //   .on("mouseover", INTERACTION.onMouseOverEdge)
                //   .on("mouseout", INTERACTION.onMouseOutEdge);

                // queryEdgesSel.exit().transition().style("opacity", 0).attr("transform", function(d,i) { if(fWait_BackNaviResults) { return "translate(0,0)"; } else { return ("translate(0, 100)");}}).remove();

                // queryEdgesSel.attr("x",function (d) { return d.start_x; } )
                //   .attr("y",function (d) { return d.start_y; } )
                //   .attr("width", QueryCrumbsConfiguration.dimensions.edgeWidth )
                //   .attr("height", QueryCrumbsConfiguration.dimensions.edgeHeight)
                //   .style("opacity", function(d) { return (QueryCrumbsConfiguration.skillLevel == "BEGINNER") ? 0 : d.simTerms;});  
            } 
            

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
            nodesToFadeOut.transition()
                .delay(0)
                .duration(500)
                .attr("transform", "translate(0, 100)")
                .style("opacity", 0)
                .each("end",function() {
                    d3.select(this).remove();
                });

            // var edgesToFadeOut = svgContainer.selectAll("rect.queryEdge").filter(function(d,i) { return (i >= currIdx);});

            // edgesToFadeOut.transition()
            //     .delay(0)
            //     .duration(500)
            //     .attr("transform", "translate(0,100)")
            //     .style("opacity", 0)
            //     .each("end", function() {
            //         d3.select(this).remove;
            //     });
        }
    };

    EEXCESS.messaging.listener(QUERYING.SearchTriggeredListener);

    function init(data) {
        historyData = data.reverse();
        currentIdx = historyData.length-1;
        currentNode = historyData[currentIdx];
        similarities = CORE.calculateSimilarities(historyData);
        visualData = CORE.generateVisualData(historyData, similarities);
        RENDERING.redraw(visualData);
    };
    
}
