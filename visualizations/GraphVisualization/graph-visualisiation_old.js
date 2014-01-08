


    var Graph = function() {
        this.width = 300;
        this.height = 500;

        this.charge = -120;
        this.gravity = 0.05;
        this.linkDistance = 20;

        //this.HTMLObject = '#' + EEXCESS.contentEL;
        var svg = d3.select('#content').append("svg")
                .attr("width", this.width)
                .attr("height", this.height);

        var force = d3.layout.force()
                .size([this.width, this.height])
                .charge(this.charge)
                .gravity(this.gravity)
                .linkDistance(this.linkDistance)
                .on("tick", tick);

        function tick() {

            link.attr("x1", function(d) {
                return d.source.x;
            })
                    .attr("y1", function(d) {
                        return d.source.y;
                    })
                    .attr("x2", function(d) {
                        return d.target.x;
                    })
                    .attr("y2", function(d) {
                        return d.target.y;
                    });

            node.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            /*
             node.attr("cx", function(d) { return d.x; })
             .attr("cy", function(d) { return d.y; });
             */
        }
        /*
         svg.append("rect")
         .attr("width", this.width)
         .attr("height", this.height);
         
         */
        var node = svg.selectAll(".node");
        var link = svg.selectAll(".link");

        this.nodes = force.nodes();
        this.links = force.links();


        this.restart = function() {
            link = link.data(this.links);
            //link properties
            link.enter().insert("line", ".node")
                    .attr("class", "link")
                    .style("stroke-width", function(d) {
                        return d.s;
                    })
                    .style("stroke", function(d) {
                        return d.c;
                    });

            node = node.data(this.nodes);
            var innerNode = node.enter().insert("g")//, ".cursor")
                    .attr("class", "node")
                    .call(force.drag);

            //node properties	
            innerNode.append("circle")
                    .attr("r", function(d) {
                        return d.r;
                    })
                    .style("stroke-width", 1)
                    .style("stroke", "black")
                    .style("fill", function(d) {
                        return d.c;
                    });
            innerNode.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", ".35em")
                    .attr("y", 20)
                    .text(function(d) {
                        return d.text;
                    });

            force.start();
        };

        this.nodeParam = function(text, r, c, data) {
            return {"text": text, "r": r, "c": c, "data": data};
        };
        this.addNode = function(node) {
            this.nodes.push(node);
        };
        this.addNodes = function(nodeArray) {
            for (var element in nodeArray) {
                this.addNode(nodeArray[element]);
            }
        };


        this.linkParam = function(sourceIndex, targetIndex, d, s, c, data) {
            return {
                "sourceIndex": sourceIndex, "targetIndex": targetIndex,
                "d": d, "s": s, "c": c, "data": data
            };
        };

        this.addLink = function(link) {
            var sn = this.nodes[link.sourceIndex];
            var tn = this.nodes[link.targetIndex];

            this.links.push({source: sn, target: tn, "d": link.d, "s": link.s, "c": link.c, "data": link.data});

            force.linkDistance(function(d, i) {
                return d.d;
            });
        };
        this.addLinks = function(linkArray) {
            var currentJsonObj;
            for (var element in linkArray) {
                currentJsonObj = linkArray[element];

                g.addLink({
                    "sourceIndex": currentJsonObj.source.index,
                    "targetIndex": currentJsonObj.target.index,
                    "d": currentJsonObj.d,
                    "s": currentJsonObj.s,
                    "c": currentJsonObj.c
                });
            }
        };


        this.addNodesAroundFromNode = function(nodeIndex, nodeArray, shortLinkArray) {
            var currentNode;
            var currentShortLink;
            for (var element in nodeArray)
            {
                currentNode = nodeArray[element];
                currentShortLink = shortLinkArray[element];
                this.addNode(currentNode);
                this.restart();
                this.addLink({"sourceIndex": nodeIndex,
                    "targetIndex": this.nodes[this.nodes.length - 1].index,
                    "d": currentShortLink.d,
                    "s": currentShortLink.s,
                    "c": currentShortLink.c
                });
            }
        };
    };

    var g = new Graph();

    if (typeof (Storage) !== "undefined") {
        if (sessionStorage.storageJsonData) {
            //sessionStorage.datacount=Number(sessionStorage.datacount)+1;
        }
        else {
            sessionStorage.storageJsonData = JSON.stringify(g);
        }
    }
    else {
        /// Storage Error
    }

    //http://www.europeana.eu/portal/ //delete the search graph
    if (window.location.href == "http://www.europeana.eu/portal/")
    {
        sessionStorage.storageJsonData = JSON.stringify(g);
        ;
    }


    var jsonObj = JSON.parse(sessionStorage.storageJsonData);
    g.addNodes(jsonObj.nodes);
    g.addLinks(jsonObj.links);
    g.restart();

    /*
     var jsonObj = JSON.parse(sessionStorage.jsonData);
     
     sessionStorage.jsonData=JSON.stringify(jsonObj);
     */
    //var vv = $('div#item-details div:first').text();
    //alert("hello world: " + vv + " " +sessionStorage.datacount);

    //var keyword = "";
    var browserLink = window.location.href;
    var searchOrRecord = browserLink.split("/")[4].split(".")[0];
    var searchLink = "";
    var APIKey = 'Fa4gVjX3d';
    var profil = 'portal';

    if (searchOrRecord == "search") {

        var keyword = browserLink.split("?")[1].split("&")[0].split("=")[1];
        searchLink = 'http://europeana.eu/api//v2/search.json?wskey=' + APIKey +
                '&query=' + keyword + '&start=1&rows=12&profile=' + profil;


        var draw = false;
        var lastNode;
        if (jsonObj.nodes.length == 0) {
            draw = true;
            lastNode = 0;
        }
        for (var element in jsonObj.nodes) {
            if (jsonObj.nodes[element].data.link == browserLink) {/////////////!!!!!!!!!!
                draw = true;
                lastNode = jsonObj.nodes[element].index;
                break;
            }
        }

        if (draw) {
            $.ajax({
                url: searchLink,
                type: 'GET',
                async: true,
                //jsonpCallback: 'jsonCallback',
                contentType: "application/json",
                dataType: 'json', //'jsonp',
                success: processSearch,
                error: function(e) {
                    console.log(e.message);
                }
            });
        }

        function processSearch(jsonData) {
            g.addNode(g.nodeParam(keyword.substring(0, 4) + "...", 5, "#3377CC", {title: keyword, link: searchLink}));////////!!!!
            g.restart();
            ////////////////////
            if (jsonObj.nodes.length > 1) {
                var nextNode = g.nodes[g.nodes.length - 1].index;
                g.addLink(g.linkParam(jsonObj.nodes[element].index,
                        nextNode, // last create node
                        60,
                        1,
                        "#110000"
                        ));
                g.restart();
                lastNode = nextNode;
            }

            //////////////////
            var nodeItems = jsonData.items;
            var maxCount = 0;
            maxCount = nodeItems.length > 10 ? 10 : nodeItems.length;

            for (var count = 0; count < maxCount; count++)
            {
                g.addNode(g.nodeParam(nodeItems[count].title[0].substring(0, 4) + "...", 3, "#ff0077", nodeItems[count]));
                g.restart();
                g.addLink({"sourceIndex": lastNode, ////////////node !!!!!!!!!!!!!
                    "targetIndex": g.nodes[g.nodes.length - 1].index, // last create node
                    "d": 20,
                    "s": 1,
                    "c": "#110000"
                });
                g.restart();
            }
            g.restart();
            sessionStorage.storageJsonData = JSON.stringify(g);

        }

    } else if (searchOrRecord == "record") {
        var subkey = browserLink.split("?")[0].split("/").reverse();
        var recordId = subkey[1] + "/" + subkey[0].split(".")[0];
        searchLink = 'http://europeana.eu/api//v2/record/' + recordId + '.json?wskey=' + APIKey + '&profile=full';

        var draw = true;
        for (var element in jsonObj.nodes) {
            if (jsonObj.nodes[element].data.link == recordId) {
                draw = false;
                break;
            }
        }


        if (draw)
        {
            $.ajax({
                url: searchLink,
                type: 'GET',
                async: true,
                //jsonpCallback: 'jsonCallback',
                contentType: "application/json",
                dataType: 'json', //'jsonp',
                success: recordSearch,
                error: function(e) {
                    console.log(e.message);
                }
            });
        }

        function recordSearch(jsonData) {
            for (var element in jsonObj.nodes) {
                if (jsonObj.nodes[element].data.id == "/" + recordId) {

                    g.addNode(g.nodeParam(jsonData.object.title[0].substring(0, 4) + "...", 5, "#3377CC", {
                        title: jsonData.object.title[0], link: recordId}));
                    g.restart();

                    var nextNode = g.nodes[g.nodes.length - 1].index;
                    g.addLink(g.linkParam(jsonObj.nodes[element].index,
                            nextNode, // last create node
                            60,
                            1,
                            "#110000"
                            ));
                    g.restart();

                    var jQueryPath = 'div#item-details div:first strong';
                    var recordJsonData = $(jQueryPath + ',' + jQueryPath + ' ~ ul > li');

                    var title = "";
                    var resultNodes = [];
                    var htmlText = "";
                    for (elementIndex in recordJsonData)
                    {//tagName = "STRONG" , "LI"
                        htmlText = recordJsonData[elementIndex].textContent;
                        if (recordJsonData[elementIndex].tagName == "STRONG") {
                            title = htmlText;
                        }
                        else if (recordJsonData[elementIndex].tagName == "LI") {
                            //resultNodes.push({title:title + ": "+ htmlText,nodeData:recordJsonData[elementIndex]});
                            resultNodes.push({title: title + ": " + htmlText, link: recordJsonData[elementIndex].children[0].href})
                        }
                    }

                    var maxCount = 0;
                    maxCount = resultNodes.length > 10 ? 10 : resultNodes.length;

                    for (var count = 0; count < maxCount; count++)
                    {
                        g.addNode(g.nodeParam(resultNodes[count].title.substring(0, 4) + "...", 3, "#ff0077", resultNodes[count]));
                        g.restart();
                        g.addLink({"sourceIndex": nextNode,
                            "targetIndex": g.nodes[g.nodes.length - 1].index, // last create node
                            "d": 20,
                            "s": 1,
                            "c": "#110000"
                        });
                        g.restart();
                    }
                    g.restart();
                    sessionStorage.storageJsonData = JSON.stringify(g);


                    break;
                }
            }

        }



        //alert("g: " +searchLink);

    }




    /*
     var cloud = tagCloud();
     cloud.setPolygone(lineData);
     cloud.setData(data);
     cloud.draw('#' + EEXCESS.contentEL);
     */







    /*
     var svgContainer = d3.select('#' + EEXCESS.contentEL).append("svg")
     .attr("width", "100")
     .attr("height", "200");
     
     svgContainer.append("text").attr("x",50).attr("y",50).text("Hello world!");
     */


				