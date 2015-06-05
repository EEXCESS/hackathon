/**
 * Provides methods to manage the languages. 
 * @class languages
 */

/**
 * Retrieves all the nodes embedding a fields related to the languages. 
 * @returns {ListNode} List of languages inputs.
 * @method getLanguageSelects
 */
function getLanguageSelects(){
	return document.getElementsByClassName(CLASS_LANGUAGE);
}

/**
 * Initializes the languages with the values from the data store. 
 * It generates the HTML code, initializes the fields, adds the listeners and initializes the buttons. 
 * @method initLanguages
 */
function initLanguages(){
	var languages = getStoredJson(LANGUAGES);
	var languagesElement = document.getElementById(LANGUAGES);
	for (var i = 0 ; i < languages.length ; i++){
		var language = languages[i];
		var label = language.languageLabel;
		var skill = language.languageSkill;
		var code = generateCodeLanguage(i, label, skill);
		languagesElement.innerHTML = languagesElement.innerHTML + code;
	}
}

/**
 * Adds a language: generates the HTML code, adds the listeners, initializes the buttons, saves the interests and update the listeners.
 * @method addNewLanguage
 */
function addNewLanguage(){
	var languagesElement = document.getElementById(LANGUAGES);
	var nbLanguages = languagesElement.children.length;
	var code = generateCodeLanguage(nbLanguages, null, null);
	languagesElement.innerHTML = languagesElement.innerHTML + code;
	// Initialize the buttons
	var policyElement = document.getElementById(LANGUAGE_POLICY + nbLanguages);
	initButtonGroup(policyElement);
	// Save all the languages
	saveLanguages();
	// Add listeners
	updateLanguageListeners();
}

/**
 * Updates the listeners for all the languages: 
 * field listeners, listener for the removal of a language, and buttons listeners. 
 * @method updateLanguageListeners
 */
function updateLanguageListeners(){
	var languageElements = document.getElementById(LANGUAGES).children;
	var nbLanguages = languageElements.length;
	for (var i = 0 ; i < nbLanguages ; i++){
		var languageElement = languageElements[i];
		var languageId = languageElement.getAttribute("id");
		var languageIdNum = extractEndingNumber(languageId); 
		var selectLabelElement = document.getElementById(LANGUAGE_LABEL_INPUT + languageIdNum);
		selectLabelElement.addEventListener("change", function(){ elementListener(this, CLASS_LANGUAGE); }); 
		var selectSkillElement = document.getElementById(LANGUAGE_SKILL_INPUT + languageIdNum);
		selectSkillElement.addEventListener("change", function(){ elementListener(this, CLASS_LANGUAGE); }); 
		var removeLanguageElement = document.getElementById(REMOVE_LANGUAGE + languageIdNum);
		removeLanguageElement.addEventListener("click", function(){ removeLanguageListener(this); }); 
		var policyLanguageElement = document.getElementById(LANGUAGE_POLICY + languageIdNum);
		for (var j = 0 ; j < policyLanguageElement.children.length ; j++){
			var button = policyLanguageElement.children[j];
			button.addEventListener("click", function(){ policyButtonListener(this); });
		}
	}
}

/**
 * Generate the HTML code to insert a new language. 
 * @param {Integer} index Index of the interest to add. 
 * @param {String} label Label of the language (e.g., English, French). 
 * @param {String} skill Level of skill for the aforementioned languages (e.g., Fluent, Intermediate). 
 * @returns {String} HTML code. 
 * @method generateCodeLanguage
 */
