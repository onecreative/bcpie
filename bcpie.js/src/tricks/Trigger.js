/*
 * "Trigger". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Trigger = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Trigger',
		version: '2015.03.03',
		defaults: {
			trigger: '',
			event: 'click', // or change
			triggerValue: '', // value to be used in change event. Separate multiple values with commas.
			triggerAttr: 'value', // attribute to obtain the value from when using triggerValue.
			onClass: '', // css class to be applied
			offClass: '', // css class to be applied
			toggle: false, // if true, class will be toggled on events
			onCallback: '', // on callback
			offCallback: '' // off callback
		}
	});

	var triggerEl = (settings.trigger === '') ? selector : $(settings.trigger);
	settings.triggerValue = settings.triggerValue.split(',');

	// specified special event change, else a generic event of class application and callbacks will be applied
	switch(settings.event){
		case 'change':
			changeTrigger();
			triggerEl.on(settings.event,changeTrigger); break;
		default:
			triggerEl.on(settings.event,triggerEvent);
	}


	// Generic event for all events
	function triggerEvent(){
			if(settings.toggle === true) {
				if(selector.hasClass(settings.onClass) && settings.onClass !== '') {
					selector.removeClass(settings.onClass);
					executeCallback(settings.offCallback);
				}else {
					selector.addClass(settings.onClass);
					executeCallback(settings.onCallback);
				}
				if(selector.hasClass(settings.offClass) && settings.offClass !== '') {
					selector.removeClass(settings.offClass);
					executeCallback(settings.onCallback);
				}else {
					selector.addClass(settings.offClass);
					executeCallback(settings.offCallback);
				}
			}else {
				selector.addClass(settings.onClass);
				executeCallback(settings.onCallback);
			}
	}

	// Change event
	function changeTrigger(){
			var found = 0;
			for (var i=0; i<settings.triggerValue.length; i++) {
				if(GetValue(triggerEl) == settings.triggerValue[i]) found ++;
			}
			if(found > 0){
				selector.removeClass(settings.offClass).addClass(settings.onClass);
				executeCallback(settings.onCallback);
			}else{
				selector.removeClass(settings.onClass).addClass(settings.offClass);
				executeCallback(settings.offCallback);
			}
	}
	function GetValue(triggerElement) {
		var value;
		if (settings.triggerAttr === 'value') {
			if(triggerElement.is('[type=radio]'))
				value = triggerElement.filter(':checked').val();
			else if(triggerElement.is('[type=checkbox]')){
				if(settings.triggerValue === '' && triggerElement.filter(':checked').size() > 0)
					value = "";
				if(triggerElement.filter("[value='" + settings.triggerValue + "']:checked").size() > 0)
					value = triggerElement.filter("[value='" + settings.triggerValue + "']:checked").val();
			}else value = triggerElement.val();
		}
		else {
			value = triggerElement.attr(settings.triggerAttr);
		}
		return value.trim();
	}
	// execute function helper
	function executeCallback(callbackName){
		if(callbackName.length > 0){
			var callback = window[callbackName];
			if(typeof callback === 'function') {
				var deferred = $.Deferred();
				deferred.resolve(callback());
				return deferred.promise();
			}
		}

	}
};