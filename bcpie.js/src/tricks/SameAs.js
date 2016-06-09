/*
 * "SameAs". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.SameAs = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'SameAs',
		version: '2016.05.07',
		defaults: {
			copy: null,
			copyType: 'concat', // concat,math
			expressAttr: 'name',
			refAttr: 'value', // html attribute or 'text'. Default is 'value'.
			targetAttr: 'value', // html attribute or 'text'. Default is 'value'.
			scope: 'form', // Uses 'form' or css selectors as values
			scopeMode: 'closest', // or 'find', 'sibling'
			checkbox: 'off',
			checkboxLogic: 'and', // or
			clearOnUncheck: true,
			decimals: 'off', // rounds numbers to specified decimal when copyType is set to math
			convert: 'off', // 'uppercase', 'lowercase', and 'slug'. 'slug' will change the string to an appropriate url path.
			trim: false,
			bothWays: false,
			breakOnChange: false, // Requires bothWays:false
			copyOnLoad: true, // determines whether the trick initiates on load, or instead waits for the event to trigger.
			event: 'change', // specify the event that triggers the copy
			eventNamespace: 'sameas' // specify an event to trigger when the trick is finished.
		}
	});

	// Backwards compatibility
	if (settings.copyOnLoad === true && typeof settings.loadEvent !== 'undefined') settings.copyOnLoad = settings.loadEvent;
	if (settings.expressAttr === 'name' && typeof settings.attributeType !== 'undefined') settings.expressAttr = settings.attributeType;
	if (settings.refAttr === 'value' && typeof settings.ref !== 'undefined') settings.refAttr = settings.ref;
	if (settings.targetAttr === 'value' && typeof settings.target !== 'undefined') settings.targetAttr = settings.target;
	if (settings.copyType === 'simple') settings.copyType = 'concat';
	if (settings.copy.indexOf('[') === -1) settings.copy = '['+settings.copy+']';
	if (typeof settings.prefix !== 'undefined') settings.copy = settings.prefix + settings.copy;
	if (typeof settings.suffix !== 'undefined') settings.copy = settings.copy + settings.suffix;

	// Setup our variables
	if (settings.scopeMode === 'closest') var copyGroup = selector.closest(settings.scope);
	else if (settings.scopeMode === 'sibling' || settings.scopeMode === 'siblings') var copyGroup = selector.siblings(settings.scope);
	else var copyGroup = $(doc).find(settings.scope);

	if (settings.targetAttr === 'text' || settings.targetAttr === 'value') {
		if (selector.is('select,textarea,input')) settings.targetAttr = 'value';
		else settings.targetAttr = 'text';
	}

	if (copyGroup.length > 0) {
		var copyField, changed, checkbox,
			copyFields=[],value,boolean;

		if (settings.checkbox !== 'off') {
			checkbox = settings.checkbox.split(',');
			for (var i = 0; i < checkbox.length; i++) {
				checkbox[i] = checkbox[i].replace('[','').replace(']','');
				if (checkbox[i].indexOf('=') === -1) checkbox[i] = settings.expressAttr+'="'+checkbox[i]+'"';
				checkbox[i] = copyGroup.find('['+checkbox[i]+']');
			}
		}

		if (settings.decimals !== 'off') settings.decimals = parseInt(settings.decimals);
		if (settings.eventNamespace !== '') settings.eventNamespace = '.'+settings.eventNamespace;

		selector.data('sameAsLastVal',selector.val());
		GetFieldsExpression(true);

		// Choose which method to use
		if (settings.checkbox !== 'off' && checkbox.length > 0) {
			checkboxChange(checkbox,copyFields);
			for (var i = 0; i < checkbox.length; i++) {
				checkbox[i].on(settings.event+settings.eventNamespace,function(){
					checkboxChange(checkbox,copyFields);
				});
			}
			
			if (settings.breakOnChange !== false) {
				selector.on(settings.event+settings.eventNamespace,function() {
					for (var i = 0; i < checkbox.length; i++) {
						checkbox[i].off(settings.event+settings.eventNamespace);
					}
					for (var i = copyFields.length - 1; i >= 0; i--) {
						copyFields[i].off(settings.event+settings.eventNamespace);
					}
					selector.off(settings.event+settings.eventNamespace);
				});
			}
		}else {
			if (settings.copyOnLoad === true) {
				copyVal(selector,copyFields);
				inputChange(selector,copyFields);
			}
			
			if (settings.breakOnChange !== false) {
				selector.on(settings.event+settings.eventNamespace,function() {
					for (var i = copyFields.length - 1; i >= 0; i--) {
						copyFields[i].off(settings.event+settings.eventNamespace);
					}
					selector.off(settings.event+settings.eventNamespace);
				});
			}
		}
	}

	function copyVal(selector,copyFields) {
		changed = false;
		boolean = copyFields[0].is('input[type=checkbox]') && !copyFields[0][0].hasAttribute('value') && selector.is('input[type=checkbox]');
		value = GetFieldsExpression();

		if (settings.convert !== 'off' && typeof value !== 'undefined') {
			if (settings.convert === 'slug') value = bcpie.utils.makeSlug(value);
			else if (settings.convert === 'lowercase') value = value.toLowerCase();
			else if (settings.convert === 'uppercase') value = value.toUpperCase();
		}

		if (settings.targetAttr === 'text' || settings.targetAttr === 'value') {
			if (boolean === true) {
				if (copyFields[0].is(':checked') && !selector.is(':checked')) {
					selector.prop('checked',true);
					changed = true;
				}else if (!copyFields[0].is(':checked') && selector.is(':checked')) {
					selector.prop('checked',false);
					changed = true;
				}
			}else if (settings.targetAttr === 'value') selector.val(value);
			else selector.text(value);
		}else selector.attr(settings.targetAttr,value).prop(settings.targetAttr,value);

		if (boolean === false) {
			if (settings.targetAttr === 'value' && selector.data('sameAsLastVal') !== selector.val()) changed = true;
			else if (settings.targetAttr === 'text' && selector.data('sameAsLastVal') !== selector.text()) changed = true;
			else if (selector.data('sameAsLastVal') !== selector.attr(settings.targetAttr)) changed = true;
		}
		
		if (changed === true) {
			selector.trigger(settings.event+settings.eventNamespace);
			if (settings.event !== 'change' && selector.is('select,textarea,input')) selector.trigger('change'+settings.eventNamespace); // restores the selector's native change behavior
			selector.data('sameAsLastVal',selector.val());
		}
	}
	function inputChange(selector,copyFields) {
		for (var i = copyFields.length - 1; i >= 0; i--) {
			$(copyFields[i]).on(settings.event+settings.eventNamespace,function() {
				copyVal(selector,copyFields);
			});
		}

		if (settings.bothWays === true) {
			selector.on(settings.event+settings.eventNamespace,function(){
				if (selector.val() !== copyFields[0].val()) {
					copyVal(copyFields[0],[selector]);
				}
			});
		}
	}
	function checkboxChange(checkbox,copyFields) {
		var checked = 0;
		for (var i = 0; i < checkbox.length; i++) {
			if (checkbox[i].prop('checked')) checked += 1;
		}

		if (settings.checkboxLogic === 'and' && checked.length === checked) checked = true;
		else if (settings.checkboxLogic === 'or' && checked > 0) checked = true;
		else checked = false;

		if (checked) {
			copyVal(selector,copyFields);
			inputChange(selector,copyFields);
		}else {
			for (var i = copyFields.length - 1; i >= 0; i--) {
				copyFields[i].off(settings.event+settings.eventNamespace);
			}
			selector.off(settings.event+settings.eventNamespace);
			selector.val('');

			if (selector.data('sameAsLastVal') !== selector.val()) {
				selector.trigger(settings.event+settings.eventNamespace);
				if (settings.event !== 'change') selector.trigger('change'+settings.eventNamespace); // restores the selector's native change behavior
				selector.data('sameAsLastVal',selector.val());
			}
		}
	}
	function GetFieldsExpression(init){
		var strExpression = settings.copy,expr,dec = 1;
		
		strExpression = GetfieldVal(strExpression);
		if (typeof settings.decimals == 'number') {
			for (var i = 0; i<settings.decimals; i++) {
				dec = dec*10;
			}
		}
		
		if (settings.copyType == "math") {
			try {
				expr = Parser.parse(strExpression);
				return ((Math.round(expr.evaluate()*dec)/dec)+0).toFixed(settings.decimals);
			}
			catch(e){
				return strExpression.replace(/\+/g,'').replace(/\-/g,'').replace(/\//g,'').replace(/\*/g,'').replace(/\)/g,'').replace(/\(/g,'');
			}
		}else if (settings.copyType == "concat") return strExpression;
	}
	function GetfieldVal(str) {
		var pattern = /\[.*?\]/g,newSelector,
			fieldSelectors = str.match(pattern),
			individualField;

		for (var i = 0; i < fieldSelectors.length; i++) {
			newSelector = fieldSelectors[i].replace('[','').replace(']','');
			if (newSelector.indexOf('=') === -1) newSelector = settings.expressAttr+'="'+newSelector+'"';
			newSelector = copyGroup.find('['+newSelector+']');
			copyFields.push(copyGroup.find(newSelector));
			value = '',combinedVal = '';
			for (var e = 0; e < copyFields[i].length; e++) {
				individualField = $(copyFields[i][e]);
				if (individualField.is('select')) value = individualField.find('option').filter(':selected');
				else if (individualField.is('input[type=radio]') || individualField.is('input[type=checkbox]')) value = individualField.filter(':checked');
				else value = individualField;

				if (settings.refAttr === 'text') value = value.text();
				else if (settings.refAttr === 'value') value = value.val();
				else if (settings.refAttr === 'html') value = value.html();
				else value = value.attr(settings.refAttr);

				if (typeof value !== 'undefined' && settings.trim === true) value = value.trim();
				if (settings.copyType === 'math' && e > 0) combinedVal += '+'+value;
				else if (settings.copyType === 'concat' && e > 0) combinedVal += value;
				else combinedVal = value;
			}
			if (typeof combinedVal !== 'undefined') str = str.replace(fieldSelectors[i],combinedVal);
		}
		return str;
	}
};