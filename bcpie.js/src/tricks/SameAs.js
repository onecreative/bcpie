/* 
  * To Title Case 2.1 – http://individed.com/code/to-title-case/
  * Copyright © 2008–2013 David Gouch. Licensed under the MIT License.
 */

String.prototype.toTitleCase = function(){
  var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

  return this.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title){
    if (index > 0 && index + match.length !== title.length &&
      match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
      (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
      title.charAt(index - 1).search(/[^\s-]/) < 0) {
      return match.toLowerCase();
    }

    if (match.substr(1).search(/[A-Z]|\../) > -1) {
      return match;
    }

    return match.charAt(0).toUpperCase() + match.substr(1);
  });
};

/*
 * "SameAs". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.SameAs = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'SameAs',
		version: '2017.06.24',
		defaults: {
			copy: null,
			copyType: 'concat', // concat,math
			expressAttr: 'name',
			refAttr: 'value', // html attribute or 'text'. Default is 'value'.
			targetAttr: 'value', // html attribute or 'text'. Default is 'value'.
			scope: 'form', // Uses 'form' or css selectors as values, or use 'parent' to get the selector's parent
			scopeMode: 'closest', // or 'find', 'sibling'
			checkbox: 'off',
			checkboxLogic: 'and', // or
			clearOnUncheck: true,
			decimals: 'off', // rounds numbers to specified decimal when copyType is set to math
			convert: 'off', // 'upper', 'lower', 'title', 'camel' and 'slug'. 'slug' will change the string to an appropriate url path.
			encoding: 'off', // 'escape', 'unescape', 'url' or 'off'
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
	if (settings.copy === null) {
		settings.copy = selector.attr(settings.expressAttr);
		settings.scope = 'parent';
	}
	if (settings.copy !== '' && settings.copy.indexOf('[') === -1) settings.copy = '['+settings.copy+']';
	if (typeof settings.prefix !== 'undefined') settings.copy = settings.prefix + settings.copy;
	if (typeof settings.suffix !== 'undefined') settings.copy = settings.copy + settings.suffix;
	if (settings.convert !== 'off') settings.convert = settings.convert.replace('case','').replace('Case','');

	// Setup our variables
	var copyGroup;
	if (settings.scope === 'parent') copyGroup = selector.parent();
	else if (settings.scopeMode === 'closest') copyGroup = selector.closest(settings.scope);
	else if (settings.scopeMode === 'sibling' || settings.scopeMode === 'siblings') copyGroup = selector.siblings(settings.scope);
	else copyGroup = $(doc).find(settings.scope);

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
			for (var e = 0; e < checkbox.length; e++) {
				checkbox[e].on(settings.event,function() {
					checkboxChange(checkbox,copyFields);
				});
			}
			
			if (settings.breakOnChange !== false) {
				selector.on(settings.event,function() {
					for (var f = 0; f < checkbox.length; f++) {
						checkbox[f].off(settings.event);
					}
					for (var g = copyFields.length - 1; g >= 0; g--) {
						copyFields[g].off(settings.event);
					}
					selector.off(settings.event);
				});
			}
		}else {
			if (settings.copyOnLoad === true) {
				copyVal(selector,copyFields);
				inputChange(selector,copyFields);
			}
			
			if (settings.breakOnChange !== false) {
				selector.on(settings.event,function() {
					for (var i = copyFields.length - 1; i >= 0; i--) {
						copyFields[i].off(settings.event);
					}
					selector.off(settings.event);
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
			else if (settings.convert === 'lower') value = value.toLowerCase();
			else if (settings.convert === 'upper') value = value.toUpperCase();
			else if (settings.convert === 'camel') value = bcpie.utils.camelCase(value);
			else if (settings.convert === 'title') value = value.toTitleCase();
		}

		if (settings.encoding !== 'off' && typeof value !== 'undefined') {
			if (settings.encoding === 'escape') value = bcpie.utils.escape(value);
			else if (settings.encoding === 'unescape') value = bcpie.utils.unescape(value);
			else if (settings.encoding === 'encode') value = bcpie.utils.encode(value);
			else if (settings.encoding === 'decode') value = bcpie.utils.decode(value);
			else if (settings.encoding === 'json') value = bcpie.utils.jsonify(value);
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
			$(copyFields[i]).on(settings.event,function() {
				copyVal(selector,copyFields);
			});
		}

		if (settings.bothWays === true) {
			selector.on(settings.event,function(){
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

		if (settings.checkboxLogic === 'and' && checkbox.length === checked) checked = true;
		else if (settings.checkboxLogic === 'or' && checked > 0) checked = true;
		else checked = false;

		if (checked) {
			copyVal(selector,copyFields);
			inputChange(selector,copyFields);
		}else {
			for (var e = copyFields.length - 1; e >= 0; e--) {
				copyFields[e].off(settings.event);
			}
			selector.off(settings.event);
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
			value = '';
			combinedVal = '';
			for (var e = 0; e < copyFields[i].length; e++) {
				individualField = $(copyFields[i][e]);
				if (individualField.is('select')) value = individualField.find('option').filter(':selected');
				else if (individualField.is('input[type=radio]') || individualField.is('input[type=checkbox]')) {
					if (individualField.filter(':checked').length > 0) value = individualField.filter(':checked');
					else value = '';
				} 
				else value = individualField;

				if (value !== '') {
					if (settings.refAttr === 'text') value = value.text();
					else if (settings.refAttr === 'value') value = value.val();
					else if (settings.refAttr === 'html') value = value.html();
					else value = value.attr(settings.refAttr);
				}

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