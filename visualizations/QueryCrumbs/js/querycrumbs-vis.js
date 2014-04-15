function display_querycrumbs(domElem) {

    // Parameters
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

    var rectBorderWidth = 2;
    var rectInfoVertPadding = 15;
    var edgeInfoVertPadding = 17;

    var newDocOpacity = 0.1;
    var oldDocOpacity = 0.5;
    var color_threshold = 0.1;

    var historyData = [];
    var similarities = [];
    var visualData = {};

    var currentNode = null;
    var currentIdx = 0;

    var fWait_BackNaviResults = false;

    var simResults = [];

    var width = HISTORY_LENGTH * (rectWidth + edgeWidth) - edgeWidth + 4;
    var height = rectHeight + rectInfoVertPadding + edgeInfoVertPadding;

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

    EEXCESS.messageListener(
        function(request, sender, sendResponse) {
            if (request.method === 'newSearchTriggered') {
                if(historyData.length == 0) {
                    loadDataFromIndexedDB();
                } else {
                    var latestNode = {
                        query: request.data.query.split(" "),
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
                        fWait_BackNaviResults = false;
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

                    similarities = calculateSimilarities(historyData);
                    visualData = generateVisualData(historyData, similarities);
                    redraw(visualData);
                }
            }
        }
    );

    var svgContainer = domElem.append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id", "queryCrumbs-svg");

    var onClick = function(d, i) {
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
        EEXCESS.searchResults.loading();
        EEXCESS.callBG({method: {parent: 'model', func: 'query'}, data: weightedTerms});
    }

    var onMouseOverEdge = function(d, i) {

        createGradient2(d.baseColorStart, d.baseColorEnd);
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
    }

    var onMouseOutEdge = function(d) {
        d3.select(this).style("fill", null).style("opacity", function(d) { return d.simTerms;});
        svgContainer.selectAll("g.infoBoxEdge").remove();
        removeGradient2();
    }

    var onMouseOverNode = function(d, i) {
        var infoBox = svgContainer.select("g").append("g").attr("class", "infoBoxNode");
        d3.select(this).select("rect.queryRectBg").classed("queryRectBg", true).classed("queryRectBgHovered", true).style("cursor","pointer");//style("stroke", d.base_color).style("stroke-width", "3px").style("stroke-opacity", 0.5).style("cursor", "pointer");
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

        var rootGroup = d3.select(this.parentNode);
        var iDocs = collectIdenticalDocs(i);

        for(var n in iDocs) {
            var docRects = rootGroup.select("g:nth-of-type("+(parseInt(n)+1)+").queryNode").select("g").selectAll("rect.docNode").filter(function(d,i) { return (iDocs[n].indexOf(i) != -1);});
            simResults.push(docRects);
            docRects.style("fill", "black").style("opacity", 1);
        }

    }
    var collectIdenticalDocs = function(refNodeIdx) {

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

    var onMouseOutNode = function(d) {
        svgContainer.selectAll("g.infoBoxNode").remove();
        d3.select(this).select("rect.queryRectBg").classed("queryRectBg", true).classed("queryRectBgHovered", false).style("cursor",null);
        for(var n in simResults) {
            simResults[n].style("fill", "black")
                .style("opacity", function(d) { return ((d.preIdx == -1) ? newDocOpacity : oldDocOpacity);});
        }
    }

    function init(data) {
        historyData = data.reverse();
        currentIdx = historyData.length-1;
        currentNode = historyData[currentIdx];
        similarities = calculateSimilarities(historyData);
        visualData = generateVisualData(historyData, similarities);
        redraw(visualData);
    }

    function loadDataFromIndexedDB() {

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
    }

    function calculateSimilarities(history) {
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

            rsSimilarity = calcResultSetSimilarity(preResults, history[i].results);
            qSimilarity = calcQueryTermSimilarity(preQuery, history[i].query);

            var similarity = {
                rsSimScore: rsSimilarity,
                qSimScore: qSimilarity
            }
            sims.push(similarity);
        }
        return sims;
    }

    function calcResultSetSimilarity(predecessor, current) {

        var sim = 0;
        var resultSetDiff = [];
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
    }

    function calcQueryTermSimilarity(predecessor, current) {

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
    }

    function generateVisualData(history, similarities) {
        var visualDataNodes = [];
        var visualDataEdges = [];
        for(var nodeIdx = 0; nodeIdx < history.length; nodeIdx++) {
            var vNode = {};
            vNode.query = history[nodeIdx].query;
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
    }

    function createGradient2(color1, color2) {
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
    }

    function removeGradient2() {
        d3.select("svg defs").remove();
    }

    function redraw(visualData) {

        svgContainer.selectAll("g").remove();
        var group = svgContainer.append("g").attr("transform", "translate(2, "+15+")");

        var queryRects = group.selectAll("g")
            .data(visualData.visualDataNodes)
            .enter()
            .append("g")
            .classed("queryNode", true)
            .on("mouseenter", onMouseOverNode)
            .on("mouseleave", onMouseOutNode)
            .on("click", onClick);

        queryRects.append("rect")
            .attr("x", function (d) { return d.x_pos - rectBorderWidth; })
            .attr("y", function (d) { return d.y_pos - rectBorderWidth; } )
            .attr("width", function (d) { return d.width + 2 * rectBorderWidth; })
            .attr("height", function (d) { return d.height + 2 * rectBorderWidth; })
            .classed("queryRectBg", true)
            .classed("queryRectBg-selected", function(d,i) { return (i == currentIdx);});

        queryRects.append("rect")
            .attr("x", function (d) { return d.x_pos; })
            .attr("y", function (d) { return d.y_pos; } )
            .attr("width", function (d) { return d.width; })
            .attr("height", function (d) { return d.height; })
            .style("fill", function (d) { return d.base_color; })
            .classed("queryRect", true)
            .append("svg:title")
            .text(function(d) { return d.query.toString(); });

        var queryDocRects = queryRects.append("g").selectAll("rect").data(function(d) { return d.results; })
            .enter()
            .append("rect");

        queryDocRects.attr("class", "docNode")
            .attr("x", function(d) { return d.x_pos; })
            .attr("y", function(d) { return d.y_pos; })
            .attr("width", function(d) { return d.width; })
            .attr("height", function(d) { return d.height; })
            .style("opacity", function(d) { return ((d.preIdx == -1) ? newDocOpacity : oldDocOpacity);});


        var queryEdges =  group.selectAll("rect.queryEdge")
            .data(visualData.visualDataEdges)
            .enter()
            .append("rect")
            .attr("class", "queryEdge")
            .on("mouseover", onMouseOverEdge)
            .on("mouseout", onMouseOutEdge);

        queryEdges.attr("x",function (d) { return d.start_x; } )
            .attr("y",function (d) { return d.start_y; } )
            .attr("width", edgeWidth )
            .attr("height", edgeHeight)
            .style("opacity", function(d) { return d.simTerms;});

    }
}