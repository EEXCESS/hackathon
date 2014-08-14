
function Geochart(root, visTemplate) {

	var GEO = {};
	GEO.Settings = new Settings('geochart');

	var Vis = visTemplate;
	var data;
    var colorScale;
    var width, height;
    var colorChannel;
    GEO.$root = $(root);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/* Event handlers  */

	GEO.Evt = {};






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*  Additional methods, if necessary*/

	GEO.Internal = {

        getRandomInRange: function (from, to, fixed) {
            return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
            // .toFixed() returns string, so ' * 1' is a trick to convert to number
        },
        getRandomLatLon: function (i) {
            return [GEO.Internal.getRandomInRange(-20, 60, 3), GEO.Internal.getRandomInRange(-120, 120, 3)];
            //return [(20 + i).toFixed(3) * 1, (0).toFixed(3) * 1];
        },
        spatializeData: function(data){
            for(var i=0; i<data.length; i++){
                data[i].coordinate = GEO.Internal.getRandomLatLon(i);
            }
        }
    };






////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	GEO.Render = {};



	/******************************************************************************************************************
	*
	*	Draw GEO vis
	*
	* ***************************************************************************************************************/
	GEO.Render.draw = function( receivedData, iWidth, iHeight ){

		// See settings.js

		/******************************************************
		*	Define canvas dimensions
		******************************************************/
		GEO.Dimensions = GEO.Settings.getDimensions( root, iWidth, iHeight);
		width   = GEO.Dimensions.width;
		height  = GEO.Dimensions.height;
		colorScale   = d3.scale.category10();
        colorChannel = 'language';



		/******************************************************
		*	Define input variables
		******************************************************/
		GEO.Input = GEO.Settings.getInitData(receivedData );
        GEO.Internal.spatializeData(GEO.Input.data);
        GEO.$root.append('<div id="mapInner" style="height:100%"></div>');

        GEO.map = L.map('mapInner');
        GEO.Render.centerMap();
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(GEO.map);
        GEO.Render.drawMarkers();
	};

    GEO.Render.centerMap = function(){
        GEO.map.setView([51.505, -0.09], 2);
    };

    GEO.Render.drawMarkers = function(){

        GEO.markersGroup = new L.MarkerClusterGroup({
            iconCreateFunction: function(cluster) {
                //return new L.DivIcon({ html: '<b>' + cluster.getChildCount() + '</b>' });
                //return new L.DivIcon({ html: '<div><span>' + cluster.getChildCount() + '</span></div>', className: 'marker-cluster', iconSize: new L.point(40, 40) });
                //return new L.DivIcon({ className:'marker-cluster-pie', iconSize: L.point(44, 44), html: '<svg width="44" height="44" viewbox="0 0 400 400"><path d="M200,200 L200,20 A180,180 0 0,1 377,231 z" style="fill:#ff0000;fill-opacity: 0.5;"/><path d="M200,200 L377,231 A180,180 0 0,1 138,369 z" style="fill:#00ff00;fill-opacity: 0.5;"/><path d="M200,200 L138,369 A180,180 0 0,1 20,194 z" style="fill:#0000ff;fill-opacity: 0.5;"/><path d="M200,200 L20,194 A180,180 0 0,1 75,71 z" style="fill:#ff00ff;fill-opacity: 0.5;"/><path d="M200,200 L75,71 A180,180 0 0,1 200,20 z" style="fill:#ffff00;fill-opacity: 0.5;"/></svg><div class="child-count">' + cluster.getChildCount() + '</div>'});
                var markers = cluster.getAllChildMarkers();
                var pieParts = {};
                for (var i=0; i<markers.length; i++){
                    var dataObject = markers[i].options.dataObject;
                    if (!pieParts[dataObject.facets[colorChannel]]){
                        pieParts[dataObject.facets[colorChannel]] = 0;
                    }
                    pieParts[dataObject.facets[colorChannel]] ++;
                }
                var piePartsCountColor = [];
                for (var key in pieParts) {
                    if (pieParts.hasOwnProperty(key)){
                        piePartsCountColor.push({
                            count:pieParts[key],
                            color:colorScale(key)
                        });
                    }
                }
                var svg = document.createElement("svg");
                GEO.Render.drawArcs(svg, piePartsCountColor);
                return new L.DivIcon({ className:'marker-cluster-pie', iconSize: L.point(44, 44), html: '<svg width="44" height="44" viewbox="0 0 400 400">' + svg.innerHTML + '</svg><div class="child-count">' + cluster.getChildCount() + '</div>'});
            }
        });

        for(var i=0; i<GEO.Input.data.length; i++){
            //var marker = L.marker(GEO.Input.data[i].coordinate);
            //var marker = L.marker([51.505, -0.09]);
            var currentDataObject = GEO.Input.data[i];
            currentDataObject.color = colorScale(currentDataObject.facets[colorChannel]);
            var marker = new GEO.Render.Marker(GEO.Input.data[i].coordinate, { icon: GEO.Render.icon(currentDataObject.color) });
            marker.options.dataObject = currentDataObject;
            marker.bindPopup(GEO.Input.data[i].title);
            GEO.markersGroup.addLayer(marker);
            GEO.Input.data[i].geoMarker = marker;
        }

        GEO.map.addLayer(GEO.markersGroup);
    };

    GEO.Render.Marker = L.Marker.extend({
        options:{
            dataObject: null
        }
    });

    // credits to: https://github.com/jseppi/Leaflet.MakiMarkers
    GEO.Render.icon = function(color){
        return new L.Icon({
                //iconSize: [36,90], //l
                //popupAnchor: [0,-40], //l
                iconSize: [30,70], //m
                popupAnchor: [0,-30], //m
                iconUrl : 'https://api.tiles.mapbox.com/v3/marker/pin-m+' + color.substr(1) + '.png',
                iconRetinaUrl : 'https://api.tiles.mapbox.com/v3/marker/pin-m+' + color.substr(1) + '@2x.png'
            });
    };

    // credits to: http://stackoverflow.com/questions/7261318/svg-chart-generation-in-javascript
    GEO.Render.makeSVG = function(tag, attrs) {
        var el= document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (var k in attrs)
            if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
        return el;
    };

    GEO.Render.drawArcs = function(paper, piePartsCountColor){
        var total = piePartsCountColor.reduce(function (previous, current) { return previous + current.count; }, 0);
        var sectorAngleArr = piePartsCountColor.map(function (v) { return 360 * v.count / total; });
        var startAngle = 0;
        var endAngle = 0;
        for (var i=0; i<sectorAngleArr.length; i++){
            startAngle = endAngle;
            endAngle = startAngle + sectorAngleArr[i];
            var x1,x2,y1,y2 ;
            x1 = parseInt(Math.round(200 + 195*Math.cos(Math.PI*startAngle/180)));
            y1 = parseInt(Math.round(200 + 195*Math.sin(Math.PI*startAngle/180)));
            x2 = parseInt(Math.round(200 + 195*Math.cos(Math.PI*endAngle/180)));
            y2 = parseInt(Math.round(200 + 195*Math.sin(Math.PI*endAngle/180)));
            var d = "M200,200  L" + x1 + "," + y1 + "  A195,195 0 " + ((endAngle-startAngle > 180) ? 1 : 0) + ",1 " + x2 + "," + (y2 == 200 ? 199 : y2) + " z";
            //alert(d); // enable to see coords as they are displayed
            // original:
            //var c = parseInt(i / sectorAngleArr.length * 360);
            //var arc = GEO.Render.makeSVG("path", {d: d, fill: "hsl(" + c + ", 66%, 50%)"});
            var arc = GEO.Render.makeSVG("path", {d: d, fill: piePartsCountColor[i].color,  transform : "rotate(-90 200 200)"});
            paper.appendChild(arc);
            //arc.onclick = clickHandler; // This is optional, of course
        }
        return paper;
    };



	/******************************************************************************************************************
	*
	*	Reset GEO  vis
	*
	* ***************************************************************************************************************/
	GEO.Render.reset = function(  ){
        GEO.map.removeLayer(GEO.markersGroup);
        GEO.Render.drawMarkers();
        GEO.Render.centerMap();
	};



    /******************************************************************************************************************
	*
	*	Highlight items
    *   @param indexArray: array with items' indices to highlight. They match items in receivedData (parameter in Render.draw)
	*
	* ***************************************************************************************************************/
	GEO.Render.highlightItems = function(indexArray){
        indexArray.forEach(function(i) {
            GEO.markersGroup.zoomToShowLayer(GEO.Input.data[i].geoMarker, function() {
                GEO.Input.data[i].geoMarker.openPopup();
            });
            //GEO.Input.data[i].geoMarker.openPopup();
        });
    };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	GEO.Ext = {
		draw: function( receivedData, iWidth, iHeight ){ GEO.Render.draw( receivedData, iWidth, iHeight ); },
		reset: function(){ GEO.Render.reset();	},
        highlightItems: function(indexArray){ GEO.Render.highlightItems(indexArray); }
	};


	return GEO.Ext;

}
