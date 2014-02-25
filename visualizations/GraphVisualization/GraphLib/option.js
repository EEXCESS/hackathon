function Options(){
	this.makeOptions ={
		svg:{
			HTMLObject:{value:"body"},
			width:{value:500},
			height:{value:500}
		},
		vis:{
			width:{value:1000},
			height:{value:1000},
			trans:{
				x:{value:0},
				y:{value:0}				
			},
			scale:{value:1}
		},
		force:{
			theta:{value:0.8},
			charge:{value:-120},
			gravity:{value:0.05},
			linkDistance:{value:80},
			linkStrength:{value:1}
		}
	};
	
}
