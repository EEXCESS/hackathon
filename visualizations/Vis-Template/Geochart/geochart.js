
function Geochart(root, visTemplate) {

	var GEO = {};
	GEO.Settings = new Settings('geochart');

	var Vis = visTemplate;
	var data;
    var colorScale;
    var width, height;
    var colorChannel;
    GEO.$root = $(root);
    GEO.ClusterSettings = {
        minSize:32,
        maxSize:64,
        minAmount:2,
        maxAmount:8
    };
	


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
                if (!data[i].coordinate)
                    data[i].coordinate = GEO.Internal.getRandomLatLon(i);
            }
        },
        getDataIndex: function(id){
            for(var i=0; i<GEO.Input.data.length; i++){
                if (GEO.Input.data[i].id == id)
                    return i;
            }
            return null;
        },
		getSelectedData: function(layer){
			var selectedIndices = [];
            var selectedData = [];
			var rectBounds = layer.getBounds();
			var inputData = GEO.Input.data;
		    for(var i=0; i < inputData.length; i++){
				if(
                    inputData[i].coordinate && inputData[i].coordinate.length == 2 &&
					rectBounds.getWest() <= inputData[i].coordinate[1] &&
					inputData[i].coordinate[1] <= rectBounds.getEast() &&
					rectBounds.getSouth() <= inputData[i].coordinate[0] &&
					inputData[i].coordinate[0] <= rectBounds.getNorth()
					)
				{
					selectedIndices.push(i);
                    selectedData.push(inputData[i]);
				}
            }
            return { selectedData: selectedData, selectedIndices: selectedIndices };
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
	GEO.Render.draw = function( receivedData, mappingCombination, iWidth, iHeight ){

		// See settings.js

		/******************************************************
		*	Define canvas dimensions
		******************************************************/
		GEO.Dimensions = GEO.Settings.getDimensions( root, iWidth, iHeight);
		width   = GEO.Dimensions.width;
		height  = GEO.Dimensions.height;
		colorScale   = d3.scale.category10();
        colorChannel = 'language';
        for(var i=0; i<mappingCombination.length; i++)
            if (mappingCombination[i].visualattribute == 'color')
                colorChannel = mappingCombination[i].facet;



		/******************************************************
		*	Define input variables
		******************************************************/
		GEO.Input = GEO.Settings.getInitData(receivedData );
        //GEO.Internal.spatializeData(GEO.Input.data);
        GEO.$root.append('<div id="mapInner" style="height:100%"></div>');

        GEO.map = L.map('mapInner');
        GEO.Render.centerMap();
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(GEO.map);
        GEO.Render.drawMarkers();

        // Leaflet Draw
        var drawnItems = new L.FeatureGroup();
        GEO.map.addLayer(drawnItems);
		
		L.drawLocal.draw.toolbar.buttons.rectangle = "selection tool";

        var drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems,
				edit:false,
				remove:false
            },
			draw: {
				rectangle:{
			        shapeOptions: {
						stroke: true,
						color: '#1E28EC',
						weight: 2,
						opacity: 0.7,
						fill: true,
						fillColor: null, //same as color by default
						fillOpacity: 0.1
					}
				},
				polygon: false,
				marker: false,
				polyline: false,
				circle:false
			}
        });
		
        GEO.map.addControl(drawControl);
		
		GEO.map.on('draw:created', function (e) {
			var type = e.layerType,
				layer = e.layer;

			if (type === 'rectangle') {
				// Do marker specific actions
				GEO.Render.deleteCurrentSelect();
				GEO.map.addLayer(layer);
				currentOneLayer = layer;
				//make selection list
                var selectionResult = GEO.Internal.getSelectedData(layer);

                var bounds = layer.getBounds();
                FilterHandler.setCurrentFilterRange('geo', selectionResult.selectedData, bounds._northEast, bounds._southWest);
			}

			// Do whatever else you need to. (save to db, add to map etc)
			//GEO.map.addLayer(layer);
		});
        $(document).keyup(function(e) {
            if (e.keyCode == 27) { // ESC
                GEO.Render.deleteCurrentSelect();
                FilterHandler.setCurrentFilterRange('geo', [], null, null);
            } 
        });
	};
	GEO.Render.deleteCurrentSelect = function(){
		if(currentOneLayer != null && GEO.map.hasLayer(currentOneLayer)){
			GEO.map.removeLayer(currentOneLayer);
			currentOneLayer = null;
		}
	};
	
    var currentOneLayer = null;
	
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
                var size = GEO.Render.getClusterSize(GEO.ClusterSettings, markers.length);
                var innerSize = size/2;
                var childCountStyle = 'font-size:'+ (innerSize/2 + 2) +'px; border-radius: ' + (innerSize/2) + 'px; height: ' + innerSize + 'px; width: ' + innerSize + 'px; line-height: ' + innerSize + 'px; left: ' + (innerSize/2) + 'px; top: ' + (innerSize/2) + 'px;';

                var svg = document.createElement("svg");
                GEO.Render.drawArcs(svg, piePartsCountColor);
                return new L.DivIcon({ className:'marker-cluster-pie', iconSize: L.point(size, size), html: '<svg width="' + size + '" height="' + size + '" viewbox="0 0 400 400">' + svg.innerHTML + '</svg><div class="child-count" style="'+childCountStyle+'">' + cluster.getChildCount() + '</div>'});
            }
        });

        for(var i=0; i<GEO.Input.data.length; i++){
            //var marker = L.marker(GEO.Input.data[i].coordinate);
            //var marker = L.marker([51.505, -0.09]);
            if (!GEO.Input.data[i].coordinate || GEO.Input.data[i].coordinate.length < 2)
                continue;

            var currentDataObject = GEO.Input.data[i];
            currentDataObject.color = colorScale(currentDataObject.facets[colorChannel]);
            var marker = new GEO.Render.Marker(GEO.Input.data[i].coordinate, { icon: GEO.Render.icon(currentDataObject.color) });
            marker.options.dataObject = currentDataObject;
            marker.bindPopup(GEO.Input.data[i].title);
            marker.on('click', function(e){
                if (e && e.target && e.target.options && e.target.options.dataObject){
					GEO.Render.deleteCurrentSelect();
                    FilterHandler.setCurrentFilterListItems([e.target.options.dataObject]);
                }
            }).on('popupclose', function(){
                    FilterHandler.setCurrentFilterListItems([]);
            });
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

    GEO.Render.getClusterSize = function(clusterSettings, markersCount){
        var divider = clusterSettings.maxAmount - clusterSettings.minAmount;
        var sizeGrowthPerMarker = (clusterSettings.maxSize - clusterSettings.minSize) / divider;
        var sizeMultiplier = markersCount - clusterSettings.minAmount;
        if (sizeMultiplier < 0)
            sizeMultiplier = 0;
        if (sizeMultiplier > divider)
            sizeMultiplier = divider;
        var size = clusterSettings.minSize + (sizeMultiplier * sizeGrowthPerMarker);
        size = Math.round(size/4)*4; // pixel should be able to divide without remainder
        return size;
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
		GEO.Render.deleteCurrentSelect();
	};



    /******************************************************************************************************************
	*
	*	Highlight items
    *   @param indexArray: array with items' indices to highlight. They match items in receivedData (parameter in Render.draw)
	*
	* ***************************************************************************************************************/
	GEO.Render.highlightItems = function(indexArray){
        GEO.map.closePopup();
        indexArray.forEach(function(i) {
            GEO.markersGroup.zoomToShowLayer(GEO.Input.data[i].geoMarker, function() {
                GEO.Input.data[i].geoMarker.openPopup();
            });
            //GEO.Input.data[i].geoMarker.openPopup();
        });
		GEO.Render.deleteCurrentSelect();
    };


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	GEO.Ext = {
		draw: function( receivedData, mappingCombination, iWidth, iHeight ){ GEO.Render.draw(receivedData, mappingCombination, iWidth, iHeight); },
		reset: function(){ GEO.Render.reset();	},
        highlightItems: function(indexArray){ GEO.Render.highlightItems(indexArray); }
	};


	return GEO.Ext;

}
