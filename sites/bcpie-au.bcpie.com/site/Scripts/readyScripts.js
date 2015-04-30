/*
 *
 * readyScripts.js is the place to put all calls that require the DOM to be ready first.
 * When a script begins with $(function) it is the same as $(document).ready(function).
 *
 * Because this self-invoking function begins with $(function), all scripts inside it
 * will automatically inherit that feature. Most site scripts will live in here.
 *
 * readyScripts.js should be placed just before the closing body tag in the document.
 *
 */

$(function() {
	var doc = document, body = $(doc.body), win = window,
	readyScripts = {
		utils: {
			functionName: function() {
				// some code
			}
		},
		ui: {
			functionName: function() {
				// some code
			}
		},
		fixes: {
			functionName: function() {
				// some code
			}
		},
		tweaks: {
			functionName: function() {
				// some code
			}
		}
	};
	readyScripts.utils.functionName();
	readyScripts.ui.functionName();
	readyScripts.tweaks.functionName();
	readyScripts.fixes.functionName();
});