
function Geochart(root, visTemplate) {

	var GEO = {};
	GEO.Settings = new Settings('geochart');

	var Vis = visTemplate;
	var data;
    var width, height;
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
                return new L.DivIcon({ className:'marker-cluster-pie', iconSize: L.point(44, 44), html: '<svg width="44" height="44" viewbox="0 0 400 400"><path d="M200,200 L200,20 A180,180 0 0,1 377,231 z" style="fill:#ff0000;fill-opacity: 0.5;"/><path d="M200,200 L377,231 A180,180 0 0,1 138,369 z" style="fill:#00ff00;fill-opacity: 0.5;"/><path d="M200,200 L138,369 A180,180 0 0,1 20,194 z" style="fill:#0000ff;fill-opacity: 0.5;"/><path d="M200,200 L20,194 A180,180 0 0,1 75,71 z" style="fill:#ff00ff;fill-opacity: 0.5;"/><path d="M200,200 L75,71 A180,180 0 0,1 200,20 z" style="fill:#ffff00;fill-opacity: 0.5;"/></svg><div class="child-count">' + cluster.getChildCount() + '</div></div>'});
            }
        });

        for(var i=0; i<GEO.Input.data.length; i++){
            var marker = L.marker(GEO.Input.data[i].coordinate);
            //var marker = L.marker([51.505, -0.09]);
            marker.bindPopup(GEO.Input.data[i].title);
            GEO.markersGroup.addLayer(marker);
            GEO.Input.data[i].geoMarker = marker;
        }

        GEO.map.addLayer(GEO.markersGroup);
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
