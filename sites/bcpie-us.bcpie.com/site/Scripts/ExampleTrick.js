/*
 * "ExampleTrick". An awesome trick for BC Pie.
 * http://bcpie.com
 * No copyright
 * This trick is being used on /news.htm
*/

bcpie.extensions.tricks.ExampleTrick = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'ExampleTrick',
		version: '2015.02.09',
		defaults: {

		}
	});

	selector.on('click','td.events', function() {
		if (!$(this).is('.open')) $(this).addClass('open').prepend('<span class="close">x</span>');
	});
	selector.on('click','.close', function(event) {
		event.stopPropagation();
		$(this).hide().parent('td').removeClass('open');
		$(this).remove();
	});
};