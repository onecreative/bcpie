function theme(selector,settings) {
	defaults = {};
	selector.data(bc.settingsAttr, $.extend({}, defaults, settings));
	var settings = selector.data(bc.settingsAttr);

	$('link').filter(function(){
		return $(this).attr('href').toLowerCase().indexOf('.css') > -1;
	}).not(function(){
		return $(this).attr('href').toLowerCase().indexOf('modulestylesheets.css') > -1 || $(this).attr('href').toLowerCase().indexOf('theme.css') > -1;
	}).remove();
}
bcpie.versions.theme = '2015.01.25';
bcpie.trick('theme');