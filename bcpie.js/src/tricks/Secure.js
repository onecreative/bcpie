/*
 * Secure
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Secure = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Secure',
		version: '2015.08.18',
		defaults: {
			unsecureLinks: true,
			onSessionEnd: '',
			sessionEndRedirect: '',
			securePayments: true,
			logoutPage: '',
			detectUser: false
		}
	});

	var blurTime,status,secure = win.location.origin === settings.secureDomain,links,href,interval;

	if (settings.securePayments === true) {
		if (selector.find('[name="Amount"]').length > 0 && secure === false) {
			win.location.href = settings.secureDomain+settings.pageAddress;
		}
	}
	if (settings.onSessionEnd !== '' || settings.sessionEndRedirect !== '') {
		if(settings.user.isLoggedIn === true) {
			sessionBehavior();
			bindSessionEvents();
		}
	}
	if (settings.unsecureLinks === true) unsecureLinks();

	if (settings.logoutPage !== '') {
		body.find('a').filter(function(){
			return this.href.toLowerCase().indexOf('/logoutprocess.aspx') > -1 ;
		}).on('click', function(event) {
			event.preventDefault();
			$.ajax({
				url: '/logoutprocess.aspx'
			}).done(function() {
				if (settings.logoutPage === 'same') doc.location.reload();
				else win.location.href = settings.logoutPage;
			});
		});
	}

	if (settings.detectUser === true) {
		if (bcpie.globals.user.isLoggedIn) {
			updateCookie('firstname',globals.user.firstname);
		}
	}

	function updateCookie(property,value) {
		$.cookie(bcpie.globals.site.host+'-'+property,value,{expires: 365,path: '/'});
	}

	function unsecureLinks () {
		if (secure === true) {
			links = selector.find('a').not('[href^="mailto:"]').not('[href="/LogOutProcess.aspx"]');
			for (var i=0; i<links.length; i++) {
				href = $(links[i]).attr("href") || '';
				if (href.indexOf('http') === -1 && href.indexOf('//') === -1 && href.indexOf('#') === -1) {
					href = (href.indexOf('/') !== 0) ? settings.primaryDomain+'/'+href : settings.primaryDomain+href;
					$(links[i]).attr('href', href);
				}
			}
		}
	}
	function sessionBehavior() {
		$.ajax({
			url: '/',
			type: 'GET',
			success: function(response) {
				if ($(response).filter('[data-isloggedin]').data('isloggedin') === 0) {
					if (settings.sessionEndRedirect !== '') win.location.href = settings.primaryDomain+settings.sessionEndRedirect;
					if (settings.onSessionEnd !== '') executeCallback(window[settings.onSessionEnd]);
					clearInterval(interval);
				}
			}
		});
	}
	function bindSessionEvents (argument) {
		interval = setInterval(function(){sessionBehavior();},900000); // 15min
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
};