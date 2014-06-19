CSS Styles
==========

This folder contains the extension's custom stylesheets. Styles, which are shipped with certain libraries reside in their respective folders. Their definitions may be redefined in the custom files.
Some visualizations may define color schemes or similar directly within the javascript code.

file structure
-----------------
* **eexcess.css** This file is the master definition. It contains general layout definitions, like color schemes, fonts, etc
* **sidebar.css** Formats the sidebar element, which is an inframe, injected into the DOM of the current page. A little more CSS, responsible for showing/hiding the sidebar is directly included in /content.js in the function "handleWidgetVisibility"
* **widget.css** Formats the contents of the sidebar, included in /widget/widget.html
* **options.css** Formats the options page. Included in /options/options.html
* **searchResultList.css** Formats the list created by /common_js/searchResultList.js

If you add a file to this folder, please add a small description to the list above, indicate where the file is used and if configurations are necessary in the javascript code, please indicate this as well.