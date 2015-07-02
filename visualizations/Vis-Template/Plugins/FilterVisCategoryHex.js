/*
 * 
 * This file creates and interacts with MiniBarChat visualization
 * important note: and TODO: d3 has an transform/translation functionality 
 * use this if hole Visualization is resized --> solution viewbox cause svg
 * 
 */
 (function(){

    var MiniBarchart = {};   
    var $root = null;
    var margin = {top: 10, right: 5, bottom: 10, left: 5};
    var base = null;
    var chart = null;
    var currentCategory = null;

    MiniBarchart.initialize = function(vis, rootSelector){       
        $root = rootSelector;
        MiniBarchart.vis = vis;
    };
    
    MiniBarchart.draw = function(allData, selectedData, inputData, $container, category, categoryValues, from, to){
    
        var data = inputData.data;    
    
        require(['../Plugins/pointspolygon'], function(){        
            var $vis = $container.find('.MiniBarChart');
            var points = null;
            var svg = null;
            // basic data
            var width = parseInt(d3.select("#eexcess-filtercontainer").style("width"));
            var height = parseInt(d3.select("#eexcess_controls").style("height"))/ 6;
            points = new Pointspolygon(width - (margin.left + margin.right), height - 2, 'minibarchart');
            
            // if none minibarchart exits
            if($vis.length === 0){
                base = d3.select($container.get(0));
                chart = base.append("div")
                    .attr("class","MiniBarChart")
                    .attr('width',width)
                    .attr('height', height)
                    .style('padding',"3px 4px");
            
                svg = chart.append("svg") 
                    .attr("class", "minibarchart_svg")
                    .attr("width", "100%" )
                    .attr("height", height - 2)
                    .attr("viewBox", "0 0 "+width +" "+ height+" ");
            
                generateMiniBarElements(data, svg, points, category);
                interactMiniBar(selectedData, category, data, $vis); 
                currentCategory = category;
            } else if($vis.length !== 0 && currentCategory === category){ // every interaction
                interactMiniBar(selectedData, category, data, $vis);  
            } else if($vis.length !== 0 && currentCategory !== category){ // build new svg groups/path if switch by y-axis/color 
                generateMiniBarElements(data, svg, points,category);
                interactMiniBar(selectedData, category, data, $vis);
                currentCategory = category;       
            } else {
              console.log("There is something wrong, maybe you want to read an undefined value");
            }
        });
    };

    MiniBarchart.finalize = function(){
    
    };

    generateMiniBarElements = function(inputData, svg, pointspolygon,category){
        //delete all elements if exists        
        deleteElements();
        var dataSet = pointspolygon.getPoints(inputData);    
        var size = dataSet.size;
        var base = d3.select("#eexcess-filtercontainer");
        var svg = base.select('svg');
        var svgAppend = svg; 
        var color = d3.scale.category10();
        svgAppend.append("g") 
            .selectAll(".points_fill")
            .data(dataSet.points_fill)
            .enter().append("path")
            .attr("class", "points_fill")
            .attr("id", function(d,i){ return inputData[i][category].replace(/[ .]/g,"_");})
            .attr("d", function (d) { return d;})
            .style("fill", function (d,i) {
               return  color(i);
            });

        svgAppend.append("g") 
            .selectAll(".points_stroke")
            .data(dataSet.points_stroke)
            .enter().append("path")
            .attr("class", "points_stroke")
            .attr("id", function(d,i){ return inputData[i][category].replace(/[ .]/g,"_");})
            .attr("d", function (d,i) { return d;})
            .style({ 'stroke': 'Black', 'fill': 'none', 'stroke-width': '2px'});

        var delta =  getLetterSize(inputData,category,dataSet.size);    
        svgAppend.append("g")
            .selectAll(".hexagon_text")
            .data(dataSet.points_m)
            .enter().append("text")
            .attr("class", "hexagon_text")
            .attr("id", function(d,i){ return inputData[i][category].replace(/[ .]/g,"_");})
            .attr("x", function(d,i) { return d.x - (size[0]/2.5) ; })
            .attr("y", function(d,i) { return d.y + delta[1];})
            .text( function (d,i) { return inputData[i][category];})
            .attr("font-family", "sans-serif")
            .style("font-size", delta[0])
            .attr("fill", "black");
    };
    
    getLetterSize = function(data, category, size){    
        var max = 0;
        data.forEach(function (d,i){
            var size = d[category].length;
            if(size > max){
                max = size;
            }    
        });  
        var elem = size[0]/(max+1);                 
        return [(elem * 1.7 > 15) ? 15 : elem * 1.7,(elem * 1.7 > 15) ? 15/4 : (elem * 1.7)/4];
    };

    interactMiniBar = function(selectedData, category, data,test){

        var base = d3.select("#eexcess-filtercontainer");
        var svg = base.select('svg');
        var fill = svg.selectAll(".points_fill");  
        var stroke = svg.selectAll(".points_stroke");
        var text = svg.selectAll(".hexagon_text");
        var selected = selectedData;

        //only one bar or binding doesn't worked errorhandling
        if(selected.length === data.length || selected[0]=== undefined){
            console.log("Sorry facets is undefined");
            fill.transition()
            .style("opacity",1);
            stroke.transition()
            .style("opacity",1);
            text.transition()
            .style("opacity",1);
        }
        // second click on element before
        else if(selected[0] === undefined && (selected.length === data.length)){
          /*fill.transition()
          .style("opacity",1);
           stroke.transition()
          .style("opacity",1);
           text.transition()
           .style("opacity",1);*/
       } else { //first click or different element   
            var selector = selected[0].facets[category].replace(/[ .]/g,"_");	
            var path = "path#"+selector;
            var selectedfill = svg.selectAll(path);   
            // selected stroke
            var get = "text#"+selector;
            var selectedtext = svg.select(get);    
            //get elements to compare 
            stroke.transition().style("opacity",0.2);
            fill.transition().style("opacity",0.2);
            selectedfill.transition().style("opacity",1);
            text.transition().style("opacity",0.2);
            selectedtext.transition().style("opacity",1);
        }
    };

    function deleteElements(){
        //delete elements if they exists
        var base = d3.select("#eexcess-filtercontainer");
        var svg = base.select('svg');
        var elements = svg.selectAll(".points_fill");
        var element = svg.selectAll(".points_stroke");
        var elementText = svg.selectAll(".hexagon_text");
        if(elements !== (undefined || null)){
            elements.remove();
        }
        if(element !== (undefined || null)){
            element.remove();
        }
        if(elementText !== (undefined || null)){
            elementText.remove();
        }
    };

    PluginHandler.registerFilterVisualisation(MiniBarchart, {
      'displayName' : 'MiniBarchart', 
      'type' : 'category', 
    });

})();
