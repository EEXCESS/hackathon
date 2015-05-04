/**
 * Provides methods to initialize, retrieve or display elements. 
 * @class common
 */

/**
 * Returns all the text input elements of class CLASS_TEXT. 
* @method getTextInputs
* @return {NodeList} list of elements. 
*/
function getTextInputs(){
	return document.getElementsByClassName(CLASS_TEXT);
}

/**
* Initializes the text input elements of the form. 
* Values are taken from the data store. 
* @method initTextInputs
*/
function initTextInputs(){
	var textInputs = getTextInputs();
	for (var i = 0 ; i < textInputs.length ; i++) {
		var input = textInputs[i];
		var inputId = input.getAttribute("id");
		var value = getStoredValue(inputId);
		if (value != null){
			input.value = value;
		} // it is null when the user didn't enter any value
	}
}

/**
 * Display the new value of the element, and save it in the data store.
 * The HTML is updated in case it has to be done (e.g., for select input field).  
 * @param {Element} element Element which has just been modified. 
 * @param {String} clas Class of the element. 
 * @method elementListener
 */
function elementListener(element, clas){ 
	updateHtml(element, clas);
	displayElement(element);
	if (clas == CLASS_LANGUAGE){
		saveLanguages();
	} else if (clas == CLASS_TEXT){
		saveInput(input);
	}
}

/**
 * Display all the elements. 
 * @param {NodeList} elements
 * @method displayElements
 */
function displayElements(elements){
	for (var i = 0 ; i < elements.length ; i++) {
		var element = elements[i];
		displayElement(element);
	}
}

/**
 * Display the element according to the privacy level.
 * @param {Element} element
 * @method displayElement
 */
function displayElement(element){
	var displayElement = getDisplayElementFromElement(element);
	var hasToBeDisplayed = (displayElement != null);
	if (hasToBeDisplayed){
		displayElement.textContent = blurField(element);
	}
}