/*
 * "Foundation". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie
*/

bcpie.extensions.tricks.Foundation = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Foundation',
		version: '2015.01.31',
		defaults: {
			feature: null
		}
	});

	if (settings.feature === 'topbar') {
		selector.find('li').filter(function(){
			return $(this).children('ul').length > 0 && !$(this).is('.has-dropdown');
		}).addClass('has-dropdown');
		selector.find('.has-dropdown').filter(function(){
			return $(this).children('.dropdown').length === 0;
		}).removeClass('has-dropdown');
	}
};