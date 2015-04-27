/**
 * Provides methods to manage policy privacy. 
 * @class policy
 */

/**
 * TODO
 * @returns {NodeList}
 * @method getButtonGroups
 */
function getButtonGroups(){
	return document.getElementsByClassName(CLASS_BUTTON_GROUP);
}

/**
 * 
 * TODO
 * @returns {NodeList}
 * @method getButtons
 */
function getButtons(){
	return document.getElementsByClassName(CLASS_BUTTON);
}

/**
 * TODO
 * @method initButtons
 */
function initButtons(){
	var buttonGroups = getButtonGroups();
	for (var i = 0 ; i < buttonGroups.length ; i++){
		initButtonGroup(buttonGroups[i]);
	}
}

/**
 * TODO
 * @param {Element} buttonGroup
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
 * TODO
 * @param button
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
 * TODO
 * @param {Element} buttonGroup
 * @returns {Integer}
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
 * TODO
 * @param {Element} button
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
 * TODO
 * @param {Element} element
 * @param {String} typePolicy
 * @param {Integer} defaultPolicyLevel
 * @method resetElementPolicy
 */
function resetElementPolicy(element, typePolicy, defaultPolicyLevel){
	var num = extractEndingNumber(element.getAttribute("id"));
	var elementId = typePolicy + num;
	storeValue(elementId, defaultPolicyLevel);
}