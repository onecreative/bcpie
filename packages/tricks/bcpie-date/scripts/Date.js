/*
 * Date
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Date = function(selector,options){
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Date',
		version: '2017.01.03',
		defaults: {
			format: 'YYYY', // use Moment parsing, 'calendar', or 'utc'
			add: '',
			subtract: '',
			moment: 'auto',
			utc: false, // deprecated in favor of format:utc;
			fromZone: 'local', // specify a valid timezone string (like America/Denver) or use 'local' to automatically detect it. Default is 'local'.
			toZone: '', // specify a valid timezone string (like America/Denver) or use 'local' to automatically detect it
			ref: 'text', // specify an html attribute (inputs will assume 'text' means 'value'). You can also say 'now' to use the current date and time.
			target: 'text', // specify an html attribute (inputs will default to 'value'). Separate multiple targets with commas.
			event: undefined, // specify the window event that triggers Date's behavior.
			triggerOnLoad: true, // determines if the trick fires on page load.
			locale: 'off', // 'off' uses the site's language, 'auto' finds the user's language, or you can specify with a locale abbreviation.
			triggeredEvent: 'change', // specify an event to trigger when the trick is finished.
			eventNamespace: 'date' // specify a suffix to add to triggeredEvent (event.suffix).
		}
	});

	var ref,value,targets,parseFormat,order,addSplit,subtractSplit;

	if (settings.eventNamespace !== '') settings.eventNamespace = '.'+settings.eventNamespace;

	if (settings.locale === 'off') settings.locale = bcpie.globals.site.language.toLowerCase();
	else if (settings.locale === 'auto') settings.locale = (navigator.languages) ? navigator.languages[0] : (navigator.language || navigator.userLanguage);

	if (settings.add !== '') {
		addSplit = settings.add.split(',');
		for (var i = 0; i < addSplit.length; i++) {
			if ($.isNumeric(addSplit[i].charAt(0))) {
				if (addSplit[i].split(':').length === 2) addSplit[i] = addSplit[i].split(':')[1]+':'+addSplit[i].split(':')[0];
				else addSplit[i] = 'years:'+addSplit[i];
			}
		}
		addSplit = addSplit.join(',');
		settings.add = $.parseJSON(bcpie.utils.jsonify(addSplit));
	}
	if (settings.subtract !== '') {
		subtractSplit = settings.subtract.split(',');
		for (var i = 0; i < subtractSplit.length; i++) {
			if ($.isNumeric(subtractSplit[i].charAt(0))) {
				if (subtractSplit[i].split(':').length === 2) subtractSplit[i] = subtractSplit[i].split(':')[1]+':'+subtractSplit[i].split(':')[0];
				else subtractSplit[i] = 'years:'+subtractSplit[i];
			}
		}
		subtractSplit = subtractSplit.join(',');
		settings.subtract = $.parseJSON(bcpie.utils.jsonify(subtractSplit));
	}

	if (settings.utc === true) settings.format = 'utc';

	function initLangSupport() {
		if (moment.localeData(settings.locale) !== null) { // check for the existence of language data other than 'en'
			moment.locale(settings.locale);
		}else setTimeout(initLangSupport, 100);
	}
	function runDate(load) {
		if (typeof load === 'undefined') load = false;
		
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
				if (settings.format === 'utc') value = moment.utc(moment.unix(ref)).local();
				else value = moment.unix(ref);
			}else {
				if (typeof settings.site.countryCode === 'undefined') settings.site.countryCode = 'US';
				switch(settings.site.countryCode) {
					case 'US': order = 'MDY'; break;
					default: order = 'DMY';
				}
				if (settings.moment === 'auto') parseFormat = (ref.match(/[0-9]{4}(-[0-9]{2}){2}T[0-9]{2}(:[0-9]{2}){2}(\+|-)[0-9]{2}:[0-9]{2}/)) ? 'YYYY-MM-DD[T]HH:mm:ssZZ;' : moment.parseFormat(ref,{preferredOrder: order});
				else parseFormat = settings.moment;
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
				if (settings.toZone === 'local' || settings.toZone === '') {
					value = value.tz(moment.tz.guess());
				}else value = value.tz(settings.toZone);
			}

			if (settings.format === 'calendar') value = value.calendar();
			else if (settings.format === 'utc') value = value.utc().format();
			else value = value.format(settings.format);

			targets = settings.target.split(',');
			for (var i=0; i<targets.length; i++) {
				if (targets[i] === 'text' && selector.is('input,textarea')) targets[i] = 'value';
				if (targets[i] === 'text') selector.text(value);
				else selector.prop(targets[i],value);
				if (load === false) selector.trigger(settings.triggeredEvent+settings.eventNamespace);
			}
		}
	}

	// Initialize Language Support
	if (moment.localeData(settings.locale) === null) {
		var src = '//cdn.jsdelivr.net/momentjs/'+moment.version+'/locales.min.js';
		if ($(doc).find('script[src="'+src+'"]').length === 0) {
			var momentLocale = document.createElement('script');
			momentLocale.type = 'text/javascript';
			momentLocale.async = true;
			momentLocale.src = src;
			(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(momentLocale);
		}
	}
	initLangSupport();

	if (settings.triggerOnLoad === true) runDate(true);
	if (typeof settings.event !== 'undefined') {
		selector.on(settings.event, function() {
			runDate();
		});
	}
};