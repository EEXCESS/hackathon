$.fn.addSliderSegments = function (amount,content) {
	  for(var i=0;i<amount;i++){
			if (i == (amount-1)) {
				var segment = "<div class='ui-slider-segment' id='segment-"+i+"' style='margin-left: 3px;'><div class='tooltip top slider-tip' style='display: none'><div class='tooltip-arrow advice' style='margin-left: -52px'></div><div class='tooltip-inner advice' style='margin-left: 85px'>"+content[amount-i-1]+"</div></div></div>";
			}
			else {
				var segmentGap = (100 - 5) / (amount - 1) + "%";
				var margin = 98.5 - i*(100 - 5) / (amount - 1);
				if(i == 0){
					var segment = "<div class='ui-slider-segment' id='segment-"+i+"' style='margin-left: "+segmentGap+";'><div class='tooltip top slider-tip' style='margin-left:"+margin+"%; display:none;'><div class='tooltip-arrow advice' style='margin-left: 20px;'></div><div class='tooltip-inner advice' style='margin-left: -60px;'>"+content[amount-1-i]+"</div></div></div>";
				}
				else{
					var segment = "<div class='ui-slider-segment' id='segment-"+i+"' style='margin-left: "+segmentGap+";'><div class='tooltip top slider-tip' style='margin-left:"+margin+"%; display: none;'><div class='tooltip-arrow advice'></div><div class='tooltip-inner advice'>"+content[amount - 1 - i]+"</div></div></div>";
				};
			};
			$(this).prepend(segment);
	  }
  };