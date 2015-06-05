/**
 * Provides methods handle HTML element/code. 
 * @class util-html
 */

/**
 * Gets all the links having `tag' in the class attribute. 
 * @param {String} tag Value of the tag (e.g., `removeLanguageremoveLanguage')
 * @returns {ListNode} List of elements. 
 * @method getRemoveLinks 
 */
function getRemoveLinks(tag){
	var removeLinks = [];
	var allLinks = document.getElementsByTagName("a");
	var cnt = 0;
	for (var i = 0 ; i < allLinks.length ; i++){
		var aLink = allLinks[i];
		if (aLink.classList.contains(tag)){
			removeLinks[cnt++] = aLink;
		}
	}
	return removeLinks;
}

/**
 * Gets the element corresponding to the display of another element. 
 * For instance, getDisplayElementFromElement("countryInput") returns "countryDisplay". 
 * The returned value can be null. 
 * @param {Element} element An input or policy element.  
 * @returns {Element} A display element corresponding to the input or policy element.  
 * @method getDisplayElementFromElement
 */
function getDisplayElementFromElement(element){
	return getElementFromElement(element, DISPLAYS);
}

/**
 * Gets the element corresponding to the policy of another element. 
 * For instance, getPolicyElementFromElement("countryInput") returns "locationPolicy". 
 * @param {Element} element An input (or display) element.  
 * @returns {Element} A policy element corresponding to the input (or display) element.  
 * @method getPolicyElementFromElement
 */
function getPolicyElementFromElement(element){
	return getElementFromElement(element, POLICIES);
}

/**
 * Retrieves an element given an input element and an array of identifiers. 
 * The array looks like ["aPolicy", "bPolicy", ..., "zPolicy"]. INPUTS, DISPLAYS and POLICIES (in constants.js) are such arrays. 
 * For instance, getElementFromElement(anAttributeInputElement, POLICIES) returns anAttributePolicyElement. 
 * @param {Element} inputElement The input element. 
 * @param {Array} array Array of identifiers. 
 * @returns {Element} The element corresponding to the input element. 
 * @method getElementFromElement
 */
function getElementFromElement(inputElement, array){
	var outputElement = null;
	var inputElementId = inputElement.getAttribute("id");
	var inputElementIdNum = "";
	var inputElementIdRoot = inputElementId;
	if (endsWithNumber(inputElementId)){
		inputElementIdNum = extractEndingNumber(inputElementId);
		inputElementIdRoot = inputElementId.replace(inputElementIdNum, "");
	}
	var outputElementIdRoot = getElementIdFromId(inputElementIdRoot, array);
	
	if (outputElementIdRoot != null){
		outputElement = document.getElementById(outputElementIdRoot + inputElementIdNum);
	}
	return outputElement;
}

/**
 * Gets the element identifier corresponding to an identifier. 
 * @param {String} id Identifier of the element to be retrieved (e.g., "cityInput", "locationPolicy"). 
 * @param {Array} array Array in which the element must be searched (e.g., DISPLAYS). 
 * @returns {String} Identifier of the element retrieved from "id".  
 * @method getElementIdFromId
 */
function getElementIdFromId(id, array){
	var element = null;
	var searchArray = new Array();
	if (id.endsWith(INPUT_SUFFIX)){
		searchArray = INPUTS;
	} else if (id.endsWith(POLICY_SUFFIX)){
		searchArray = POLICIES;
	} else if (id.endsWith(DISPLAY_SUFFIX)){
		searchArray = DISPLAYS;
	}
	var found = false;
	for (var i = 0 ; (i < searchArray.length) && (!found) ; i++){
		found = (searchArray[i] == id);
		if (found){
			element = array[i];
		}
	}
	return element;
}

/**
 * Determines if a string ends with a number. 
 * @param {String} str String to be analyzed. 
 * @returns {Boolean} True if the input string ends with a number; False otherwise. 
 * @method endsWithNumber
 */
function endsWithNumber(str){
	return (extractEndingNumber(str) != null);
}

/**
 * Extracts the number ending a string. 
 * @param {String} str String to be analyzed (e.g., "id123"). 
 * @returns {Integer} Number ending the string (e.g., 123). 
 * @method extractEndingNumber
 */
function extractEndingNumber(str){
	return str.match(/[0-9]/);
}

/**
 * Retrieves all the elements corresponding to a policy element. 
 * There is more than one element for a policy element, as several attributes may depend on it. 
 * For instance, "countryInput" and "cityInput" both depends on "locationPolicy".  
 * @param {Element} policyElement Policy element.
 * @returns {Array} Array containing all the elements corresponding to the policy element. 
 * @method getInputElementsFromPolicyElement
 */
function getInputElementsFromPolicyElement(policyElement){
	var inputElements = [];
	var cnt = 0;
	var policyId = policyElement.getAttribute("id");
	var policyIdNum = "";
	var policyIdRoot = policyId;
	if (endsWithNumber(policyId)){
		policyIdNum = extractEndingNumber(policyId);
		policyIdRoot = policyId.replace(policyIdNum, "");
	}
	for (var i = 0 ; i < POLICIES.length ; i++){
		var currentPolicyId = POLICIES[i];
		if (currentPolicyId == policyIdRoot){
			var inputId = INPUTS[i] + policyIdNum; 
			inputElements[cnt++] = document.getElementById(inputId);
		}
	}
	return inputElements;
}

/**
 * Removes a class from an element. 
 * For instance removeClass(<anElement class="a b c"/>, "b") returns <anElement class="a c"/>. 
 * @param {Element} element Element to be altered. 
 * @param {String} className Name of the class to be removed.  
 * @method removeClass
 */
function removeClass(element, className){
	element.className = element.className.replace(" " + className, "");
	element.className = element.className.replace(className, "");
}

/**
 * Adds a class to an element. 
 * For instance addClass(<anElement class="a c"/>, "b") modifies the element to become: <anElement class="a b c"/>. 
 * @param {Element} element Element to be altered. 
 * @param {String} className Name of the class to be removed.  
 * @method addClass
 */
function addClass(element, className){
	if (element.className != ""){
		className = " " + className;
	}
	element.className = element.className + className;
}

/**
 * Removes an element (e.g., language and interest) from the page. 
 * For instance removeElement(<a id="removeInterest3" .../>, INTEREST) removes the element "interest3" from the list of interests. 
 * @param {Element} removeElement Element to b
 * @param {String} type Type of the element to be removed. 
 * @method removeElement
 */
function removeElement(removeElement, type){
	var num = extractEndingNumber(removeElement.getAttribute("id"));
	var elementId = type + num;
	var elementToRemove = document.getElementById(elementId);
	elementToRemove.parentElement.removeChild(elementToRemove);
}

/**
 * Updates a given element (of a certain type). It is needed when a select menu has been modified. 
 * @param element Element to be updated. 
 * @param type Type of the element (i.e., language CLASS_LANGUAGE or interest CLASS_INTEREST). 
 * @method updateHtml
 */
function updateHtml(element, type){
	if (type == CLASS_LANGUAGE){
		var selectedOption = element.options[element.selectedIndex];
		var options = element.children;
		for (var i = 0 ; i < options.length ; i++){
			var option = options[i];
			if (option == selectedOption){
				option.setAttribute("selected", "selected");
			} else if (option.hasAttribute("selected")){
				option.removeAttribute("selected");
			}
		}
	} else if (type == CLASS_INTEREST){
		var value = element.value;
		element.setAttribute("value", value);
	}
}
