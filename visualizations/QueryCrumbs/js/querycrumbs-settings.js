var QueryCrumbsConfiguration = {
    /*
    The qualitative color palette used to color the background of the query rectangles.
    - Colors should be easily distinguishable.
    - Colors should allow to construct a lighter and a darker version and be still distinguishable from all other colors.
    - Using colorbrewer library (http://colorbrewer2.org/). Color Set1 is suitable for colorblind people.
     */
    colorSettings : {
    	baseColors: colorbrewer["Set3"]["11"],
    	// params for color-coded similarity
	    newDocOpacity : 0.1,
	    oldDocOpacity : 0.5,
	    // if similarity of a node exceeds this threshold it gets the same color
	    colorThreshold : 0.1	
    },
    // Query Crumbs dimensions
    dimensions : {
		// the number of visuals (= the number of queries to show)
		HISTORY_LENGTH : 11,
	    // the number of segments to show in total in each visual (each area corresponds to one document)
        SEGMENTS : null,
        /* Dimensions for the SQUARE visual type
           This will be initialized below (docRectHorizontal * docRectVertical == SEGMENTS)
        */
		// the number of columns - valid for the type SQUARE only
	    docRectHorizontal : 4,
	    // the number of rows - valid for the type SQUARE only
        docRectVertical : 4,
	    rectHeight : 20,
	    rectWidth : 20,
	    docRectHeight : null,
	    docRectWidth : null,
	    rectBorderWidth : 2,
        rectInfoVertPadding : 15,
        /* Dimensions for the edges between single visuals
          */
	    edgeWidth : 10,
	    edgeHeight : 10,
	    // node border and padding of additional info on mouse over
	    edgeInfoVertPadding : 17,
	    /* Dimensions for the CIRCLE visual type
        */
	    circle_cxy : 25,
	    circle_r : 11,
	    circle_bg_r : 12
    },
    // The skill level of an user. (BEGINNER, EXPERT, INTERMEDIATE)
    skillLevel : "",
    // Changes the form of the nodes. (SQUARE, CIRCLE)
    nodeForm : ""
}

QueryCrumbsConfiguration.dimensions.docRectHeight = QueryCrumbsConfiguration.dimensions.rectHeight / QueryCrumbsConfiguration.dimensions.docRectVertical;
QueryCrumbsConfiguration.dimensions.docRectWidth = QueryCrumbsConfiguration.dimensions.rectWidth / QueryCrumbsConfiguration.dimensions.docRectHorizontal;
// Calculate and initialize the amount of segments for the nodes. 
QueryCrumbsConfiguration.dimensions.SEGMENTS = QueryCrumbsConfiguration.dimensions.docRectHorizontal * QueryCrumbsConfiguration.dimensions.docRectVertical;

var EEXCESS = EEXCESS || {};
var profile = EEXCESS.profile.getProfileForQueryCrumbs();
QueryCrumbsConfiguration.skillLevel = profile.skillLevel;
QueryCrumbsConfiguration.nodeForm = profile.nodeForm;


/*
  Uses the base colors defined in QueryCrumbsConfiguration.base_colors. Several basic distinct colors can be defined here. When appending a new node to the QueryCrumbs, we assign
  one of these colors to the node. If the similarity of the new node compared to the previous node is below a
  certain threshold 'colorThreshold', we assign the color which comes next in this list to the new node. Otherwise
  the new node gets the same color as the previous nod.
*/
var BaseColorManager = {
	current: 0,
	currentFirstBaseColor: null,
	getColor: function(preNodeColor, similarity) {
	    if(preNodeColor) {
	        if(similarity > QueryCrumbsConfiguration.colorSettings.colorThreshold) {
	            return preNodeColor;
	        } else {
	            var cIdx = (QueryCrumbsConfiguration.colorSettings.baseColors.indexOf(preNodeColor) + 1) % QueryCrumbsConfiguration.colorSettings.baseColors.length;
	            return QueryCrumbsConfiguration.colorSettings.baseColors[cIdx];
	        }
	    } else {
	        return QueryCrumbsConfiguration.colorSettings.baseColors[0];
	    }
	},
	getFirstColor: function() {
	    if(BaseColorManager.currentFirstBaseColor) {
	        return BaseColorManager.currentFirstBaseColor;
	    } else {
	        return QueryCrumbsConfiguration.colorSettings.baseColors[0];
	    }
	}	
};
