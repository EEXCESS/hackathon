function Geometry(){

	var lineLength;

	Math.radians = function(degrees) {
	  return degrees * (Math.PI / 180);
	};
		
	Math.degrees = function(radians) {
		return radians * (180 / Math.PI);
	};
		

	/**
	 *  Calculate node radius according to current extent
	 */
	//this.calculateRadius = function(fullExtent, xScaleStart, xScaleEnd){
	this.calculateRadius = function(fullExtent, currentExtent){			
		//var currentExtent = Math.abs(new Date(xScaleEnd) - new Date(xScaleStart));	
		var i = 8, r = $("body").width() < 1440 ? 10 : 11;
		while(i >= 0){
			if(currentExtent < fullExtent/i)
				return r;
				
			r -= 0.5;
			i--;
		}
	};
	
	

	/**
	 *  Calculates x-offset for text attached to refnodes
	 */
	this.getTextXoffset = function(d, i){
		
		if(d.factor == 1)
			return 10;
		
		var length = $("#keywordNode_"+i+" > text").width();
		var xTextOffset = -length - 15;
		
		return xTextOffset;
	};
	
	
	/**
	 *  Calculates y-offset for text attached to refnodes
	 */
	this.getTextYoffset = function(d, index, size){
		
		if(size % 2 == 0 && index < size/2)
			index = index + 1;
		
		var sign = (d.yOffset > 0) ? 1 : -1; 
		
		if(index == 0 || index == size-1)
			return (index - size/2) * 3 + sign * 5 + 2;
		
		return (index - size/2) * 3 +  2;
	};

	
	/**
	 *  Calculates offset for keyword nodes
	 */ 
	this.getXandYOffset = function(w, width, d, i){

        lineLength = $("body").width() < 1400 ? 40 : 50;

		var numKeywords = d.keywords.length;
		var angle = (150 / (numKeywords-1)) * i + 15;
		angle = (!isNaN(angle)) ? angle - 90 : 0;
		
		var xOffset = Math.cos(Math.radians(angle));
		var yOffset = Math.sin(Math.radians(angle));
	
		xOffset = (!isNaN(xOffset)) ? xOffset * lineLength : lineLength;	// x = sin(angle) * hypotenuse
		yOffset = (!isNaN(yOffset)) ? yOffset * lineLength : 0;				// y = cos(angle) * hypotenuse

		var factor = 1;
		// Adjustment to draw lines from right to left
		if(w > width*(3/4)){
			xOffset = -xOffset;
			factor = -1;
		}
		
		return { 'xOffset': xOffset, 'yOffset': yOffset, 'factor': factor, 'angle': angle};
	};
	
	
	this.getMidPoint = function( refPoint ){
		
		//console.log(refPoint);
		var refX = parseFloat(refPoint.xOffset) / 2;
		var refY = parseFloat(refPoint.yOffset) / 2;
		
		var alpha = parseFloat(refPoint.angle);		// angle  calculated above
		var beta =  (alpha < 0) ? -90 - alpha : (90 - alpha);					// complementary angle
		//console.log("alpha = " + alpha );
		//console.log("beta = " + beta );
	
		var xOffset = 5 * -refPoint.factor * Math.cos(Math.radians(beta)) + refX;
		var yOffset = 5 * Math.sin(Math.radians(beta)) + refY;
		//console.log("xOffset = " + xOffset);
		//console.log("yOffset = " + yOffset);
		//console.log("-----------------------------------------------------");
		
		return {'xOffset': xOffset, 'yOffset': yOffset, 'factor': refPoint.factor};
		
	};
	
	

}