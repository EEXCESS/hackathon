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
 * 
 * TODO
 * @param {Element} inputElement
 * @param {Array} array
 * @returns
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
 * @returns {Boolean} True if the "str" ends with a number; False otherwise. 
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
 * TODO
 * @param policyElement
 * @returns {Array}
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
 * TODO
 * @param element
 * @param className
 * @method removeClass
 */
function removeClass(element, className){
	element.className = element.className.replace(" " + className, "");
	element.className = element.className.replace(className, "");
}

/**
 * TODO
 * @param element
 * @param className
 * @method addClass
 */
function addClass(element, className){
	if (element.className != ""){
		className = " " + className;
	}
	element.className = element.className + className;
}

/**
 * TODO
 * @param removeElement
 * @param type
 * @method removeElement
 */
function removeElement(removeElement, type){
	var num = extractEndingNumber(removeElement.getAttribute("id"));
	var elementId = type + num;
	var elementToRemove = document.getElementById(elementId);
	elementToRemove.parentElement.removeChild(elementToRemove);
}

/**
 * TODO
 * @param element
 * @param type
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
