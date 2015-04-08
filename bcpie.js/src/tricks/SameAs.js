/*
 * "SameAs". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.SameAs = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'SameAs',
		version: '2015.01.31',
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
			event : 'change', // specify the event that triggers the copy
			ref : 'value', // html attribute or 'text'. Default is 'value'.
		}
	});

	// Setup our variables
	var copyGroup = (settings.scope === 'form') ? selector.closest('form') : body.find(settings.scope),
		copyField, checkbox = copyGroup.find('['+settings.attributeType+'="'+settings.checkbox+'"]'),
		copyFields=[],altCopyFields=[],altCheckbox = copyGroup.find('['+settings.attributeType+'="'+settings.altCheckbox+'"]'),value;

	if (settings.decimals !== '') settings.decimals = parseInt(settings.decimals);

	if(settings.copyType=="simple"){
		settings.copy = settings.copy.replace(/\[/g,"").replace(/\]/g,"");
		copyFields.push(copyGroup.find('['+settings.attributeType+'="'+settings.copy+'"]').not(selector));
	}else{
		settings.bothWays = false;
		GetFieldsExpression(true);
	}

	function copyVal(selector,copyFields) {
		if(settings.copyType == "simple"){

			if (copyFields[0].is('select')) value = copyFields[0].find('option').filter(':selected');
			else if (copyFields[0].is('radio') || copyFields[0].is('checkbox')) value = copyFields[0].filter(':checked');
			else value = copyFields[0];

			if (settings.ref === 'text') value = value.text();
			else if (settings.ref === 'value') value = value.val();
			else value = value.attr(settings.ref);

			if(value.length === 0 || ((settings.prefix.length > 0 || settings.suffix.length > 0) && settings.bothWays === true)) value = value;
			else value = settings.prefix + value + settings.suffix;
		}else value = settings.prefix + GetFieldsExpression() + settings.suffix;

		if (selector.is('select,textarea,input')) selector.val(value);
		else selector.text(value);

		selector.trigger(settings.event+'.sameAs').trigger(settings.event);
	}
	function inputChange(selector,copyFields) {
		for (var i = copyFields.length - 1; i >= 0; i--) {
			$(copyFields[i]).on(settings.event+'.sameAs',function() {
				copyVal(selector,copyFields);
			});
		}

		if (settings.bothWays === true) {
			selector.on(settings.event+'.sameAs',function(){
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
				copyFields[i].off(settings.event+'.sameAs');
			}
			selector.off(settings.event+'.sameAs');
			selector.val('').trigger(settings.event+'.sameAs').trigger(settings.event);
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
				return Math.round(expr.evaluate()*dec)/dec;
			}
			catch(e){
				return strExpression.replace(/\+/g,'').replace(/\-/g,'').replace(/\//g,'').replace(/\*/g,'').replace(/\)/g,'').replace(/\(/g,'');
			}
		}else if (settings.copyType == "concat") return strExpression;

		function GetfieldVal(str){
			var pattern = /\[.*?\]/g,
				fieldSelectors = str.match(pattern);

			for (var i = 0; i < fieldSelectors.length; i++) {
				copyFields.push(copyGroup.find(fieldSelectors[i].replace('[','['+settings.attributeType+'="').replace(']','"]')));

				if (copyFields[i].is('select')) value = copyFields[i].find('option').filter(':selected');
				else if (copyFields[i].is('radio') || copyFields[i].is('checkbox')) value = copyFields[i].filter(':checked');
				else value = copyFields[i];

				if (settings.ref === 'text') value = value.text();
				else if (settings.ref === 'value') value = value.val();
				else value = value.attr(settings.ref);

				str = str.replace(fieldSelectors[i],value);
			}

			return str;
		}
	}
	// Choose which method to use
	if (checkbox.length || altCheckbox.length) {
		if(checkbox.length){
			checkboxChange(checkbox,selector,copyFields);
			checkbox.on(settings.event+'.sameAs',function(){
				checkboxChange(checkbox,selector,copyFields);
			});
			if (settings.breakOnChange !== false) {
				selector.on('change',function() {
					checkbox.off(settings.event+'.sameAs');
					for (var i = copyFields.length - 1; i >= 0; i--) {
						copyFields[i].off(settings.event+'.sameAs');
					}
					selector.off(settings.event+'.sameAs');
				});
			}
		}
		if(altCheckbox.length){
			checkboxChange(altCheckbox,selector,altCopyFields);
			altCheckbox.on(settings.event+'.sameAs',function(){
				checkboxChange(altCheckbox,selector,altCopyFields);
			});
			if (settings.breakOnChange !== false) {
				selector.on('change',function() {
					altCheckbox.off(settings.event+'.sameAs');
					for (var i = altCopyFields.length - 1; i >= 0; i--) {
						altCopyFields[i].off(settings.event+'.sameAs');
					}
					selector.off(settings.event+'.sameAs');
				});
			}
		}
	}else {
		copyVal(selector,copyFields);
		inputChange(selector,copyFields);
		if (settings.breakOnChange !== false) {
			selector.on('change',function() {
				for (var i = copyFields.length - 1; i >= 0; i--) {
					copyFields[i].off(settings.event+'.sameAs');
				}
				selector.off(settings.event+'.sameAs');
			});
		}
	}
};