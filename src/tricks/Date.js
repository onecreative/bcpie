/*
 * "Date", of the bcpieSDK
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.tricks.Date = function(selector,settings) {
	defaults = {
		format: 'YYYY',
		add: '',
		subtract: '',
		moment: 'auto',
		utc: false,
		timezone: '',
		ref: 'text', // specify an html attribute (inputs will assume 'text' means 'value'). You can also say 'now' to use the current date and time.
		target: 'text', // specify an html attribute (inputs will default to 'value'). Separate multiple targets with commas.
		event: 'load' // specify the window event that triggers Date's behavior
	};
	selector.data('bcpie-date-settings', $.extend({}, defaults, settings));
	var settings = selector.data('bcpie-date-settings');

	if (settings.add !== '') settings.add = $.parseJSON(bcpie.utils.jsonify(settings.add));
	if (settings.subtract !== '') settings.subtract = $.parseJSON(bcpie.utils.jsonify(settings.subtract));

	var ref,value,targets,parseFormat,order;

	function runDate() {
		// determine the reference
		if (settings.ref === 'text' && selector.is('input')) settings.ref = 'value';
		ref = (settings.ref === 'text') ? selector.text() : selector.prop(settings.ref);

		if(settings.ref === 'now') value = moment();
		else if (ref !== '') {
			if (settings.moment === 'auto' && $.isNumeric(ref) && ref.length === 10) {
				if (settings.utc === true) value = moment.utc(moment.unix(ref)).local();
				else value = moment.unix(ref);
			}else {
				if (typeof bcpie.globals.countryCode === 'undefined') bcpie.globals.countryCode = 'US';
				switch(bcpie.globals.countries[bcpie.globals.countryCode].ContinentCode) {
					case 'NA': order = 'MDY'; break;
					default: order = 'DMY';
				}
				parseFormat = (settings.moment === 'auto') ? moment.parseFormat(ref,{preferredOrder: order}) : settings.moment;
				value = moment(ref,parseFormat);
			}

			if (value.isAfter(moment()) && ref.match(/(?:\/|-)([0-9]{2})$/)) value = value.subtract('year',100);
		}
		if (settings.timezone !== '') value.tz(settings.timezone);
		if (typeof value !== 'undefined' && value._isAMomentObject === true) {
			value = value.add(settings.add).subtract(settings.subtract).format(settings.format);

			targets = settings.target.split(',');
			for (var i=0; i<targets.length; i++) {
				if (targets[i] === 'text' && selector.is('input')) targets[i] = 'value';
				(targets[i] === 'text') ? selector.text(value) : selector.prop(targets[i],value);
			}
		}
	}
	runDate();
	if (settings.event !== 'load') {
		body.on(settings.event, selector, function() {
			runDate();
		});
	}
}
bcpie.versions.Date = '2015.01.26';
bcpie.run('Date');