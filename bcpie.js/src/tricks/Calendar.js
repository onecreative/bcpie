/*
 * "Calendar". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie
*/

bcpie.extensions.tricks.Calendar = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Calendar',
		version: '2015.02.01',
		defaults: {
			template: null, // also: 'this' (uses contents of selector), a css selector (uses contents of specified element on the page), or a path (uses contents of specified page retrieved via Ajax)
			pathContainer: '.calendar', // the containing element for the calendar template when 'template' is set to a path
			weekOffset: 0, // 0 starts the week on Sunday
			startWithMonth: 'now',
			click: null, // specify a function to run when this event is fired. Returns a 'target' object containing the DOM element, any events, and the date as a moment.js object.
			nextMonth: null, // specify a function to run when this event is fired. Fired when a user goes forward a month. returns a moment.js object set to the correct month.
			previousMonth: null, // specify a function to run when this event is fired. Fired when a user goes back a month. returns a moment.js object set to the correct month.
			onMonthChange: null, // specify a function to run when this event is fired. Fired when a user goes back OR forward a month. returns a moment.js object set to the correct month.
			today: null, // specify a function to run when this event is fired. Fired when a user goes to the current month/year. returns a moment.js object set to the correct month.
			nextButton: 'clndr-next-button', // the target classnames that CLNDR will look for to bind events. these are the defaults.
			previousButton: 'clndr-previous-button', // the target classnames that CLNDR will look for to bind events. these are the defaults.
			todayButton: 'clndr-today-button', // the target classnames that CLNDR will look for to bind events. these are the defaults.
			day: 'day', // the target classnames that CLNDR will look for to bind events. these are the defaults.
			empty: 'empty', // the target classnames that CLNDR will look for to bind events. these are the defaults.
			events: null, //
			dateParameter: 'date', // if you're supplying an events array, dateParameter points to the field in your event object containing a date string. It's set to 'date' by default.
			showAdjacentMonths: true, // show the numbers of days in months adjacent to the current month (and populate them with their events). defaults to true.
			adjacentDaysChangeMonth: true, // when days from adjacent months are clicked, switch the current month. Fires nextMonth/previousMonth/onMonthChange click callbacks. defaults to true.
			doneRendering: null, // a callback when the calendar is done rendering. This is a good place to bind custom event handlers.
		}
	});

	// Assign the template variable
	var template;
	if (settings.template === 'this') template = selector.html();
	else if (settings.template.indexOf('/') > -1) {
		$.ajax({
			url: settings.template,
			dataType: 'html'
		}).done(function (response) {
			response = $(response);
			if (response.is(pathContainer)) template = response.html();
			else template = response.find(pathContainer).html();
		});

	}else template = body.find(settings.template).html();
	if (typeof template === 'undefined' || template.length === 0 || settings.template === null ) {
		template = '<div class="clndr-grid">'+
						'<div class="days-of-the-week clearfix">'+
							'<% _.each(daysOfTheWeek, function(day) { %>'+
								'<div class="header-day"><%= day %></div>'+
							'<% }); %>'+
						'</div>'+
						'<div class="days clearfix">'+
							'<% _.each(days, function(day) { %>'+
								'<div class="<%= day.classes %>" id="<%= day.id %>">'+
									'<span class="day-number"><%= day.day %></span>'+
								'</div>'+
							'<% }); %>'+
						'</div>'+
					'</div>';
	}

	// Parse the formatting for date strings, and then create a moment
	function makeMoment(string) {
		if (typeof settings.site.countryCode === 'undefined') settings.site.countryCode = 'US';
		switch(settings.countries[settings.site.countryCode].ContinentCode) {
			case 'NA': order = 'MDY'; break;
			default: order = 'DMY';
		}
		return moment(string,moment.parseFormat(ref,{preferredOrder: order}));
	}

	// Setup the event callbacks
	var clickEvents = {};
	if (settings.click !== null && typeof win[settings.click] === 'function') clickEvents.click = win[settings.click]();
	if (settings.nextMonth !== null && typeof win[settings.nextMonth] === 'function') clickEvents.nextMonth = win[settings.nextMonth]();
	if (settings.previousMonth !== null && typeof win[settings.previousMonth] === 'function') clickEvents.previousMonth = win[settings.previousMonth]();
	if (settings.onMonthChange !== null && typeof win[settings.onMonthChange] === 'function') clickEvents.onMonthChange = win[settings.onMonthChange]();
	if (settings.today !== null && typeof win[settings.today] === 'function') clickEvents.today = win[settings.today]();

	return selector.clndr({
		template: template,
		weekOffset: settings.weekOffset,
		startWithMonth: makeMoment(settings.startWithMonth),
		clickEvents: clickEvents,
		targets: {
			nextButton: settings.nextButton,
			previousButton: settings.previousButton,
			todayButton: settings.todayButton,
			day: settings.day,
			empty: settings.empty
		},
	});
};