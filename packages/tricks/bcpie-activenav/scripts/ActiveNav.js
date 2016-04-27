/*
 * "ActiveNav". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.ActiveNav = function(selector,options,settings) {
	settings = bcpie.extensions.settings(selector,options,{
		name: 'ActiveNav',
		version: '2016.4.25',
		defaults: {
			navClass: 'activenav',
			activeClass: 'active',
			level: 1, // specify a number
			levelClass: 'level',
			lastLevel: 0, // specify a number. 0 will turn off limiting.
			lastLevelClass: 'lastlevel',
			currentActiveClass: 'current',
			levelTitle: false,
			levelTitleClass: 'leveltitle',
			unlinkTitle: false,
			onlyLevelTitle: false,
			removeHidden: true,
			activeHash: false,
			hashSupport: true,
			hashOffset: 30,
			removeClass: '',
			paramSupport: true,
			bubble: true,
			crumbs: false
		}
	});

	// vars
	var shortPath = settings.path.toLowerCase() + win.location.search.toLowerCase() + settings.hash.toLowerCase(),
		activeLinks, currentLink, gotIt = 0, first, segment, last, currentHash, crumbs;

	settings.navClass = classObject(settings.navClass);
	settings.activeClass = classObject(settings.activeClass);
	settings.levelClass = classObject(settings.levelClass);
	settings.lastLevelClass = classObject(settings.lastLevelClass);
	settings.levelTitleClass = classObject(settings.levelTitleClass);
	settings.removeClass = classObject(settings.removeClass);
	settings.primaryDomain = settings.primaryDomain.replace('http:','');
	settings.secureDomain = settings.secureDomain.replace('https:','');
	settings.currentActiveClass = classObject(settings.currentActiveClass);


	function classObject(classes) {
		return {
			names: classes,
			selector: '.'+classes.replace(/ /g,'.')
		};
	}
	function makeActive(activeLinks, first) {
		for(var i=0, len = $(activeLinks).size(); i<len;i++){
			var _this = activeLinks[i];
			if (settings.bubble === false) {
				$(_this).parent('li').addClass(settings.activeClass.names);
			}else {
				$(_this).parentsUntil(first, 'li').addClass(settings.activeClass.names);
			}
			$(_this).closest(first).children('ul').addClass(settings.levelClass.names);
			if ($(_this).parent().find('li').filter(settings.activeClass.selector).length === 0 && $(_this).parent().is(settings.activeClass.selector)) $(_this).parent().addClass(settings.currentActiveClass.names);
		}

		if (settings.level > 1 && settings.levelTitle !== false) {
			selector.find(settings.levelClass.selector).parent('li').addClass(settings.levelTitleClass.names);
			if (settings.levelTitle !== false && settings.unlinkTitle !== false) {
				selector.find(settings.levelTitleClass.selector).children('a').replaceWith('<span>' + selector.find(settings.levelTitleClass.selector).children('a').html() + '</span>');
			}
		}
		if (settings.level > 1 && settings.removeHidden === true) {
			if (settings.levelTitle !== false) {
				segment = selector.find(settings.levelTitleClass.selector).detach();
				if (settings.onlyLevelTitle !== false) segment.children('ul').remove();
				selector.children('ul').html(segment);
			} else {
				segment = selector.find(settings.levelClass.selector).detach();
				selector.html(segment);
			}
		}
	}
	function updateHashUrl(hash) {
		if (settings.activeHash) history.pushState({}, "", hash);
	}

	function initHashChange(hash) {
		settings.hash = hash || win.location.hash;

		currentHash = settings.hash;
		settings.pathArray = $.grep(settings.pathArray, function(el) {
			return (el.indexOf('#') == -1 || el == settings.hash);
		});
		initActiveNav();
	}

	function findActiveMatches(first, shortPath) {
		return first.find('a').filter(function() {
			if (settings.paramSupport === true) currentLink = $(this).attr('href');
			else currentLink = $(this).attr('href').split('?')[0];
			currentLink = currentLink.toLowerCase().replace('https:','').replace('http:','').replace(settings.primaryDomain,'').replace(settings.secureDomain,'');
			if (currentLink.indexOf('/') !== 0) currentLink = '/'+currentLink;

			if (currentLink === shortPath) {
				gotIt = 1;
				return true;
			}
		});
	}

	function initActiveNav() {
		shortPath = settings.path.toLowerCase() + win.location.search.toLowerCase() + settings.hash.toLowerCase();
		selector.find(settings.activeClass.selector).removeClass(settings.activeClass.names);
		if (settings.paramSupport === true && win.location.search !== '') settings.pathArray.push(win.location.search);
		if (settings.hash !== '') settings.pathArray.push(settings.hash.toLowerCase());
		gotIt = 0;

		// This loop returns all matching links from the first iteration that has a match (within level), then exits the loop;
		for (var i = settings.pathArray.length - 1; i >= 0; i--) {
			// Go through each link
			activeLinks = findActiveMatches(first, shortPath);
			if (gotIt === 1 || settings.bubble === false) {
				break;
			} else {
				// shorten shortPath and go through the loop again.
				shortPath = shortPath.replace(settings.pathArray[i], '');
			}
		}
		if (activeLinks.length > 1) {
			// Filter remaining activeLinks
			activeLinks = activeLinks.filter(function() {
				// shortPath needs to be reset for each link we go through
				shortPath = settings.path.toLowerCase();
				if (settings.path === '/') {
					return true;
				} else {
					for (var i = settings.pathArray.length - 1; i >= 0; i--) {
						if (settings.paramSupport === true) currentLink = $(this).attr('href').toLowerCase();
						else currentLink = $(this).attr('href').split('?')[0].toLowerCase();
						if (currentLink === shortPath) {
							return true;
						} else if (shortPath !== "") {
							shortPath = shortPath.replace(settings.pathArray[i], '');
						}
					}
				}
			});
		}
		if (activeLinks.length > 0) {
			makeActive(activeLinks, first);
			if (settings.crumbs === true) {
				selector.find('li').not(settings.activeClass.selector).remove();
				selector.find(settings.currentActiveClass.selector).text(selector.find(settings.currentActiveClass.selector).children('a').text());
			}
			if ($.trim(settings.removeClass.names).length > 0) selector.removeClass(settings.removeClass.names);
		}else if (selector.find(settings.levelClass.selector).size() === 0){
			if (settings.level > 1) {
				selector.children('ul').remove();
			}else {
				selector.children('ul').addClass(settings.levelClass.names);
			}
		}
		if (settings.level === 1 && activeLinks.length === 0 && $.trim(settings.removeClass.names).length > 0) selector.removeClass(settings.removeClass.names);
	}

	function outOfView(elem) {
		var docViewTop = $(win).scrollTop();
		var docViewBottom = docViewTop + $(win).height();

		var elemTop = $(elem).offset().top;
		return (elemTop > docViewBottom);
	}
	function inViewTopBottom(elem) {
		var docViewTop = $(win).scrollTop();
		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();
		return (docViewTop < elemBottom && docViewTop > elemTop - settings.hashOffset);
	}

	// Add the window hashchange event, to add the active class on hash change
	$(win).off('hashchange');
	$(win).on('hashchange', function() {
		initHashChange();
	});

	if (settings.hashSupport) { // If hashSupport is true. url and navigation automatically updates on page scroll at certain positions
		currentHash = settings.hash;
		var hashLinks = selector.find('a[href*="' + settings.path + '#"]');
		for(var i=0,len = $(hashLinks).size(); i<len;i++){
			$('#' + $(hashLinks[i]).attr('href').split('#')[1]).addClass('hash');
		}

		$(doc).off('scroll.ActiveNav');
		$(doc).on('scroll.ActiveNav', function() {
			for(var i=0, len = body.find('.hash').size(); i<len; i++){
				var top = win.pageYOffset, _this=$(body.find('.hash')[i]);
				var distance = top - _this.offset().top;
				var hash = _this.attr('id');
				//if (distance < settings.hashOffset && distance > (-1 * settings.hashOffset) && (currentHash != hash || currentHash.length == 0)) {
				if (inViewTopBottom(_this) && (currentHash != hash || currentHash.length === 0)) {
					currentHash = '#' + hash;
					initHashChange(currentHash);
					updateHashUrl('#' + hash);
				}
			}
			if ($('.hash').size() > 0){
				if (outOfView($('.hash')[0])) {
					currentHash = '';
					initHashChange(currentHash);
					updateHashUrl('#');
				}
			}
		});
	}

	// Add .activenav to the selector element
	selector.addClass(settings.navClass.names);

	// find level
	first = $(selector);
	if (settings.level > 1) {
		for (var i = settings.level - 1; i > 0; i--) {
			first = bcpie.utils.closestChildren({
				selector: first,
				match: 'li',
				findAll: true
			});
		}
	}

	// find lastLevel
	if (settings.lastLevel > 0) {
		last = $(selector);
		for (var i = settings.lastLevel; i > 0; i--) {
			last = bcpie.utils.closestChildren({
				selector: last,
				match: 'li',
				findAll: true
			});
		}
	}else last = 0;

	$(last).parent('ul').addClass(settings.lastLevelClass.names);
	if (last !== 0 && settings.removeHidden === true) {
		bcpie.utils.closestChildren({
			selector: selector.find(settings.lastLevelClass.selector),
			match: 'ul',
			findAll: true
		}).remove();
	}

	if (settings.crumbs === true && selector.children().length === 0) {
		var breadcrumbs = '',
			pathString = '',
			path = '',
			pages;
		for (var i=0; i<settings.pathArray.length; i++) {
			path += settings.pathArray[i];
			pathString += ','+path;
		}
		$.get('/_system/apps/bcpie-bcpie/public/utilities/ajax/crumbs.html?paths='+pathString).done(function(data,status,xhr) {
			pages = $(data).filter('[data-pages]').data('pages').items;
			for (var i=pages.length-1; i>-1; i--) {
				breadcrumbs = '<ul><li><a href="'+pages[i].pageUrl+'">'+pages[i].name+'</a>'+breadcrumbs+'</li></ul>';
			}
			selector.html(breadcrumbs);
			initActiveNav();
		});
	}else initActiveNav();
};