function generateCodeLanguage(index, label, skill){
	var code = 	'<div id="' + LANGUAGE + index + '" class="row">\n';
	code += 	'	<div class="panel-body">\n';
	code += 	'		<div class="col-md-6">\n';
	code += 	'			<div class="row">\n';
	code += 	'				<div class="col-md-1">\n';
	code += 	'					<div class="panel-body">\n';
	code += 	'						<a id="' + REMOVE_LANGUAGE + index +'" class="' + REMOVE_LANGUAGE + '" style="color: red;" href="#x"><span class="glyphicon glyphicon-remove"></span></a>\n';
	code += 	'					</div>\n';
	code += 	'				</div>\n';
	code += 	'				<div class="col-md-11 row">\n';
	code += 	'					<div class="col-md-6">\n';
	code += 	'						<div class="input-group">\n';
	code += 	'							<span class="input-group-addon"><span class="glyphicon glyphicon-stats"></span></span>\n';
	code += 	'							<select id="' + LANGUAGE_LABEL_INPUT + index + '" class="form-control ' + CLASS_LANGUAGE + '">\n';
	for (var i = 0 ; i < TAB_LANGUAGE_LABELS.length ; i++){
		var currentLabel = TAB_LANGUAGE_LABELS[i];
		var selected = "";
		var cond1 = (label != null) && (currentLabel == label);
		var cond2 = (label == null) && (i == DEFAULT_LANGUAGE_LABEL_INDEX);
		if (cond1 || cond2){
			selected = " selected=\"selected\"";
		} 
		code += '								<option value="' + currentLabel + '"' + selected + '>' + currentLabel + '</option>\n';
	}	
	code += 	'							</select>\n';
	code += 	'						</div>\n';
	code += 	'					</div>\n';
	code += 	'					<div class="col-md-6"> \n';
	code += 	'						<div class="input-group">\n';
	code += 	'							<span class="input-group-addon"><span class="glyphicon glyphicon-stats"></span></span>\n';
	code += 	'							<select id="' + LANGUAGE_SKILL_INPUT + index + '" class="form-control ' + CLASS_LANGUAGE + '">\n';
	for (var i = 0 ; i < TAB_LANGUAGE_SKILLS.length ; i++){
		var currentSkill = TAB_LANGUAGE_SKILLS[i];
		var selected = ""; 
		var cond1 = (skill != null) && (currentSkill == skill);
		var cond2 = (skill == null) && (i == DEFAULT_LANGUAGE_SKILL_INDEX);
		if (cond1 || cond2){
			selected = " selected=\"selected\"";
		}
		code += '								<option value="' + currentSkill + '"' + selected + '>' + currentSkill + '</option>\n';
	}
	code +=			'						</select>\n';
	code += 	'						</div>\n';
	code += 	'					</div>\n';
	code += 	'				</div>\n';
	code += 	'			</div>\n';
	code += 	'		</div>\n';
	code += 	'		<div id="' + LANGUAGE_POLICY + index + '" class="btn-group col-md-2" role="group">\n';
	code += 	'			<button type="button" class="btn ' + BUTTON_STYLE_GREY + ' ' + CLASS_BUTTON + '" ' + PARENT_ID + '="' + LANGUAGE_POLICY + index + '">Hidden</button>\n';
	code += 	'			<button type="button" class="btn ' + BUTTON_STYLE_GREY + ' ' + CLASS_BUTTON + '" ' + PARENT_ID + '="' + LANGUAGE_POLICY + index + '">Disclosed</button>\n';
	code += 	'		</div>\n';
	code += 	'		<div class="col-md-4">Value shared with the system: \n';
	code += 	'			<span id="' + LANGUAGE_LABEL_DISPLAY + index + '"></span>\n';
	code += 	'			<span id="' + LANGUAGE_SKILL_DISPLAY + index + '"></span>\n';
	code += 	'		</div>\n';
	code += 	'	</div>\n';
	code += 	'</div>\n';
	return code;
}

/**
 * Saves all the languages: extract the values from the form and store it in the data store. 
 * @method saveLanguages
 */
function saveLanguages(){
	var languagesElement = document.getElementById(LANGUAGES);
	var languageElements = languagesElement.children;
	var languages = [];
	for (var i = 0 ; i < languageElements.length ; i++){
		var language = new Object();
		var languageElement = languageElements[i];
		var languageId = languageElement.getAttribute("id");
		var num = extractEndingNumber(languageId); 
		
		var languageLabel = document.getElementById(LANGUAGE_LABEL_INPUT + num);
		var label = languageLabel.options[languageLabel.selectedIndex].value;
		language[LANGUAGE_LABEL] = label;
		
		var languageSkill = document.getElementById(LANGUAGE_SKILL_INPUT + num);
		var skill = languageSkill.options[languageSkill.selectedIndex].value;
		language[LANGUAGE_SKILL] = skill;
		
		languages.push(language);
	}
	storeValue(LANGUAGES, JSON.stringify(languages));
}

/**
 * Removes the listener assigned to a link element. 
 * This method is used when a language is removed to make sure the removal is done properly. 
 * It resets the policy level, remove the HTML code, and save the languages. 
 * @param {Element} link Element corresponding to the link. 
 * @method removeLanguageListener
 */
function removeLanguageListener(link){
	resetElementPolicy(link, LANGUAGE_POLICY, DEFAULT_POLICY_LEVEL);
	removeElement(link, LANGUAGE);
	saveLanguages();
}

/**
 * Listener invoked when a language must be added. 
 * @method addLanguageListener
 */
function addLanguageListener(){ 
	addNewLanguage(); 
}