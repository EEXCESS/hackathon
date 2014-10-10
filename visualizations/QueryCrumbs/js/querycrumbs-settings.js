var QueryCrumbsConfiguration = {
    /*
    The qualitative color palette used to color the background of the query rectangles.
    - Colors should be easily distinguishable.
    - Colors should allow to construct a lighter and a darker version and be still distinguishable from all other colors.
    - Using colorbrewer library (http://colorbrewer2.org/). Color Set1 is suitable for colorblind people.
     */
    colorSettings : {
    	baseColors: colorbrewer["Paired"]["11"],
    	// params for color-coded similarity
	    newDocOpacity : 0.1,
	    oldDocOpacity : 0.5,
	    // if similarity of a node exceeds this threshold it gets the same color
	    colorThreshold : 0.1	
    },
    // Query Crumbs dimensions
    dimensions : {
		HISTORY_LENGTH : 11,
		DENSE_PIXELS : 16,
	    rectHeight : 20,
	    rectWidth : 20,
	    docRectHorizontal : 4,
	    docRectVertical : 4,
	    docRectHeight : null,
	    docRectWidth : null,
	    edgeWidth : 10,
	    edgeHeight : 10,
	    // node border and padding of additional info on mouse over
	    rectBorderWidth : 2,
	    rectInfoVertPadding : 15,
	    edgeInfoVertPadding : 17,
	    circle_cxy : 25,
	    circle_r : 11,
	    circle_bg_r : 12
    },
    // The skill level of an user. (BEGINNER, EXPERT)
    skillLevel : "EXPERT",
    // Changes the form of the nodes. (SQUARE, CIRCLE)
    nodeForm : "SQUARE"
}

QueryCrumbsConfiguration.dimensions.docRectHeight = QueryCrumbsConfiguration.dimensions.rectHeight / QueryCrumbsConfiguration.dimensions.docRectVertical;
QueryCrumbsConfiguration.dimensions.docRectWidth = QueryCrumbsConfiguration.dimensions.rectWidth / QueryCrumbsConfiguration.dimensions.docRectHorizontal;

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
