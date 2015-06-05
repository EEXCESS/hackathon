/**
 * Provides methods that implements obfuscation and filtering mechanisms.
 * @class obfuscation
 */

/**
 * Blurs a specific field according to the level of privacy assigned by the user. 
 * @param {Element} field The field to be blurred.  
 * @returns {String} The blurred value.   
 * @method blurField
 */
function blurField(field){
	var result = "";
	var fieldId = field.getAttribute("id");
	var policyElement = getPolicyElementFromElement(field);
	var level = getPolicyLevel(policyElement); 
	var value = "";
	var threshold = MAX_POLICY_THRESHOLD; 
	if (fieldId == COUNTRY_INPUT){
		threshold = 1;
		value = field.value;
	} else if (fieldId == CITY_INPUT){
		threshold = 2;
		value = field.value;
	} else if (fieldId == AGE_RANGE_INPUT){
		threshold = 1;
		value = field.options[field.selectedIndex].textContent;
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
	return result;
}

/**
 * Blurs a specific value according to the policy level and the threshold for this value. 
 * The value is blurred if and only if the level is lower than the threshold. 
 * @param {String} value Value to be blurred. 
 * @param {Integer} level Level of privacy assigned the user. 
 * @param {Integer} threshold Threshold used to decide if a value must be blurred. 
 * @returns {String} The blurred value. 
 * @method blurValue
 */
function blurValue(value, level, threshold){
	var result = "";
	if (level >= threshold){
		result = value;
	}
	return result;
}