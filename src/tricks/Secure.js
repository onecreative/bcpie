/*
 * "Secure", of the bcpieSDK
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.tricks.Secure = function(selector,settings) {
	defaults = {
		unsecureLinks: true,
		onSessionEnd: '',
		sessionEndRedirect: '',
		securePayments: true
	};
	selector.data('bcpie-secure-settings', $.extend({}, defaults, settings));
	var settings = selector.data('bcpie-secure-settings');

	var blurTime,status,secure = win.location.origin === bcpie.globals.secureDomain,links,href,interval;


	if (settings.securePayments === true) {
		if (selector.find('[name="Amount"]').length > 0 && secure === false) {
			win.location.href = bcpie.globals.secureDomain+bcpie.globals.pageAddress;
		}
	}
	if(settings.onSessionEnd !== '' || settings.sessionEndRedirect !== ''){
		if(bcpie.globals.loginStatus === true) {
			sessionBehavior();
			bindSessionEvents();
		}
	}
	if(settings.unsecureLinks == true) unsecureLinks();

	function unsecureLinks () {
		if (secure === true) {
			links = selector.find('a').not('[href^="mailto:"]').not('[href="/LogOutProcess.aspx"]');
			return links.each(function() {
				href = $(this).attr("href");
				if (href === undefined) {
					href = '';
				}
				if (href.indexOf('http') === -1 && href.indexOf('https') === -1 && href.indexOf('//') === -1 && href.indexOf('#') === -1) {
					if (href.indexOf('/') !== 0) {
						href = '/' + href;
					}
					href = bcpie.globals.primaryDomain + href;
					$(this).attr('href', href);
				}
			});
		}
	}
	function sessionBehavior() {
		$.ajax({
			url: '/',
			type: 'GET',
			success: function(response) {
				if ($(response).filter('#bcmodules').data('bc-loginstatus') === false) {
					if (settings.sessionEndRedirect != '') win.location.href = bcpie.globals.primaryDomain+ settings.sessionEndRedirect;
					if (settings.onSessionEnd != '') executeCallback(window[settings.onSessionEnd]);
					clearInterval(interval);
				}
			}
		});
	}
	function bindSessionEvents (argument) {
		interval = setInterval(function(){sessionBehavior()},900000); // 15min
		$(win).on('focus',function(){
			sessionBehavior();
		});
	}

	function executeCallback(callback){
		if(typeof callback === 'function') {
			var deferred = $.Deferred();
			deferred.resolve(callback());
			return deferred.promise();
		}
	}
}
bcpie.versions.Secure = '2015.01.25';
bcpie.run('Secure');