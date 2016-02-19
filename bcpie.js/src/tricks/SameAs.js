/*
 * "SameAs". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.SameAs = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'SameAs',
		version: '2016.02.18',
		defaults: {
			bothWays : false,
			attributeType : 'name',
			clearOnUncheck : true,
			copy : null,
			altCopy : null,
			checkbox : null,
			altCheckbox : null,
			breakOnChange : false, // Requires bothWays:false
			prefix : '',
			suffix : '',
			copyType : 'simple', // concat,math,simple
			decimals : '', // rounds numbers to specified decimal when copyType is set to math
			scope : 'form', // Uses 'form' or css selectors as values
			scopeMode : 'find', // or 'closest', 'sibling'
			event : 'change', // specify the event that triggers the copy
			eventNamespace: 'sameas', // specify an event to trigger when the trick is finished.
			ref : 'value', // html attribute or 'text'. Default is 'value'.
			target: 'value', // html attribute or 'text'. Default is 'value'.
			trim: false,
			convert: null, // 'uppercase', 'lowercase', and 'slug'. 'slug' will change the string to an appropriate url path.
			loadEvent: true // determines whether the trick initiates on load, or instead waits for the event to trigger.
		}
	});

	// Setup our variables
	if (settings.scope === 'form') var copyGroup = selector.closest('form');
	else if (settings.scopeMode === 'closest') var copyGroup = selector.closest(settings.scope);
	else if (settings.scopeMode === 'sibling' || settings.scopeMode === 'siblings') var copyGroup = selector.siblings(settings.scope);
	else var copyGroup = $(doc).find(settings.scope);

	if (settings.target === 'text' || settings.target === 'value') {
		if (selector.is('select,textarea,input')) settings.target = 'value';
		else settings.target = 'text';
	}

	if (copyGroup.length > 0) {
		var copyField, changed, checkbox = copyGroup.find('['+settings.attributeType+'="'+settings.checkbox+'"]'),
			copyFields=[],altCopyFields=[],altCheckbox = copyGroup.find('['+settings.attributeType+'="'+settings.altCheckbox+'"]'),value,boolean;

		if (settings.decimals !== '') settings.decimals = parseInt(settings.decimals);
		if (settings.eventNamespace !== '') settings.eventNamespace = '.'+settings.eventNamespace;

		selector.data('sameAsLastVal',selector.val());

		if(settings.copyType=="simple"){
			settings.copy = settings.copy.replace(/\[/g,"").replace(/\]/g,"");
			copyFields.push(copyGroup.find('['+settings.attributeType+'="'+settings.copy+'"]').not(selector));
		}else{
			settings.bothWays = false;
			GetFieldsExpression(true);
		}

		// Choose which method to use
		if (checkbox.length || altCheckbox.length) {
			if (checkbox.length) {
				checkboxChange(checkbox,selector,copyFields);
				checkbox.on(settings.event+settings.eventNamespace,function(){
					checkboxChange(checkbox,selector,copyFields);
				});
				if (settings.breakOnChange !== false) {
					selector.on(settings.event+settings.eventNamespace,function() {
						checkbox.off(settings.event+settings.eventNamespace);
						for (var i = copyFields.length - 1; i >= 0; i--) {
							copyFields[i].off(settings.event+settings.eventNamespace);
						}
						selector.off(settings.event+settings.eventNamespace);
					});
				}
			}
			if (altCheckbox.length) {
				checkboxChange(altCheckbox,selector,altCopyFields);
				altCheckbox.on(settings.event+settings.eventNamespace,function(){
					checkboxChange(altCheckbox,selector,altCopyFields);
				});
				if (settings.breakOnChange !== false) {
					selector.on(settings.event+settings.eventNamespace,function() {
						altCheckbox.off(settings.event+settings.eventNamespace);
						for (var i = altCopyFields.length - 1; i >= 0; i--) {
							altCopyFields[i].off(settings.event+settings.eventNamespace);
						}
						selector.off(settings.event+settings.eventNamespace);
					});
				}
			}
		}else {
			if (settings.loadEvent === true) {
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
		if(settings.copyType == "simple"){
			if (copyFields[0].is('select')) value = copyFields[0].find('option').filter(':selected');
			else if (copyFields[0].is('input[type=radio]') || copyFields[0].is('input[type=checkbox]')) value = copyFields[0].filter(':checked');
			else value = copyFields[0];


			if (settings.ref === 'text') value = value.text();
			else if (settings.ref === 'value') value = value.val();
			else if (settings.ref === 'html') value = value.html();
			else value = value.attr(settings.ref);

			if (typeof value !== 'undefined') {
				if (settings.trim === true) value = value.trim();

				if(value.length === 0 || ((settings.prefix.length > 0 || settings.suffix.length > 0) && settings.bothWays === true)) value = value;
				else value = settings.prefix + value + settings.suffix;
			}
		}else value = settings.prefix + GetFieldsExpression() + settings.suffix;

		if (settings.convert !== null && typeof value !== 'undefined') {
			if (settings.convert === 'slug') value = bcpie.utils.makeSlug(value);
			else if (settings.convert === 'lowercase') value = value.toLowerCase();
			else if (settings.convert === 'uppercase') value = value.toUpperCase();
		}

		if (settings.target === 'text' || settings.target === 'value') {
			if (boolean === true) {
				if (copyFields[0].is(':checked') && !selector.is(':checked')) {
					selector.prop('checked',true);
					changed = true;
				}else if (!copyFields[0].is(':checked') && selector.is(':checked')) {
					selector.prop('checked',false);
					changed = true;
				}
			}else if (settings.target === 'value') selector.val(value);
			else selector.text(value);
		}else selector.attr(settings.target,value);

		if (boolean === false) {
			if (settings.target === 'value' && selector.data('sameAsLastVal') !== selector.val()) changed = true;
			else if (settings.target === 'text' && selector.data('sameAsLastVal') !== selector.text()) changed = true;
			else if (selector.data('sameAsLastVal') !== selector.attr(settings.target)) changed = true;
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
	function checkboxChange(chkbox,selector,copyFields) {
		if (chkbox.prop('checked')) {
			if(chkbox.attr(settings.attributeType) == settings.checkbox)
				altCheckbox.removeAttr('checked');
			else if(chkbox.attr(settings.attributeType) == settings.altCheckbox)
				checkbox.removeAttr('checked');

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

		function GetfieldVal(str){
			var pattern = /\[.*?\]/g,
				fieldSelectors = str.match(pattern),
				individualField;

			for (var i = 0; i < fieldSelectors.length; i++) {
				copyFields.push(copyGroup.find(fieldSelectors[i].replace('[','['+settings.attributeType+'="').replace(']','"]')));
				value = '',combinedVal = '';
				for (var e = 0; e < copyFields[i].length; e++) {
					individualField = $(copyFields[i][e]);
					if (individualField.is('select')) value = individualField.find('option').filter(':selected');
					else if (individualField.is('input[type=radio]') || individualField.is('input[type=checkbox]')) value = individualField.filter(':checked');
					else value = individualField;

					if (settings.ref === 'text') value = value.text();
					else if (settings.ref === 'value') value = value.val();
					else if (settings.ref === 'html') value = value.html();
					else value = value.attr(settings.ref);

					if (typeof value !== 'undefined' && settings.trim === true) value = value.trim();
					if (settings.copyType === 'math' && e > 0) combinedVal += '+'+value;
					else if (settings.copyType === 'concat' && e > 0) combinedVal += value;
					else combinedVal = value;
				}
				if (typeof combinedVal !== 'undefined') str = str.replace(fieldSelectors[i],combinedVal);
			}

			return str;
		}
	}
};