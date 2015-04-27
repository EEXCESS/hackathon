/**
 * Provides methods that implements obfuscation and filtering mechanisms.
 * @class obfuscation
 */

/**
 * TODO
 * @param {Element} field
 * @returns {String}
 * @method blurField
 */
function blurField(field){
	var result = "";
	var fieldId = field.getAttribute("id");
	var policyElement = getPolicyElementFromElement(field);
	var level = getPolicyLevel(policyElement); 
	if (fieldId == BIRTHDATE_INPUT){		
		result = blurBirthdate(field.value, level);
	} else {
		var value = "";
		var threshold = MAX_POLICY_THRESHOLD; 
		if (fieldId == COUNTRY_INPUT){
			threshold = 1;
			value = field.value;
		} else if (fieldId == CITY_INPUT){
			threshold = 2;
			value = field.value;
		} else if (fieldId.startsWith(LANGUAGE_LABEL_INPUT) || fieldId.startsWith(LANGUAGE_SKILL_INPUT)){
			threshold = 1;
			value = field.options[field.selectedIndex].value;
		} else if (fieldId.startsWith(INTEREST_INPUT)){
			threshold = 1;
			var topics = $("#" + fieldId).tagit("assignedTags");
			value = "";
			if (topics != null){
				for (var i = 0 ; i < topics.length ; i++){
					value += topics[i];
					if (i != (topics.length - 1)){
						value += ", ";
					}
				}
			}
		} 
		result = blurValue(value, level, threshold);
	}
	return result;
}

/**
 * TODO
 * @param {String} birthdate
 * @param {Integer} level
 * @returns {String}
 * @method blurBirthdate
 */
function blurBirthdate(birthdate, level){
	var result = "";
	if ((level != 0) && (birthdate != "")){
		var strBirthdate = birthdate.toString();
		var yearBirth = strBirthdate.substring(0, 4);
		if (level == 1){
			var lowerBound = yearBirth - (yearBirth%10);
			var upperBound = lowerBound + 10;
			result = "[" + lowerBound + ", " + upperBound + "]";
		} else if (level == 2){
			result = yearBirth;
		}
	}
	return result;
}

/**
 * TODO
 * @param {String} value
 * @param {Integer} level
 * @param {Integer} threshold
 * @returns {String}
 * @method blurValue
 */
function blurValue(value, level, threshold){
	var result = "";
	if (level >= threshold){
		result = value;
	}
	return result;
}