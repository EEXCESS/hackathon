/**
 * This module is the main component of the profile management. 
 * It imports all the necessary libraries (i.e., the other components). 
 * @class profile
 */

//*************
//** IMPORTS **
//*************

var FILES_TO_IMPORT = ["constants.js" 		// contains all the constants used in this module
                      , "common.js" 		// generic functions used to initialize, retrieve or display elements
                      , "storage.js" 		// management the storage of data
                      , "languages.js" 		// management of the languages
                      , "interests.js" 		// management of the interests 
                      , "obfuscation.js" 	// obfuscation and filtering mechanisms
                      , "policy.js" 		// management of policy settings (buttons)
                      , "util-html.js" 		// management of HTML elements + basic functions
                      ];

for (var i = 0 ; i < FILES_TO_IMPORT.length ; i++){
	var importElement = document.createElement("script");
	importElement.src = FILES_TO_IMPORT[i];
	document.head.appendChild(importElement);
}

//********************
//** INITIALIZATION **
//********************

// Initialization
window.addEventListener("load", init, true); 
window.addEventListener("load", display, true);
window.addEventListener("load", createListeners, false);

// Date picker
(function($) {
    $(".datepicker").datepicker({viewMode: 2}).on("changeDate", function(ev) {  
    		if (ev.viewMode == "days"){
        		displayElement(this); 
        		saveInput(this); 
    			$(this).datepicker("hide");
    		}
    	});
})(jQuery); 

//***************
//** FUNCTIONS **
//***************

/**
 * Initializes all the attributes of the form (demographics, languages and interests) using the values saved in the data store. 
 * It also initializes the buttons that are used to handle the level of privacy for each attribute. 
 * It is called when the window is loaded. 
 * @method init
 */
function init(){
	initTextInputs();
	initSelectInputs();
	initLanguages();
	initInterests();
	initButtons();
}

/**
 * Displays the values of the attributes. 
 * The values displayed depends on the level of privacy assigned to each attribute. 
 * It is called when the window is loaded. 
 * @method display
 */
function display(){
	displayElements(getTextInputs());
	displayElements(getSelectInputs());
	displayElements(getLanguageSelects());
	displayElements(getInterestInputs());
}

/**
 * Create the listeners. Some of the listeners are assigned to form input fields (e.g., demographics, languages), 
 * while others are assigned to links (e.g., links that allow the addition or the removal of languages). 
 * The listeners of the interests are not created in the method, as they are related to TagIt. 
 * It is called when the window is loaded. 
 * @method createListeners
 */
function createListeners(){
	// Buttons
	var buttons = getButtons();
	for (var i = 0 ; i < buttons.length ; i++) {
		var button = buttons[i];
		button.addEventListener("click", function(){ policyButtonListener(this); }); 
	}
	// Text inputs
	var textInputs = getTextInputs();
	for (var i = 0 ; i < textInputs.length ; i++) {
		var textInput = textInputs[i];
		textInput.addEventListener("change", function(){ elementListener(this, CLASS_TEXT); });
	}
	// Select inputs
	var selectInputs = getSelectInputs();
	for (var i = 0 ; i < selectInputs.length ; i++) {
		var selectInput = selectInputs[i];
		selectInput.addEventListener("change", function(){ elementListener(this, CLASS_SELECT); });
	}
	// Languages
	var selects = getLanguageSelects();
	for (var i = 0 ; i < selects.length ; i++) {
		var select = selects[i];
		select.addEventListener("change", function(){ elementListener(this, CLASS_LANGUAGE); });
	}
	// Interests
	var interestElements = document.getElementById(INTERESTS);
	for (var i = 0 ; i < interestElements.length ; i++){
		addInterestListener();	
	}
	// Remove language links
	var removeLanguageLinks = getRemoveLinks(REMOVE_LANGUAGE);
	for (var i = 0 ; i < removeLanguageLinks.length ; i++){
		var removeLanguageLink = removeLanguageLinks[i];
		removeLanguageLink.addEventListener("click", function(){ removeLanguageListener(this); });
	}
	// Remove interest links
	var removeInterestLinks = getRemoveLinks(REMOVE_INTEREST);
	for (var i = 0 ; i < removeInterestLinks.length ; i++){
		var removeInterestLink = removeInterestLinks[i];
		removeInterestLink.addEventListener("click", function(){ removeInterestListener(this); });
	}
	// Add language link
	var addLanguageElement = document.getElementById(ADD_LANGUAGE);
	addLanguageElement.addEventListener("click", addLanguageListener);
	// Add interests link
	var addInterestElement = document.getElementById(ADD_INTEREST);
	addInterestElement.addEventListener("click", addInterestListener);
}