CSS Styles
==========

This folder contains the extension's custom stylesheets. Styles, which are shipped with certain libraries reside in their respective folders. Their definitions may be redefined in the custom files.

file structure
-----------------
* **eexcess.css** This file is the master definition. It contains general layout definitions, like color schemes, fonts, etc
* **sidebar.css** Formats the sidebar element, which is an inframe, injected into the DOM of the current page. A little more CSS, responsible for showing/hiding the sidebar is directly included in /content.js in the function "handleWidgetVisibility"
* **widget.css** Formats the contents of the sidebar, included in /widget/widget.html
* **options.css** Formats the options page. Included in /options/options.html
* **searchResultList.css** Formats the list created by /common_js/searchResultList.js