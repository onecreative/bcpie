/*
 * "Utility". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Utility = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Utility',
		version: '2015.02.05',
		defaults: {
			setValue: '',
			getList: '', // options are countries, timezones.
		}
	});

	function setValue() {
		if (selector.is('select')) {
			selector.find('option').filter(function(){
				return $(this).is('[value="'+settings.setValue+'"]');
			}).attr('selected','selected').prop('selected',true);
		}else if (selector.is('input[type=text]') || selector.is('textarea')) {
			selector.val(settings.setValue);
		}else if (selector.is('input[type=radio]')) {
			selector.closest('form').find('[name="'+selector.attr('name')+'"]').filter(function(){
				return $(this).is('[value="'+settings.setValue+'"]');
			}).attr('checked','checked').prop('checked',true);
		}else if (selector.is('input[type=checkbox]')) {
			settings.setValue = settings.setValue.split(',');
			for (var i=0; i<settings.setValue.length; i++) {
				selector.closest('form').find('[name="'+selector.attr('name')+'"]').filter('[value="'+settings.setValue[i]+'"]').attr('checked','checked').prop('checked',true);
			}
		}
	}
	if (settings.getList !== '') {
		var list='';
		if (settings.getList.toLowerCase() === 'countries') {
			if (typeof body.data('bcCountries') === 'undefined') body.data('bcCountries',settings.countries);
			var countryData = body.data('bcCountries');
			for (var cc in countryData) {
				if (countryData.hasOwnProperty(cc)) {
					if (selector.is('select')) list += '<option value="'+cc+'">'+countryData[cc].Country+'</option>';
				}
			}
		}else if (settings.getList.toLowerCase() === 'timezones') {
			if (typeof body.data('bcTimezones') === 'undefined') body.data('bcTimezones',moment.tz.names());
			var zoneData = body.data('bcTimezones');
			for (var i=0; i<zoneData.length; i++) {
				if (selector.is('select')) list += '<option value="'+zoneData[i]+'">'+zoneData[i]+'</option>';
			}
		}
		selector.append(list);
		if (settings.setValue !== '') setValue();

	}else if (settings.setValue !== '') setValue();
};