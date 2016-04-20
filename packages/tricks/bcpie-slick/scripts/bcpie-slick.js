/*
 * "Slick". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2016, ONE Creative
*/

bcpie.extensions.tricks.Slick = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Slick',
		version: '2016.04.14',
		defaults: {
			onAfterChange: null,
			onBeforeChange: null,
			onEdge: null,
			onInit: null,
			onReInit: null,
			onSetPosition: null,
			onSwipe: null,
			appendMode: 'find' // closest, find, body
		}
	});
	var options = {
		accessibility: settings.accessibility,
		adaptiveHeight: settings.adaptiveHeight,
		autoplay: settings.autoplay,
		autoplaySpeed: settings.autoplaySpeed,
		centerMode: settings.centerMode,
		centerPadding: settings.centerPadding,
		cssEase: settings.cssEase,
		customPaging: settings.customPaging,
		dots: settings.dots,
		dotsClass: settings.dotsClass,
		draggable: settings.draggable,
		easing: settings.easing,
		edgeFriction: settings.edgeFriction,
		fade: settings.fade,
		arrows: settings.arrows,
		appendArrows: settings.appendArrows,
		appendDots: settings.appendDots,
		mobileFirst: settings.mobileFirst,
		prevArrow: settings.prevArrow,
		nextArrow: settings.nextArrow,
		infinite: settings.infinite,
		initialSlide: settings.initialSlide,
		lazyLoad: settings.lazyLoad,
		pauseOnFocus: settings.pauseOnFocus,
		pauseOnHover: settings.pauseOnHover,
		pauseOnDotsHover: settings.pauseOnDotsHover,
		respondTo: settings.respondTo,
		responsive: settings.responsive,
		rows: settings.rows,
		slide: settings.slide,
		slidesPerRow: settings.slidesPerRow,
		slidesToShow: settings.slidesToShow,
		slidesToScroll: settings.slidesToScroll,
		speed: settings.speed,
		swipe: settings.swipe,
		swipeToSlide: settings.swipeToSlide,
		touchMove: settings.touchMove,
		touchThreshold: settings.touchThreshold,
		useCSS: settings.useCSS,
		useTransform: settings.useTransform,
		variableWidth: settings.variableWidth,
		vertical: settings.vertical,
		verticalSwiping: settings.verticalSwiping,
		rtl: settings.rtl,
		waitForAnimate: settings.waitForAnimate,
		zIndex: settings.zIndex,
		asNavFor: settings.asNavFor,
		focusOnSelect: settings.focusOnSelect
	};
	for (key in options) {
		if (typeof options[key] === 'undefined') delete options[key];
	}
	if (settings.appendMode === 'find') {
		if (typeof options.appendArrows !== 'undefined' && options.appendArrows !== selector) options.appendArrows = selector.find(options.appendArrows);
		if (typeof options.appendDots !== 'undefined' && options.appendDots !== selector) options.appendDots = selector.find(options.appendDots);
	}else if (settings.appendMode === 'closest') {
		if (typeof options.appendArrows !== 'undefined' && options.appendArrows !== selector) options.appendArrows = selector.closest(options.appendArrows);
		if (typeof options.appendDots !== 'undefined' && options.appendDots !== selector) options.appendDots = selector.closest(options.appendDots);
	}else {
		if (typeof options.appendArrows !== 'undefined' && options.appendArrows !== selector) options.appendArrows = body.find(options.appendArrows);
		if (typeof options.appendDots !== 'undefined' && options.appendDots !== selector) options.appendDots = body.find(options.appendDots);
	}
	selector.slick(options);
};