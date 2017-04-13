/*
 * "Trigger". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2017, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Trigger = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Trigger',
		version: '2017.04.08',
		defaults: {
			trigger: 'self', // use a css selector to specify which element will trigger the behavior. Default is 'self'.
			event: 'click', // specify a comma separated list of events to cause the trigger
			eventNamespace: 'trigger',
			scope: body, // specify the parent element to search within for a trigger.
			scopeMode: 'find', // closest, siblings
			triggerValue: '', // value to be used in change event. Separate multiple values with commas. Or use 'boolean' to indicate a checkbox checked state. If left empty, any change will trigger the behavior.
			triggerMode: 'or', // 'or' or 'and'. For multiple triggers when event is set to 'change', this determines whether one or all triggers need to meet the condition.
			triggerAttr: 'value', // attribute to obtain the value from when using triggerValue.
			state: 'class', // beginning state of the trigger. Options are 'on', 'off', 'class', and 'value'. 'class' and 'value' automatically determine the state by whether the onClass/offClass or onValue/offValue is applied to the element.
			onClass: '', // css class(es) to be applied. Separate multiples with a space.
			offClass: '', // css class(es) to be applied. Separate multiples with a space.
			toggle: true, // if true, on and off states will be toggled on events. Otherwise, only the on state will occur.
			onCallback: '', // on callback
			offCallback: '', // off callback
			onValue: null, // specify default value when trigger is on, or use 'boolean' to indicate a checked state.
			offValue: null, // specify default value when trigger is off
			loadEvent: true // determines whether the trick initiates on load, or instead waits for the event to trigger.
		}
	});

	settings.methods = {
		executeTrigger: function(state) {
			if (state === 'on') {
				if (settings.onClass !== '') selector.addClass(settings.onClass.names);
				if (settings.offClass !== '') selector.removeClass(settings.offClass.names);
				bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.onCallback,
				});
				settings.methods.changeValue(settings.state);
			}else if (settings.toggle === true) {
				if (settings.onClass !== '') selector.removeClass(settings.onClass.names);
				if (settings.offClass !== '') selector.addClass(settings.offClass.names);
				bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.offCallback,
				});
				settings.methods.changeValue(settings.state);
			}
		},
		changeValue: function(state) {
			if (settings.onValue === 'boolean' && state === 'on') selector.prop('checked',true).attr('checked','checked');
			else if (settings.offValue === 'boolean' && state === 'off') selector.prop('checked',false).removeAttr('checked');
			else {
				if (state === 'off') state = settings.offValue;
				else if (state === 'on') state = settings.onValue;
				if (state !== null) {
					if (selector.is('input,select,textarea')) selector.val(state);
					else selector.text(state);
				}
			}
			if (selector.is('select,textarea,input')) selector.trigger('change'+settings.eventNamespace); // restores the selector's native change behavior
			
		},
		changeTrigger: function(){
			var matchedValues = 0;
			if (settings.triggerValue === '') matchedValues = settings.trigger.length;
			else {
				for (var e = 0; e < settings.trigger.length; e++) {
					for (var i=0; i<settings.triggerValue.length; i++) {
						if ((settings.triggerValue[i] === 'boolean' || settings.triggerValue[i] === 'boolean:on') && $(settings.trigger[e]).is(':checked')) matchedValues ++;
						else if (settings.triggerValue[i] === 'boolean:off' && !$(settings.trigger[e]).is(':checked')) matchedValues ++;
						else if (typeof settings.methods.getValue($(settings.trigger[e])) === 'object') {
							if (settings.methods.getValue($(settings.trigger[e])).indexOf(settings.triggerValue[i]) > -1) matchedValues ++;
						}else if (settings.methods.getValue($(settings.trigger[e])) == settings.triggerValue[i]) matchedValues ++;
					}
				}
			}
			if (settings.triggerMode === 'or' && matchedValues > 0) settings.state = 'on';
			else if (settings.triggerMode === 'and' && matchedValues === settings.trigger.length) settings.state = 'on';
			else settings.state = 'off';

			settings.methods.executeTrigger(settings.state);
		},
		getValue: function(triggerElement) {
			var value,tempArray = [];
			if (settings.triggerAttr === 'value') {
				if(triggerElement.is('[type=radio]'))
					value = triggerElement.filter(':checked').val();
				else if(triggerElement.is('[type=checkbox]')) {
					for (var i = 0; i < settings.triggerValue.length; i++) {
						if(settings.triggerValue[i] === '' && triggerElement.filter(':checked').size() > 0)
							value = '';
						if(triggerElement.filter("[value='" + settings.triggerValue[i] + "']:checked").size() > 0)
							value = triggerElement.filter("[value='" + settings.triggerValue[i] + "']:checked").val();
					}
				}else value = triggerElement.val();
			}
			else {
				if (triggerElement.is('select')) {
					value = triggerElement.find('option').filter(':selected');
					if (value.length > 1) {
						for (var e = 0; e < value.length; e++) {
							tempArray.push($(value[e]).attr(settings.triggerAttr));
						}
						value = tempArray;
					}else value = value.attr(settings.triggerAttr);
				}else value = triggerElement.attr(settings.triggerAttr);
			}
			if (typeof value === 'undefined' || value === null) value = '';
			if (typeof value === 'string') value = value.trim();
			return value;
		}
	};

	if (settings.trigger === 'self') settings.trigger = selector;
	else if (settings.scopeMode === 'closest') settings.trigger = selector.closest(settings.scope).find(settings.trigger);
	else if (settings.scopeMode === 'siblings' || settings.scopeMode === 'sibling') settings.trigger = selector.siblings(settings.scope).find(settings.trigger);
	else settings.trigger = $(doc).find(settings.scope).find(settings.trigger);

	if (settings.triggerValue === true || settings.triggerValue === false) settings.triggerValue = settings.triggerValue.toString();
	if (settings.triggerValue !== '' && settings.event === 'click') settings.event = 'change';
	settings.triggerValue = settings.triggerValue.split(',');

	if (settings.onClass !== '') settings.onClass = bcpie.utils.classObject(settings.onClass);
	if (settings.offClass !== '') settings.offClass = bcpie.utils.classObject(settings.offClass);

	if (settings.eventNamespace !== '') settings.eventNamespace = '.'+settings.eventNamespace;

	if (settings.state === 'class') {
		if (selector.is(settings.onClass.selector)) settings.state = 'on';
		else settings.state = 'off';
	}else if (settings.state === 'value') {
		if (selector.val() === settings.onValue || selector.text() === settings.onValue) settings.state = 'on';
		else settings.state = 'off';
	}
	selector.data('bcpie-trigger-state',settings.state);

	// specified special event change, else a generic event of class application and callbacks will be applied
	if (settings.event === 'change') {
		if (settings.loadEvent === true) settings.methods.changeTrigger();
		settings.trigger.on(settings.event,settings.methods.changeTrigger);
	}else {
		if (settings.loadEvent === true) settings.methods.executeTrigger(settings.state);
		settings.trigger.on(settings.event.replace(',',' '),function(){
			if (selector.data('bcpie-trigger-state') === 'off') {
				selector.data('bcpie-trigger-state','on');
				settings.state = selector.data('bcpie-trigger-state');
			}else if (settings.toggle === true) {
				selector.data('bcpie-trigger-state','off');
				settings.state = selector.data('bcpie-trigger-state');
			}
			settings.methods.executeTrigger(settings.state);
		});
	}
};