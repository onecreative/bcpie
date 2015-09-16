/*
 * Date
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Date = function(selector,options){
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Date',
		version: '2015.09.16',
		defaults: {
			format: 'YYYY',
			add: '',
			subtract: '',
			moment: 'auto',
			utc: false,
			fromZone: 'local', // specify a valid timezone string (like America/Denver) or use 'local' to automatically detect it. Default is 'local'.
			toZone: '', // specify a valid timezone string (like America/Denver) or use 'local' to automatically detect it
			ref: 'text', // specify an html attribute (inputs will assume 'text' means 'value'). You can also say 'now' to use the current date and time.
			target: 'text', // specify an html attribute (inputs will default to 'value'). Separate multiple targets with commas.
			event: 'load', // specify the window event that triggers Date's behavior
			locale: 'off' // 'off' uses the site's language, 'auto' finds the user's language, or you can specify with a locale abbreviation.
		}
	});

	if (settings.locale === 'off') settings.locale = bcpie.globals.site.language.toLowerCase();
	else if (settings.locale === 'auto') settings.locale = (navigator.languages) ? navigator.languages[0] : (navigator.language || navigator.userLanguage);

	if (settings.add !== '') settings.add = $.parseJSON(bcpie.utils.jsonify(settings.add));
	if (settings.subtract !== '') settings.subtract = $.parseJSON(bcpie.utils.jsonify(settings.subtract));

	var ref,value,targets,parseFormat,order;

	function initLangSupport() {
		if (moment.localeData('es') !== null) { // check for the existence of language data other than 'en'
			moment.locale(settings.locale);
			runDate();
		}else {
			setTimeout(initLangSupport, 100);
		}
	}
	function runDate() {
		// determine the reference
		if (settings.ref === 'text' && selector.is('input')) settings.ref = 'value';
		ref = (settings.ref === 'text') ? selector.text() : selector.prop(settings.ref);

		if (settings.ref === 'now') {
			if (settings.fromZone !== 'local' && settings.fromZone !== '') {
				value = moment.tz(settings.fromZone);
			}else {
				value = moment();
			}
		}

		else if (ref !== '') {
			if (settings.moment === 'auto' && $.isNumeric(ref) && ref.length === 10) {
				if (settings.utc === true) value = moment.utc(moment.unix(ref)).local();
				else value = moment.unix(ref);
			}else {
				if (typeof settings.site.countryCode === 'undefined') settings.site.countryCode = 'US';
				switch(settings.site.countryCode) {
					case 'US': order = 'MDY'; break;
					default: order = 'DMY';
				}
				parseFormat = (settings.moment === 'auto') ? moment.parseFormat(ref,{preferredOrder: order}) : settings.moment;
				if (settings.fromZone !== 'local') {
					value = moment.tz(ref,parseFormat,settings.fromZone);
				}else {
					value = moment(ref,parseFormat);
				}
			}

			if (!ref.match(/[0-9]{4}/) && value.isAfter(moment().add(5,'year')) && ref.match(/(?:\/|-)([0-9]{2})$/)) {
				value = value.subtract(100,'year');
			}
		}

		if (typeof value !== 'undefined' && value._isAMomentObject === true) {
			value = value.add(settings.add).subtract(settings.subtract);

			if (settings.toZone !== '') {
				if (settings.toZone === 'local' || settings.toZone === '') value = value.utc().local().format(settings.format);
				else value = value.utc().tz(settings.toZone).format(settings.format);
			}else value = value.format(settings.format);

			targets = settings.target.split(',');
			for (var i=0; i<targets.length; i++) {
				if (targets[i] === 'text' && selector.is('input')) targets[i] = 'value';
				(targets[i] === 'text') ? selector.text(value) : selector.prop(targets[i],value);
			}
		}
	}

	// Initialize Language Support
	if (settings.locale !== 'en') {
		var src = '//cdn.jsdelivr.net/momentjs/'+moment.version+'/locales.min.js';
		if ($(doc).find('script[src="'+src+'"]').length === 0) {
			var momentLocale = document.createElement('script');
			momentLocale.type = 'text/javascript';
			momentLocale.async = true;
			momentLocale.src = src;
			(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(momentLocale);
		}
		initLangSupport();
	}else runDate();

	if (settings.event !== 'load') {
		body.on(settings.event, selector, function() {
			runDate();
		});
	}

};