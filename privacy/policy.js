/**
 * Provides methods to manage policy privacy. 
 * @class policy
 */

/**
 * Retrieves all the button groups contained in the page. 
 * @returns {NodeList} List of button groups. 
 * @method getButtonGroups
 */
function getButtonGroups(){
	return document.getElementsByClassName(CLASS_BUTTON_GROUP);
}

/**
 * Retrieves all the buttons contained in the page. 
 * @returns {NodeList} List of buttons. 
 * @method getButtons
 */
function getButtons(){
	return document.getElementsByClassName(CLASS_BUTTON);
}

/**
 * Initializes all the buttons contained in the page. 
 * @method initButtons
 */
function initButtons(){
	var buttonGroups = getButtonGroups();
	for (var i = 0 ; i < buttonGroups.length ; i++){
		initButtonGroup(buttonGroups[i]);
	}
}

/**
 * Initializes all the buttons of a given button group. 
 * @param {Element} buttonGroup Button group element containing the buttons that must be initialized. 
 * @method initButtonGroup
 */
function initButtonGroup(buttonGroup){
	var buttonGroupId = buttonGroup.getAttribute("id");
	var level = getStoredValue(buttonGroupId);
	if (level == null){ 
		level = DEFAULT_POLICY_LEVEL; 
	}
	var children = buttonGroup.children;
	for (var j = 0 ; j < children.length ; j++){
		var child = children[j];
		// Initialise the style of the button
		removeClass(child, BUTTON_STYLE_GREY);
		removeClass(child, BUTTON_STYLE_GREEN);
		removeClass(child, BUTTON_STYLE_ORANGE);
		removeClass(child, BUTTON_STYLE_RED);
		var buttonStyle = BUTTON_STYLE_GREY;
		if (j != level){
			buttonStyle = BUTTON_STYLE_GREY;
		} else {
			if (j == 0){
				buttonStyle = BUTTON_STYLE_GREEN;
			} else if ((j == 1) && (j != children.length-1)){
				buttonStyle = BUTTON_STYLE_ORANGE;
			} else if ((j == 2) || (j == children.length-1)){
				buttonStyle = BUTTON_STYLE_RED;
			}
		}
		addClass(child, buttonStyle);
		// Add an attribute PARENT_ID (useful for listeners)
		if (!child.hasAttribute(PARENT_ID)){
			child.setAttribute(PARENT_ID, buttonGroup.getAttribute("id"));
		}
	}
}

/**
 * Updates a given button: changes the appearance according to a user's action, 
 * triggers the display of the value (depending on the level of privacy). 
 * @param {Element} button Element corresponding to the button to be updated. 
 * @method updateButton
 */
function updateButton(button){
	var parent = document.getElementById(button.getAttribute(PARENT_ID));
	var children = parent.children;
	for (var i = 0 ; i < children.length ; i++){
		var child = children[i];
		removeClass(child, BUTTON_STYLE_GREY);
		removeClass(child, BUTTON_STYLE_GREEN);
		removeClass(child, BUTTON_STYLE_ORANGE);
		removeClass(child, BUTTON_STYLE_RED);
		var buttonStyle = BUTTON_STYLE_GREY;
		if (child.textContent == button.textContent){
			// the current child is the button that was clicked on
			if (i == 0){
				buttonStyle = BUTTON_STYLE_GREEN;
			} else if ((i == 1) && (i != children.length-1)){
				buttonStyle = BUTTON_STYLE_ORANGE;
			} else if ((i == 2) || (i == children.length-1)){
				buttonStyle = BUTTON_STYLE_RED;
			}
		}
		addClass(child, buttonStyle);
	}
	
	// Update the value(s) displayed
	var inputElements = getInputElementsFromPolicyElement(button.parentNode);
	for (var i = 0 ; i < inputElements.length ; i++){
		displayElement(inputElements[i]);
	}
}

/**
 * Retrieves the level of privacy of a given button group (i.e., attribute). 
 * @param {Element} buttonGroup Element corresponding to the button group. 
 * @returns {Integer} The level of privacy. 
 * @method getPolicyLevel
 */
function getPolicyLevel(buttonGroup) {
	var value = 0;
	var buttons = buttonGroup.children;
	for (var i = 0 ; i < buttons.length ; i++){
		var button = buttons[i];
		if (!button.classList.contains(BUTTON_STYLE_GREY)){
			value = i;
		}
	}
	return value;
}

/**
 * Listener invoked when a given policy button is clicked. 
 * It update the button, save the value of the button (i.e., the level of privacy), 
 * and triggers the display of the value corresponding to the attribute. 
 * @param {Element} button Element corresponding to the button. 
 * @method policyButtonListener
 */
function policyButtonListener(button){ 
	updateButton(button); 
	saveButton(button);
	var policyId = button.getAttribute(PARENT_ID);
	var policyElement = document.getElementById(policyId);
	var inputElements = getInputElementsFromPolicyElement(policyElement);
	for (var j = 0 ; j < inputElements.length ; j++){
		var inputElement = inputElements[j];
		displayElement(inputElement);
	}
}

/**
 * Resets the value of the privacy level of a given attribute. 
 * It is invoked when an attribute is removed (e.g., a language or an interest). 
 * @param {Element} element Element corresponding to the attribute. 
 * @param {String} typePolicy Type of attribute considered (i.e., language LANGUAGE_POLICY or interest INTEREST_POLICY). 
 * @param {Integer} defaultPolicyLevel The default level of privacy for the considered attribute.  
 * @method resetElementPolicy
 */
function resetElementPolicy(element, typePolicy, defaultPolicyLevel){
	var num = extractEndingNumber(element.getAttribute("id"));
	var elementId = typePolicy + num;
	storeValue(elementId, defaultPolicyLevel);
}