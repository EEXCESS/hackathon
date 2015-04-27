/**
 * Provides methods to manage the languages. 
 * @class languages
 */

/**
 * TODO
 * @returns
 * @method getLanguageSelects
 */
function getLanguageSelects(){
	return document.getElementsByClassName(CLASS_LANGUAGE);
}

/**
 * TODO
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
 * TODO
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
 * TODO
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
 * TODO
 * @param index
 * @param label
 * @param skill
 * @returns {String}
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
 * TODO
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
 * TODO
 * @param link
 * @method removeLanguageListener
 */
function removeLanguageListener(link){
	resetElementPolicy(link, LANGUAGE_POLICY, DEFAULT_POLICY_LEVEL);
	removeElement(link, LANGUAGE);
	saveLanguages();
}

/**
 * TODO
 * @method addLanguageListener
 */
function addLanguageListener(){ 
	addNewLanguage(); 
}