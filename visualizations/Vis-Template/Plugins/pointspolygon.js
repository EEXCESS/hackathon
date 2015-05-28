/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

//TODO check if there is a better solution think object-orientation
function Pointspolygon (width, height, type){
    this.width = width;
    this.heigth = height;
    this.type = type;
    var RELATIVE = 0.8;
    var BORDER = 5;
    var RIGHTSHIFT = 1;
    var FIRST_ELEMENT = 0;
    var SECOND_ELEMENT = 1;
    //this.centre = {};
    //this.points = [];


    Pointspolygon.prototype.getPoints = function(data){
        var length = data.length;
        var inputData = data;
        if(length === 0){
            return null;
        }
        var points = null;
        switch (this.type){
            case('minibarchart'):
                var array = calcRowColumn(length);
                var centre =  calcCentrePolygon(array, this.width, this.heigth,length);
                points =  mergeData(calcPointsFillPolygon(calcPointsStrokePolygon(centre),inputData, 
                                centre[FIRST_ELEMENT],centre[SECOND_ELEMENT]),
                                inputData,centre[FIRST_ELEMENT],centre[SECOND_ELEMENT]);
                break;
            case('minitimeline'):
                break;
        }
        return points;
    }; 


    calcRowColumn = function(dataLength){
        var length =  dataLength;
        var column = 1, row = 1;  
        var array = [];
        if(length === 1){
            array.push(column);
            array.push(row);
            return array;
        }
        else{
            // range
            var start = 2, end = 0;
            while(true){
            // very important this number should calculated by the relation between witdh and height    
                end = start * BORDER;// change to 6
                column++;
                if(length <= end){
                    break;           
                }
                else{
                    start = end + 1; 
                }
            }
            var rowtoCount = Math.round((start/column) * 2) + (column - 1);
            var step = column -1;
            for (var count = 1 ; count <= length - start; count++){
                if((count % step)){
                }
                else{
                    rowtoCount++;
                }
            }
            row = rowtoCount;   
        }  
        array.push(column);
        array.push(row);
        return array;     
    };

    calcCentrePolygon = function(size, width, height, length){
        var centre = [];    
        var result = [], x = [], y = [];             
        var column = size[FIRST_ELEMENT], row = size[SECOND_ELEMENT];
        // to fill the svg elment 
        var elementwidth = length === 1 ? ((width/column)- 4): ((width/column) * (1.0 + (0.04 * column)));
        //                                    check for style stroke 
        var elementheight = ((height/row) * 2)- 1;
        if(length === 1 || length === 2){
            elementheight = (height/5) * 2;
        }

        if(length === 1){
            x.push(elementwidth/2 );
            y.push(height/2);
        }
        else {
            x.push(elementwidth/2);
            if(length === 2){
                y.push(elementheight/2 + width/7); 
            }
            else{
            //start point for first element 
                y.push(elementheight/2 + 1);
            }
            // keep in mind 0.8 is var of elementsize
            var polyhexwidth = elementwidth * 0.9;//RELATIVE;
            for(var i = 0; i < Math.max(column,row) - 2 ;i++){
                if(i < column - 1){
                    x.push(x[i] + polyhexwidth);
                }
                if(i < row){
                    y.push(y[i] + elementheight/2 );  
                }
            } 
        }

        centre = writeCentrePoints(x, y, length);

        result.push(elementwidth);
        result.push(elementheight);
        result.push(centre);
        return result;
    };


    calcPointsStrokePolygon = function(centre){
        var points = centre[2];
        var order = [];
        var elemhalfwidth = centre[FIRST_ELEMENT]/2; 
        var elemhaltheight = centre[SECOND_ELEMENT]/2 ;
        var hor = elemhalfwidth * RELATIVE;  

        for(var i = 0; i < points.length ; i++ ){
            var a,b,c,d,e,f = {};
            var entry = points[i];;
            var result = [];
            result.push(entry);
            a = {'x': entry.x - elemhalfwidth + RIGHTSHIFT,'y': entry.y };
            b = {'x': entry.x - hor + RIGHTSHIFT,'y': entry.y - elemhaltheight };
            c = {'x': entry.x + hor + RIGHTSHIFT,'y': entry.y - elemhaltheight };
            d = {'x': entry.x + elemhalfwidth + RIGHTSHIFT,'y': entry.y };
            e = {'x': entry.x + hor + RIGHTSHIFT,'y': entry.y + elemhaltheight };
            f = {'x': entry.x - hor + RIGHTSHIFT,'y':entry.y + elemhaltheight };
            var point = {'a': a , 'b': b, 'c': c, 'd': d,'e': e,'f': f};
            result.push(point);
            order.push(result);  
        }    
        return order;
    };

    calcPointsFillPolygon = function(allPoints, inputData, width, height){
        var max =  0;
        var points = allPoints;
        var length = inputData.length;
        var elemhalfwidth = width, elemhaltheight = height;

        for(var d =  0; d < length; d++){
            if(max < inputData[d].count){
              max = inputData[d].count;
            }
        }
        var insert = [];
        var d =  0;
        points.forEach(function(d,i){
            var check = inputData[i].count/max;
            var input = points[i][SECOND_ELEMENT];  
            var a,b,c,d,e,f = {};

            if(check === 1){
                insert.push(input);
            } //  break;
            else if((check > 0.5) && (check < 1)){   
                a = input.a;
                d = input.d;
                e = input.e;
                f = input.f;
                var scale = (elemhaltheight) * (check - 0.5);
                var x_y = intersection(input.a.x,input.a.y,
                                       input.b.x,input.b.y,
                                       input.a.x , input.d.y - scale,
                                       input.d.x, input.d.y - scale);                                          
                b = {'x': x_y[FIRST_ELEMENT], 'y':x_y[SECOND_ELEMENT]};
                x_y = intersection(input.c.x,input.c.y,
                                   input.d.x,input.d.y,
                                   input.a.x, input.d.y - scale,
                                   input.d.x , input.d.y - scale);                                 
                c = {'x': x_y[FIRST_ELEMENT], 'y':x_y[SECOND_ELEMENT]};          
                var point_1 = {'a': a , 'b': b, 'c': c, 'd': d,'e': e,'f': f};
                insert.push(point_1);
            }
            else if(check === 0.5){  
                a = input.a;
                d = input.d;
                e = {'x':input.e.x, 'y':input.e.y};
                f = input.f;
                var point_2 = {'a': a ,'d': d,'e': e,'f': f};      
                insert.push(point_2);
            }
            else if((check < 0.5) && (check > 0)){   
                var scale = elemhaltheight * check;
                var x_y = intersection(input.a.x, input.a.y,
                                       input.f.x,input.f.y,
                                       0, input.f.y - scale,
                                       input.d.x  , input.f.y - scale);
                a =  {'x': x_y[FIRST_ELEMENT], 'y':x_y[SECOND_ELEMENT]};          
                x_y  = intersection(input.d.x, input.d.y,
                                    input.e.x, input.e.y,
                                    0, input.e.y - scale,
                                    input.d.x  , input.e.y - scale);
                d =  {'x': x_y[FIRST_ELEMENT], 'y':x_y[SECOND_ELEMENT]};  
                e = {'x':input.e.x, 'y':input.e.y};
                f = input.f;
                var point_3 = {'a': a ,'d': d,'e': e ,'f': f};
                insert.push(point_3);
            }    
        });
        return [points, insert];
    };

    stringifyData = function(obj){
        var data = obj;
        var keys = Object.keys(data);  
        var string = "M ";
        for(i = 0; i < keys.length; i++){ 
            var x = data[keys[i]].x.toString();
            var y = data[keys[i]].y.toString();               
            var insert = " ";
            insert = " "+ x + " , " +y;  
            string = string.concat(insert);              
        }            
        return string = string.concat(' z');
    };


    mergeData = function(points, inputData, width, hight){
        var points_m = [];
        var points_stroke = [];
        var points_fill = [];
        for(var i = 0;i < inputData.length;i++){
            points_m.push(points[FIRST_ELEMENT][i][FIRST_ELEMENT]);
            points_stroke.push(stringifyData(points[FIRST_ELEMENT][i][SECOND_ELEMENT]));
            points_fill.push(stringifyData(points[SECOND_ELEMENT][i]));
        }
        var data = {'points_m': points_m,'points_stroke': points_stroke,
                    'points_fill': points_fill,'meta': inputData,
                    'size': [width , hight] };
        return data;       
    };

    writeCentrePoints = function(x, y, length){      
        var centre = []; 
        for(var i = 0; i < y.length; i = i + 2){  
            for(var j = 0; j < x.length ; j++){
                var point_up, point_down = {};   
                if(( j % 2)){
                    point_up = {'x': x[j],'y': y[i + 1]};  
                    centre.push(point_up);
                }
                else{                       
                    point_down = {'x': x[j],'y': y[i]};  
                    centre.push(point_down);          
                }       
            }  
        }
        if(centre.length > length){
            centre.splice(centre.length - 1, centre.length - length);
        }
        return centre;
    };

    intersection = function(x_1, y_1, x_2, y_2, x_3, y_3, x_4, y_4){
        var d = (y_4 - y_3)*(x_2-x_1) - (y_2 - y_1) * (x_4 - x_3);
        var x = ((x_4 - x_3)*(x_2 * y_1 - x_1 * y_2) - (x_2 - x_1) * (x_4 * y_3 - x_3 * y_4)) / d;
        var y = ((y_1 - y_2)*(x_4 * y_3 - x_3 * y_4) - (y_3 - y_4) * (x_2 * y_1 - x_1 * y_2))/d;
        return [x,y];
    };

  }