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
			ref : 'value', // or text
		}
	});

	// Setup our variables
	var copyGroup = (settings.scope === 'form') ? selector.closest('form') : body.find(settings.scope),
		copyField, checkbox = copyGroup.find('['+settings.attributeType+'='+settings.checkbox+']'),
		copyFields=[],altCopyFields=[],altCheckbox = copyGroup.find('['+settings.attributeType+'='+settings.altCheckbox+']'),value;

	if (settings.decimals !== '') settings.decimals = parseInt(settings.decimals);

	if(settings.copyType=="simple"){
		settings.copy = settings.copy.replace(/\[/g,"").replace(/\]/g,"");
		copyFields.push(copyGroup.find('['+settings.attributeType+'='+settings.copy+']').not(selector));
	}
	else if(settings.copyType == "alternate"){
		settings.bothWays = false;
		settings.copy = settings.copy.replace(/\[/g,"").replace(/\]/g,"");
		settings.altCopy =settings.altCopy.replace(/\[/g,"").replace(/\]/g,"");
		copyFields.push(copyGroup.find('['+settings.attributeType+'='+settings.copy+']').not(selector));
		altCopyFields.push(copyGroup.find('['+settings.attributeType+'='+settings.altCopy+']').not(selector));
	}
	else{
		settings.bothWays = false;
		GetFieldsResult(true);
	}

	function copyVal(selector,copyFields) {
		if(settings.copyType == "simple" || settings.copyType == "alternate"){
			if (settings.ref === 'text') {
				if (copyFields[0].is('select')) {
					value = copyFields[0].find('option').filter(':selected').text();
				}else if (copyFields[0].is('radio')) {
					value = copyFields[0].find('option').filter(':checked').text();
				}else {
					value = copyFields[0].text();
				}
			}else {
				value = copyFields[0].val();
			}
			if(value.length === 0 || ((settings.prefix.length > 0 || settings.suffix.length > 0) && settings.bothWays === true)) value = value;
			else value = settings.prefix + value + settings.suffix;
		}else value = settings.prefix + GetFieldsResult() + settings.suffix;

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
	function GetFieldsResult(init){
		return GetFieldsExpression(init);
	}
	function ConcatExpression(str){
		return str.replace(/\+/g,'').replace(/\-/g,'').replace(/\//g,'').replace(/\*/g,'').replace(/\)/g,'').replace(/\(/g,'');
	}
	function GetFieldsExpression(init){
		var strExpression = settings.copy,expr,dec = 1;
		strExpression = GetfieldVal(strExpression);
		if (typeof settings.decimals == 'number') {
			for (var i = 0; i<settings.decimals; i++) {
				dec = dec*10;
			}
		}
		try {
			if(settings.copyType == "math"){
				expr = Parser.parse(strExpression);
				return Math.round(expr.evaluate()*dec)/dec;
			}
			else
				return ConcatExpression(strExpression);
		}
		catch(e){
			return ConcatExpression(strExpression);
		}

		function GetfieldVal(str){
			var sIndex = -1, eIndex=-1, mode = 0,str2 = str, i;
			for(i=0;i<str.length;i++){
				var charCode = str.charCodeAt(i);
				var field;
				if(charCode == 91 && sIndex == -1){
					sIndex = i;
					mode = 1;
					continue;
				}
				else if(mode == 1 && charCode == 93 && sIndex > -1){
					eIndex = i;
					field = $('['+settings.attributeType+'="' + str.substring(sIndex+1,eIndex)  + '"]');
					str2 = str2.replace(str.substring(sIndex,eIndex+1),field.val());
					if(init) copyFields.push(field);
					sIndex = -1;
					eIndex = -1;
					mode=0;
				}
				else if((charCode>=65 && charCode <=90) || (charCode>=97 && charCode <=122) && mode === 0){
					if(sIndex == -1)
					{
						sIndex = i;
						continue;
					}
				}
				else if(mode === 0 && sIndex > -1 && (charCode==42 || charCode==43|| charCode==45||charCode==47 || charCode == 41)){
					eIndex = i-1;
					field = $('['+settings.attributeType+'="' + str.substring(sIndex,eIndex+1)  + '"]');
					str2 = str2.replace(str.substring(sIndex,eIndex+1),field.val());
					if(init) copyFields.push(field);
					sIndex = -1;
					eIndex = -1;
				}
				else
				{
					continue;
				}
			}
			if(sIndex > -1){
				eIndex = i;
				var f = $('['+settings.attributeType+'="' + str.substring(sIndex,eIndex+1)  + '"]');
				str2 = str2.replace(str.substring(sIndex,eIndex+1),f.val());
				if(init) copyFields.push(f);
			}

			return str2;
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