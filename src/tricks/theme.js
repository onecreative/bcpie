/*
 * "themeClean", of the bcpieSDK
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie
*/

bcpie.tricks.themeClean = function(selector,settings) {
	defaults = {};
	selector.data('bcpie-themeclean-settings', $.extend({}, defaults, settings));
	var settings = selector.data('bcpie-themeclean-settings');

	$('link').filter(function(){
		return $(this).attr('href').toLowerCase().indexOf('.css') > -1;
	}).not(function(){
		return $(this).attr('href').toLowerCase().indexOf('modulestylesheets.css') > -1 || $(this).attr('href').toLowerCase().indexOf('theme.css') > -1;
	}).remove();
}
bcpie.versions.themeClean = '2015.01.25';
bcpie.run('themeClean');