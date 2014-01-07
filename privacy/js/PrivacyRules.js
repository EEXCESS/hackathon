var privacy = privacy || {
	version: "1.0"
};

/*
 * Example : raw date is 1992-6-3
 * level 0 : "nothing" 
 * level 1 : {"decade": "20"}
 * level 2 : {"age": "21 years"}
 * level 3 : {"date": "1992-6-3"}
 */
privacy.birthdate = {
	levels: 4,
	apply: function (raw, level) {
		var age;
		var birthY = raw.split('-')[0];
		var birthM = raw.split('-')[1];
		var birthD = raw.split('-')[2];
		
		var date = new Date();
		
		var currentY = date.getFullYear();
		var currentD = date.getDate();
		var currentM = date.getMonth()+1;
		
		age = currentY-birthY;
		if((currentM-birthM < 0) || (currentD-birthD < 0)) age - 1;
		
		switch(level){
		case 0: 
			return "nothing";
			break;
		case 1:
			return ('{"decade":"'+(age - age%10)+'"}');
			break;
		case 2:
			return ('{"age":"'+ age + ' years"}');
			break;
		case 3:
			return ('{"date":"'+ raw + '"}');
			break;
		default :
			return ('{"date":"'+ raw + '"}');
			break;
			
		};
	}
}

/* Example : raw email is : "toto@domain.com"
 * level 0 : "nothing"
 * level 1 : "toto@domain.com"
 */
privacy.email = {
		levels:2,
		apply: function (raw, level) {
			if( level == 0){
				return "nothing";
			}
			else if ( level ==1 ){
				return raw;
			}
			else{
				return raw;
			}
		}	
}

/* Example : raw email is : "Mister"
 * level 0 : "nothing"
 * level 1 : "Mister"
 */
privacy.title = {
		levels:2,
		apply: function (raw, level) {
			if( level == 0){
				return "nothing";
			}
			else if ( level ==1 ){
				return raw;
			}
			else{
				return raw;
			}
		}	
}


/* Example : raw gender is : "Male"
 * level 0 : "nothing"
 * level 1 : "Male"
 */
privacy.gender = {
		levels:2,
		apply: function (raw, level) {
			if( level == 0){
				return "nothing";
			}
			else if ( level ==1 ){
				return raw;
			}
			else{
				return raw;
			}
		}	
}


/* Example : raw address is : {
 * 								"lattitude": "41.785110",
 * 								"longitude": "23.889504",
 * 								"street": "4 streetname Street",
 * 								"postalcode": "48960",
 * 								"city": "CityTown",
 * 								"district": "Bigger City's urban region",
 * 								"region": "RegionName",
 * 								"country": "United-Kingdom"
 * 								}
 * level 0 : "nothing"
 * level 1 : {
 * 				"country": "United-Kingdom"
 * 			}
 * level 2 : {
 * 				"region": "RegionName",
 * 				"country": "United-Kingdom"
 * 			}
 * level 3 : {
 * 				"district": "Bigger City's urban region",
 * 				"region": "RegionName",
 * 				"country": "United-Kingdom"
 * 			}
 * level 4 : {
 * 				"postalcode": "48960",
 * 				"city": "CityTown",
 * 				"district": "Bigger City's urban region",
 * 				"region": "RegionName",
 * 				"country": "United-Kingdom"
 * 			}
 * level 5 : {
 * 				"lattitude": "41.785110",
 * 				"longitude": "23.889504",
 * 				"street": "4 streetname Street",
 * 				"postalcode": "48960",
 * 				"city": "CityTown",
 * 				"district": "Bigger City's urban region",
 * 				"region": "RegionName",
 * 				"country": "United-Kingdom"
 * 			}
 */
privacy.address = {
		levels:6,
		apply: function (raw, level) {
			var jsonRaw = JSON.parse(raw);
			
			var res = new Object();
			
			if ( level >= 1 ){
				if ( jsonRaw.country != null){
					res.country = jsonRaw.country;
				}
			}
			if ( level >= 2 ){
				if ( jsonRaw.region != null ){
					res.region = jsonRaw.region;
				}
			}
			if ( level >= 3 ){
				if ( jsonRaw.district != null ){
					res.district = jsonRaw.district;
				}
			}
			if ( level >= 4 ){
				if ( jsonRaw.city != null ){
					res.city = jsonRaw.city;
				}
				if ( jsonRaw.postalcode != null ){ 
					res.postalcode = jsonRaw.postalcode;
				}
			}
			if ( level == 5 ){
				if ( jsonRaw.street != null ){ 
					res.street = jsonRaw.street;
				}
				if ( jsonRaw.longitude != null ){ 
					res.longitude = jsonRaw.longitude;
				}
				if ( jsonRaw.lattitude != null ){ 
					res.lattitude = jsonRaw.lattitude;
				}
			}
			return JSON.stringify(res);
		}	
}

privacy.apply = function(attribute, rawValue, disclosureLevel) {
	if(privacy[attribute] && privacy[attribute].apply && 0<= disclosureLevel && disclosureLevel<privacy[attribute].levels ) {
		return privacy[attribute].apply(rawValue, disclosureLevel);
	} else {
		if(disclosureLevel > 0) {
			return rawValue;
		} else {
			return null;
		}
	}
}


/*
 * Example:
 *    privacy.apply("birthdate", "1992-06-03", 1) 
 *    should output  "20's"
 *    
 */
