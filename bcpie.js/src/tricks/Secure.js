/*
 * Secure
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Secure = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Secure',
		version: '2017.03.15',
		defaults: {
			unsecureLinks: true,
			onSessionEnd: '', // callback function to call when a session ends.
			sessionEndRedirect: '', // site relative url of a page to redirect to when a session ends.
			memberProcessRedirect: '', // site relative url of a page to redirect to after a user updates their profile. 'same' points it back to the page where submission occurred.
			securePayments: true, // forces a non-secure page to reload on the secure domain if it has an Amount field.
			logoutPage: '', // site relative url or 'same' to indicate where to redirect to after a logout link is clicked.
			detectUser: false, // creates a cookie that remembers a user's first name.
			securePages: '' // comma separated list of relative links that should be secure
		}
	});

	var blurTime,status,secure = win.location.origin === settings.secureDomain,links,href,interval,makeSecure;
	settings.securePages = settings.securePages.split(',');

	if (secure === false) {
		if (settings.securePayments === true && selector.find('[name="Amount"]').length > 0) makeSecure = true;
		else if (settings.securePages !== '' && settings.securePages.indexOf(settings.pageAddress) > 0) makeSecure = true;

		if (makeSecure === true) win.location.href = settings.secureDomain+settings.pageAddress;
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
	if (settings.memberProcessRedirect !== '' && bcpie.globals.path === '/memberprocess.aspx') {
		if (settings.memberProcessRedirect === 'same') win.location.href = doc.referrer;
		else win.location.href = settings.memberProcessRedirect;
	}

	function updateCookie(property,value) {
		Cookies(bcpie.globals.site.host+'-'+property,value,{expires: 365,path: '/'});
	}
	function unsecureLinks () {
		if (secure === true) {
			links = selector.find('a').not('[href^="mailto:"]').not('[href="/LogOutProcess.aspx"]').not('[href^="javascript:"]');
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
			url: '/_system/apps/bcpie-bcpie/public/utilities/ajax/loggedinstatus.html',
			type: 'GET',
			success: function(response) {
				onAutoLogout(response);
			},
			error: function() {
				$.ajax({
					url: '/',
					type: 'GET',
					success: function(response) {
						onAutoLogout(response);
					}
				});
			}
		});
	}
	function onAutoLogout (response) {
		if ($(response).filter('[data-loggedin]').data('loggedin') === false) {
			if (settings.onSessionEnd !== '') bcpie.utils.executeCallback({
				selector: selector,
				callback: settings.onSessionEnd
			});
			if (settings.sessionEndRedirect !== '') win.location.href = settings.primaryDomain+settings.sessionEndRedirect;
			clearInterval(interval);
		}
	}
	function bindSessionEvents (argument) {
		interval = setInterval(function(){sessionBehavior();},900000); // 15min
		$(win).on('focus',function(){
			sessionBehavior();
		});
	}
};