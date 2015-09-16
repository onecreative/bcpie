/*
 * "FormMagic". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.FormMagic = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'FormMagic',
		version: '2015.09.15',
		defaults: {
			'requiredClass' : 'required',
			'errorGroupElement' : 'div',
			'errorGroupClass' : 'error-group',
			'errorMessageElement' : 'small',
			'errorClass' : 'error',
			'messageBox' : 'replace', // 'replace' replaces the form with the message, and 'off' returns no message. Otherwise, a CSS selector indicates where to put the message.
			'restoreMessageBox' : true, // If submission result is empty, the contents of messageBox will be restored. This is particularly helpful with live searches.
			'afterAjax' : 'remove', // 'hide', 'show'
			'useAjax' : false,
			'validateMode' : 'alert', // 'inline', 'off'
			'fieldTitleAttr' : 'label', // or specify a field attribute
			'systemMessageClass' : 'system-message',
			'systemErrorMessageClass' : 'system-error-message',
			'successClass' : 'success',
			'submitEvent' : null,
			'submitField' : '[type="submit"]',
			'validationSuccess' : null, // specify a function to run after validation, but before submission
			'validationError' : null, // specify a function to run after validation returns errors
			'noSubmit' : false, // allow form submission to be bypassed after successful validation.
			'ajaxSuccess' : null, // specify a function to run after an Ajax submission 'success' response
			'ajaxError' : null, // specify a function to run after an Ajax submission 'error' response
			'ajaxComplete' : null, // specify a function to run after an Ajax submission 'complete' response
			'steps' : '', // multistep container selectors, separated by comma
			'continueButton' : '', // Continue button selector for multistep form
			'backButton' : '', // back button selector for multistep form
			'buttonOnLoad' : 'enable', // none,disable,hide
			'buttonOnSubmit' : 'disable', // none,enable,hide
			'buttonAfterSubmit' : 'enable', //none,hide,show,disable
			'customError' : null, // specify a custom validation function to run against a comma delimeted list of selectors
			'customErrorFields' : '' // takes a comma delimited list of selectors to match against during validation
		}
	});

	// validationFunctions.js and EN validatelang
	var jslang = bcpie.globals.site.language;
	if (typeof jslang == "undefined") jslang = ("EN");
	else {
		if (jslang == "JP") jslang = "JA";
		if (jslang == "CS") jslang = "CZ";
		if (jslang == "SI") jslang = "SL";
	}

	if (typeof validatelang === 'undefined' && jslang === 'EN') {
		var validatelang = {
			Currency: { MustNumber: " must be a number and cannot be empty\n", NoSymbol: " amount you entered must be a number without currency symbol\n" },
			Number: { MustNumber: " must be a number and cannot be empty\n", NoDecimal: " must be a number (no decimal points) and cannot be empty\n" },
			Float: { MustNumber: " must be a number and may contain a decimal point.\n" },
			Enter: { PleaseEnter: "- Please enter " },
			Select: { PleaseSelect: "- Please select ", MustSelect: " must be selected\n" },
			Email: { ValidEmail: "- Please enter a valid email address\n", Illegal: "- The email address contains illegal characters\n" },
			CheckDate: { ValidDate: " as a valid date.\n" },
			Others: { CannotContain: " cannot contain ", WhiteSpace: "white spaces\n", Character: "character.\n" },
			IP: { Illegal: "- Please enter a valid IP Address" }
		};
	}else if (typeof validatelang === 'undefined') eval($.ajax({url:'/BcJsLang/ValidationFunctions.aspx?lang='+jslang,method:'get',async:false}).responseText);

	function formfield(j, d) {
		switch (d) {
			case "firstupper":
				var b = true;
				var e = true;
				for (var g = 1; g < j.length; g++) {
					var f = j.charCodeAt(g);
					if (f >= 65 && f <= 90) e = false;
					if (f >= 97 && f <= 127) b = false;
				}
				if (b || e) {
					var h = j.split(" ");
					j = "";
					for (var g = 0; g < h.length; g++) {
						if (h[g].length >= 1) j = j + " " + h[g].substring(0, 1).toUpperCase() + h[g].substring(1).toLowerCase();
					}
				}
				j = j.replace(".", "");
				j = j.replace(",", "");
				break;
			case "firstupperspecial":
				var h = j.split(" ");
				j = "";
				for (var g = 0; g < h.length; g++) {
					if (h[g].length >= 1) j = j + " " + h[g].substring(0, 1).toUpperCase() + h[g].substring(1);
				}
				break;
			case "alllower":
				j = j.toLowerCase(); break;
			case "allupper":
				j = j.toUpperCase(); break;
			default: break;
		}
		if (j.substring(0, 1) == " ") j = j.substring(1);
		return j;
	}
	function isCurrency(b, d) {
		var g = "";
		if (b.length === 0) g = "- " + d + validatelang.Currency.MustNumber;
		else {
			for (var f = 0; f < b.length; f++) {
				var e = b.charAt(f);
				if ((e < "0") || (e > "9")) {
					if (e != "." && e != ",") {
						g = "- " + d + validatelang.Currency.NoSymbol;
					}
				}
			}
		}
		return g;
	}
	function isNumeric(b, d) {
		var g = "";
		if (b.length === 0) g = "- " + d + validatelang.Number.MustNumber;
		else {
			var f;
			for (f = 0; f < b.length; f++) {
				var e = b.charAt(f);
				if ((e < "0") || (e > "9")) {
					g = "- " + d + validatelang.Number.NoDecimal;
					return g;
				}
			}
		}
		return g;
	}
	function isFloat(b, d) {
		var g = "";
		var f;
		if (b.length === 0) g = "- " + d + validatelang.Float.MustNumber;
		else {
			for (f = 0; f < b.length; f++) {
				var e = b.charAt(f);
				if (((e < "0") || (e > "9"))) {
					if (e != "." && e != ",") {
						g = "- " + d + validatelang.Float.MustNumber;
						return g;
					}
				}
			}
		}
		return g;
	}
	function isEmpty(d, c) {
		var b = "";
		if (d.trim().length === 0) b = validatelang.Enter.PleaseEnter + c + "\n";
		return b;
	}
	function checkDropdown(d, c) {
		var b = "";
		if (d === null) d = "";
		if (d.length === 0 || d == " " || d === "") b = validatelang.Select.PleaseSelect + c + "\n";
		return b;
	}
	function checkEmail(e) {
		var b = "";
		if (e.length > 0) {
			var c = /^[^@]+@[^@]+\.[^@]{2,6}$/;
			if (!(c.test(e))) b = validatelang.Email.ValidEmail;
			else {
				var d = /[\+\(\)\<\>\,\;\:\\\"\[\]]/;
				if (e.match(d)) b = validatelang.Email.Illegal;
			}
		}else b = validatelang.Email.ValidEmail;
		return b;
	}
	function checkSelected(c, e) {
		var b = "- " + e + validatelang.Select.MustSelect;
		if (c.length > 0) {
			for (var d = 0; d < c.length; d++) {
				if (c[d].disabled === false && c[d].checked === true) b = "";
			}
		}else if (c.disabled === false && c.checked === true) b = "";
		return b;
	}
	function getRadioSelected(b) {
		if (b.length > 0) {
			for (var c = 0; c < b.length; c++) {
				if (b[c].disabled === false && b[c].checked === true) {
					return b[c].value;
				}
			}
		}else if (b.disabled === false && b.checked === true) return b.value;
		return null;
	}
	function checkSelectedX(c, h) {
		var b = "- " + h + validatelang.Select.MustSelect;
		var e = document.getElementById(c);
		var g = e.getElementsByTagName("td");
		var f;
		for (var d = 0; d < g.length; d++) {
			f = g[d].firstChild;
			if (f && (f.type == "checkbox" || f.type == "radio")) {
				if (f.disabled === false && f.checked === true) b = "";
			}
		}
		return b;
	}
	function checkSpaces(e, c) {
		var b = "";
		for (var d = 0; d < e.length; d++) {
			if (e.charAt(d) == " ") b = "- " + c + validatelang.Others.CannotContain + validatelang.Others.WhiteSpace;
		}
		return b;
	}
	function checkUrlChar(f, d) {
		var b = "";
		for (i = 0; i < f.length; i++) {
			var e = f.charAt(i);
			switch (e) {
				case "/":
				case "\\":
				case "#":
				case "?":
				case ":":
				case "@":
				case "=":
				case "&":
				case '"':
				case "|":
				case "_":
				case ".":
				case "%":
					b = "- " + d + validatelang.Others.CannotContain + "[" + e + "] " + validatelang.Others.Character;
					return b;
			}
		}
		return b;
	}
	function isInteger(b) {
		var e;
		if (b.length === 0) return false;
		for (e = 0; e < b.length; e++) {
			var d = b.charAt(e);
			if (((d < "0") || (d > "9"))) return false;
		}
		return true;
	}
	function checkDate(c, b) {
		var e = "";
		if (c.length === 0) {
			e = validatelang.Enter.PleaseEnter + b + validatelang.CheckDate.ValidDate;
			return e;
		}
		return e;
	}
	function appendBreak(b) {
		return b += "\n";
	}
	String.prototype.trim = function() {
		a = this.replace(/^\s+/, "");
		return a.replace(/\s+$/, "");
	};

	function addEventSimple(d, c, b) {
		if (d.addEventListener) d.addEventListener(c, b, false);
		else if (d.attachEvent) d.attachEvent("on" + c, b);
	}
	function sendRequestSync(d, f, e) {
		var c = createXMLHTTPObject();
		if (!c) return;
		var b = (e) ? "POST" : "GET";
		c.open(b, d, false);
		c.setRequestHeader("User-Agent", "XMLHTTP/1.0");
		if (e) c.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		c.send(e);
		if (c.status === 200) return c.responseText;
	}
	var XMLHttpFactories = [
		function() { return new XMLHttpRequest(); },
		function() { return new ActiveXObject("Msxml2.XMLHTTP"); },
		function() { return new ActiveXObject("Msxml3.XMLHTTP"); },
		function() { return new ActiveXObject("Microsoft.XMLHTTP"); }
	];
	function createXMLHTTPObject() {
		var d = false;
		for (var c = 0; c < XMLHttpFactories.length; c++) {
			try {
				d = XMLHttpFactories[c]();
			} catch (b) {
				continue;
			}
			break;
		}
		return d;
	}
	for (var i = 0; i < document.forms.length; i++) {
		initCaptchaOnForm(document.forms[i]);
	}
	function initCaptchaOnForm(b) {
		if (b._CaptchaHookedUp) return;
		if (!b.CaptchaV2) return;
		if (!b.CaptchaHV2) return;
		b._CaptchaHookedUp = true;
	}
	function captchaIsInvalid(h, e, j) {
		if ((h._CaptchaTextValidated === true) && (h._CaptchaTextIsInvalid === false)) return "";
		if (typeof h.ReCaptchaChallenge != "undefined") {
			var c = Recaptcha.get_challenge();
			var g = Recaptcha.get_response();
			if (g.trim().length === 0) return "- " + e;
			h.ReCaptchaAnswer.value = Recaptcha.get_response();
			h.ReCaptchaChallenge.value = Recaptcha.get_challenge();
			var d = sendRequestSync("/ValidateCaptcha.ashx?key=" + c + "&answer=" + g + "&imageVerificationType=recaptcha");
			h._CaptchaTextIsInvalid = d == "false";
			h._CaptchaTextValidated = true;
			if (h._CaptchaTextIsInvalid) regenerateCaptcha(h);
		}else {
			var c = $(h).find('[name=CaptchaHV2]').val();
			var g = $(h).find('[name=CaptchaV2]').val();
			var b = 6;
			if (g.trim().length === 0) return "- " + e;
			if (g.length != b) h._CaptchaTextIsInvalid = true;
			else {
				var d = sendRequestSync("/ValidateCaptcha.ashx?key=" + c + "&answer=" + g);
				h._CaptchaTextIsInvalid = d == "false";
				h._CaptchaTextValidated = true;
				if (h._CaptchaTextIsInvalid) regenerateCaptcha(h);
			}
		}
		if (h._CaptchaTextIsInvalid) return "- " + j;
		return "";
	}
	function regenerateCaptcha(h) {
		h._CaptchaTextValidated = false;
		h._CaptchaTextIsInvalid = true;
		if (typeof h.ReCaptchaChallenge != "undefined") Recaptcha.reload();
		else {
			var d = sendRequestSync("/CaptchaHandler.ashx?Regenerate=true&rand=" + Math.random());
			h.CaptchaHV2.value = d;
			h.CaptchaV2.value = "";
			var j = h.getElementsByTagName("img");
			if (j.length === 0) {
				if ((h.parentNode.nodeName.toLowerCase() == "p") && (h.parentNode.nextSibling) && (h.parentNode.nextSibling.nodeName.toLowerCase() == "table") && (h.parentNode.nextSibling.className == "webform")) {
					j = h.parentNode.nextSibling.getElementsByTagName("img");
				}
			}
			for (var b = 0; b < j.length; b++) {
				var m = j[b].src;
				var c = m.toLowerCase();
				if (c.indexOf("/captchahandler.ashx") > -1) {
					var g = c.indexOf("?id=") + 4;
					var k = c.indexOf("&", g);
					var l = m.substring(g, k);
					var e = m.replace(l, d);
					j[b].src = e;
					break;
				}
			}
		}
	}
	function isNumericIfVisible(b, d) {
		var g = "";
		if (b.style.display == "inline") {
			if (b.value.length === 0) g = "- " + d + validatelang.Number.MustNumber;
			else {
				var f;
				for (f = 0; f < b.value.length; f++) {
					var e = b.value.charAt(f);
					if ((e < "0") || (e > "9")) {
						g = "- " + d + validatelang.Number.NoDecimal;
						return g;
					}
				}
			}
		}
		return g;
	}
	function checkIPAddress(c) {
		var b = /^\s*((0|[1-9]\d?|1\d{2}|2[0-4]\d|25[0-5])\.){3}(0|[1-9]\d?|1\d{2}|2[0-4]\d|25[0-5])\s*$/;
		if (b.test(c)) return "";
		return validatelang.IP.Illegal;
	}

	if (settings.steps === '' && settings.containers !== '') settings.steps = settings.containers;

	// setup some local variables
	var requiredFields,required=[],submitCount=0,
		errorArray=[],errorElement='<'+settings.errorGroupElement+' class="'+settings.errorGroupClass+'"></'+settings.errorGroupElement+'>',newRequired,pass={},
		errorTarget,successMessage,messageElement,selectorResponse,onChangeBinding,errorElementExists,errorCount=0,autoRequire,currentName,submitField,
		paymentMethods = selector.find('[name="PaymentMethodType"]'), onlyCCMethod = false,
		multistep = {containers: selector.find(settings.steps), step: 0},
		lockSubmit = false, messageBox = (settings.messageBoxID === null) ? $('<div id="ajaxresponse" />') : $('#'+settings.messageBoxID),
		messageBoxContents = $('#'+settings.messageBoxID).html(), customFlag = false,msg,
		labelFallback = {'Title' : 'Title', 'FirstName' : 'First Name', 'LastName' : 'Last Name', 'FullName' : 'Full Name', 'EmailAddress' : 'Email Address', 'Username' : 'Username', 'Password' : 'Password', 'HomePhone' : 'Home Phone Number', 'WorkPhone' : 'Work Phone Number', 'CellPhone' : 'Cell Phone Number', 'HomeFax' : 'Home Fax Number', 'WorkFax' : 'Work Fax Number', 'HomeAddress' : 'Home Address', 'HomeCity' : 'Home City', 'HomeState' : 'Home State', 'HomeZip' : 'Home Zip', 'HomeCountry' : 'Home Country', 'WorkAddress' : 'WorkAddress', 'WorkCity' : 'Work City', 'WorkState' : 'Work State', 'WorkZip' : 'Work Zip', 'WorkCountry' : 'Work Country', 'WebAddress' : 'Web Address', 'Company' : 'Company', 'DOB' : 'Date of Birth', 'PaymentMethodType' : 'Payment Method', 'BillingAddress' : 'Billing Address', 'BillingCity' : 'Billing City', 'BillingState' : 'Billing State', 'BillingZip' : 'Billing Zip Code', 'BillingCountry' : 'Billing Country', 'ShippingAddress' : 'Shipping Address', 'ShippingCity' : 'Shipping City', 'ShippingState' : 'Shipping State', 'ShippingZip' : 'Shipping Zip Code', 'ShippingCountry' : 'Shipping Country', 'ShippingInstructions' : 'Shipping Instructions', 'ShippingAttention' : 'Shipping Attention', 'Friend01' : 'Friend Email 1', 'Friend02' : 'Friend Email 2', 'Friend03' : 'Friend Email 3', 'Friend04' : 'Friend Email 4', 'Friend05' : 'Friend Email 5', 'Message' : 'Friend Message', 'Anniversary1Title' : 'Anniversary Title', 'Anniversary1' : 'Anniversary', 'Anniversary2Title' : 'Anniversary 2 Title', 'Anniversary2' : 'Anniversary 2', 'Anniversary3Title' : 'Anniversary 3 Title', 'Anniversary3' : 'Anniversary 3', 'Anniversary4Title' : 'Anniversary 4 Title', 'Anniversary4' : 'Anniversary 4', 'Anniversary5Title' : 'Anniversary 5 Title', 'Anniversary5' : 'Anniversary 5', 'FileAttachment' : 'File Attachment', 'CAT_Custom_1423_326' : 'Gender', 'CAT_Custom_1424_326' : 'Height', 'CAT_Custom_1425_326' : 'Marital Status', 'CAT_Custom_1426_326' : 'Has Children', 'CAT_Custom_1427_326' : 'Years in Business', 'CAT_Custom_1428_326' : 'Number of Employees', 'CAT_Custom_1429_326' : 'Annual Revenue', 'CAT_Custom_1430_326' : 'Financial Year', 'InvoiceNumber' : 'Invoice Number', 'CardName' : 'Name on Card', 'CardNumber' : 'Card Number', 'CardExpiryMonth' : 'Card Expiry Month', 'CardExpiryYear' : 'Card Expiry Year', 'CardType' : 'Card Type', 'CardCCV' : 'CCV Number', 'CaptchaV2' : 'Captcha'};

	if (settings.customErrorFields !== '') settings.customErrorFields = settings.customErrorFields.split(',');

	var fieldCheck = {
		types: {
			EmailAddress:		'email',
			Friend01:			'email',
			Friend02:			'email',
			Friend03:			'email',
			Friend04:			'email',
			Friend05:			'email',
			DOB:				'date',
			Anniversary1:		'date',
			Anniversary2:		'date',
			Anniversary3:		'date',
			Anniversary4:		'date',
			Anniversary5:		'date',
			CaptchaV2:			'captcha',
			CardNumber:			'number',
			CardCCV:			'number',
			Amount:				'currency',
			Password:			'password',
			PasswordConfirm:	'passwordconfirm',
			Days:				'days'
		},
		validation: {
			select:				function (required) {return checkDropdown(required.value, required.label)},
			radio:				function (required) {return checkSelected(selector.find('[name="'+required.name+'"]'), required.label)},
			checkbox:			function (required) {return checkSelected(selector.find('[name="'+required.name+'"]'), required.label)},
			email:				function (required) {return checkEmail(required.value)},
			date:				function (required) {return checkDate(required.value,required.label)},
			password:			function (required) {pass.value = required.value; pass.label = required.label; return (required.value !== "" && required.value.length < 6) ? "- Password must be 6 characters or longer" : isEmpty(required.value,required.label)},
			passwordconfirm:	function (required) {return (pass.value.length > 0 && pass.value !== required.value) ? pass.label+' and '+required.label+' do not match' : ''},
			captcha:			function (required) {return captchaIsInvalid(selector[0], "Enter Word Verification in box", "Please enter the correct Word Verification as seen in the image")},
			currency:			function (required) {return isCurrency(required.value, required.label)},
			number:				function (required) {return isNumeric(required.value, required.label)},
			days:				function (required) {return isNumericIfVisible(required.field, required.label)}
		}
	};

	function runValidation (required,counter,total) {
		var rdoChkFlag = false;
		if (counter===0) {errorCount=0;}

		// Check the field for a value change
		required.value = (typeof required.field.val() === 'undefined' || required.field.val() === null) ? '' : required.field.val();

		// verify field types and make adjustments to them as needed.
		if (required.type === 'text' || required.type === 'hidden' || required.type === 'password') {
			required.type = fieldCheck.types[required.name] || 'text';
		}

		for (var i=0; i<settings.customErrorFields.length; i++) {
			if (required.field.is(settings.customErrorFields[i])) {
				customFlag = true;
				break;
			}else customFlag = false;
		}
		if (customFlag === true && settings.customError !== '') {
			$.when(executeCallback(win[settings.customError],required)).then(function(value) {
				required.message = (typeof value === 'undefined') ? '' : value;
			});
		}else {
			// Run the appropriate validator for the field type
			required.message = (typeof fieldCheck.validation[required.type] !== 'undefined') ? fieldCheck.validation[required.type](required) : isEmpty(required.value,required.label);
		}

		required.message = required.message.replace('- ','').replace('\n','');
		if (required.message !=='') {errorCount++;}

		if (settings.validateMode==='alert') {
			if (required.message !=='') {
				if (errorCount===1) {
					errorArray = '- '+required.message+'\n';
				}else {
					errorArray += '- '+required.message+'\n';
				}
			}
			if (counter===total-1 && errorCount !== 0) {
				alert(errorArray);
			}
		}else if (settings.validateMode==='inline') {
			switch (required.type) {
				case 'radio' : errorTarget = selector.find('label[for="'+required.name+'"]'); rdoChkFlag=true; break;
				case 'checkbox' : errorTarget = selector.find('label[for="'+required.name+'"]'); rdoChkFlag = true; break;
				case 'captcha' : errorTarget = (selector.find('#recaptcha_widget_div').length > 0) ? selector.find('#recaptcha_widget_div') : required.field; break;
				default : errorTarget = required.field;
			}
			if (errorTarget.parent().is(settings.errorGroupElement+'.'+settings.errorGroupClass.replace(' ','.'))) {
				errorElementExists = true;
			}else {
				errorElementExists = false;
			}

			if (required.message !=='') {
				if (errorElementExists) {
					// just replace the error message
					errorTarget.siblings(settings.errorMessageElement+'.'+settings.errorClass.replace(' ','.')).text(required.message);
				}else {
					// add the message into new element
					messageElement = '<'+settings.errorMessageElement+' class="'+settings.errorClass+'">'+required.message+'</'+settings.errorMessageElement+'>';
					errorTarget.addClass(settings.errorClass).wrap(errorElement);
					if (rdoChkFlag) selector.find('[name="' + required.name + '"]').addClass(settings.errorClass);
					errorTarget.parent().append(messageElement);
				}
			}else if (errorElementExists) {
				// remove the element
				errorTarget.siblings(settings.errorMessageElement+'.'+settings.errorClass.replace(' ','.')).remove();
				errorTarget.removeClass(settings.errorClass).unwrap();
				if (rdoChkFlag) selector.find('[name="' + required.name + '"]').removeClass(settings.errorClass);
			}
		}
	}
	function buttonSubmitBehaviour(behavior){
		var submitButton = selector.find('[type="submit"]');
		switch(behavior){
			case 'show': submitButton.show(); break;
			case 'hide': submitButton.hide(); break;
			case 'disable': submitButton.attr('disabled','disabled'); break;
			case 'enable': submitButton.removeAttr('disabled'); break;
			default: submitButton.removeAttr('disabled').show();
		}
	}
	function submitForm(submitCount) {
		if (submitCount===0) {
			buttonSubmitBehaviour(settings.buttonOnSubmit);
			if (settings.useAjax) {
				$.ajax({
					type: 'POST',
					url: selector.attr('action'),
					data: selector.serialize(),
					success: function(response,status,xhr) {
						var messageClass = '';
						if (response.indexOf(settings.systemMessageClass) > 0) messageClass = settings.systemMessageClass;
						else if (response.indexOf(settings.systemErrorMessageClass) > 0) messageClass = settings.systemErrorMessageClass;

						if (messageClass !== '') msg = $(response).find('.'+messageClass);
						else if ($(response).is('font')) msg = $(response);

						if ($(msg).size() > 0) successMessage = msg;
						else if (messageClass !== '') {
							successMessage = $(response).filter('.'+messageClass);
							showSuccess(selector,successMessage);
						}

						if (response.indexOf(settings.systemMessageClass) > 0 && settings.ajaxSuccess !== null) executeCallback(window[settings.ajaxSuccess],response,status,xhr);
						else if (response.indexOf(settings.systemErrorMessageClass) > 0 && settings.ajaxError !== null) executeCallback(window[settings.ajaxError],xhr,status,error);
					},
					error: function(xhr,status) {
						if (settings.ajaxError !== null) executeCallback(window[settings.ajaxError],xhr,status,error);
						return false;
					},
					complete: function(xhr,status) {
						if (settings.ajaxComplete !== null) executeCallback(window[settings.ajaxComplete],xhr,status);
						buttonSubmitBehaviour(settings.buttonAfterSubmit);
					}
				});
			}else selector.off('submit').submit();
			return submitCount++;
		}else{
			alert("This form has already been submitted. Please refresh the page if you need to submit again.");
			return false;
		}
	}
	function executeCallback(callback,param1,param2,param3){
		if (typeof callback === 'function') {
			var deferred = $.Deferred();
			if (param3) deferred.resolve(callback(selector,param1,param2,param3));
			else if (param2) deferred.resolve(callback(selector,param1,param2));
			else if (param1) deferred.resolve(callback(selector,param1));
			else deferred.resolve(callback(selector));

			return deferred.promise();
		}
	}
	function showSuccess(selector,successMessage) {
		if (settings.afterAjax !== 'show') selector.fadeOut(0);

		if (successMessage.html().replace(/\n/g,'').replace(/	/g,'').replace(/ /g,'').length === 0 && settings.restoreMessageBox === true) successMessage = messageBoxContents;
		else if(successMessage.find('.search-results').length) successMessage = successMessage.find('.search-results').html();

		if (settings.messageBoxID !== null && settings.messageBox === 'replace') {
			if (settings.messageMode !== 'off') {
				if (settings.messageMode === 'append') selector.after(messageBox);
				else if (settings.messageMode === 'prepend') selector.before(messageBox);
				messageBox.html(successMessage).fadeIn();
			}
		}else if (settings.messageBox !== 'off') {
			if (settings.messageBox === 'append') selector.after(successMessage);
			else if (settings.messageBox === 'prepend') selector.before(successMessage);
			else body.find(settings.messageBox).html(successMessage);
		}

		if (settings.afterAjax === 'remove') selector.remove();
	}
	function buildRequiredObject(rField,i) {
		required[i] = {
			name : rField.attr('name'),
			field : rField,
			type : (rField.is('input')) ? rField.attr('type') : rField.get(0).tagName.toLowerCase(),
			value : (rField.val() === undefined) ? '' : rField.val(),
			label : (selector.find('label[for="'+rField.attr('name')+'"]').length > 0) ? selector.find('label[for="'+rField.attr('name')+'"]').text() : rField.attr('placeholder')
		};
		if (required[i].label === undefined) required[i].label = labelFallback[required[i].name];
	}
	function autoRequirePaymentFields(scope) {
		if (paymentMethods.size() == 1 && $(paymentMethods[0]).val() == '1') onlyCCMethod = true;
		if (paymentMethods.filter(':checked').val() == '1' || onlyCCMethod) {
			scope.find('[name="CardName"], [name="CardNumber"], [name="CardExpiryMonth"], [name="CardExpiryYear"], [name="CardType"], [name="CardCCV"]').addClass(settings.requiredClass);
		}else scope.find('[name="CardName"], [name="CardNumber"], [name="CardExpiryMonth"], [name="CardExpiryYear"], [name="CardType"], [name="CardCCV"]').removeClass(settings.requiredClass);
	}
	function BuildRequiredObjectArray(scope) {
		var i = 0,_this = null;
		required=[];
		// Build required array
		requiredFields = scope.find('input, select, button, textarea').filter('.'+settings.requiredClass);

		for(var cnt=0,len = requiredFields.size(); cnt < len; cnt++){
			_this = requiredFields[cnt];
			newRequired = scope.find('[name="'+$(_this).attr("name")+'"]').not('.'+settings.requiredClass);
			if (newRequired.length > 0) {
				for(var cnt2=0, len2 = $(newRequired).size(); cnt2<len2; cnt2++){
					var newRequiredItem = $(newRequired[cnt2]);
					newRequiredItem.addClass(settings.requiredClass);
					buildRequiredObject(newRequiredItem,i);
					i++;
				}
			}
			buildRequiredObject($(_this),i);
			i++;
		}
	}
	function resetRequiredField(required) {
		if (required.field.is('.'+settings.errorClass)) {
			required.field.siblings(settings.errorMessageElement+'.'+settings.errorClass.replace(' ','.')).remove();
			required.field.removeClass(settings.errorClass).unwrap();
			if (required.type === 'checkbox' || required.type === 'radio') selector.find('[name="' + required.name + '"]').removeClass(settings.errorClass);
			--errorCount;
		}
	}
	function activeValidation(scope) {
		// Set onChangeBinding to true in order to prevent these bindings from occuring multiple times.
		onChangeBinding = true;
		for (var i = 0; i<required.length; i++) {
			scope.on('change','[name="' + required[i].name + '"]', function() {
				for (var i = 0;i<required.length;i++) {
					if ($(this).attr('name') === required[i].name) runValidation(required[i],0,1);
				}
			});
		}
	}
	function moveToContainer(index){
		// show/hide buttons
		if (index === 0) {
			selector.find(settings.submitField +','+ settings.backButton).hide();
			selector.find(settings.continueButton).show();
		}else if (index === multistep.containers.length - 1) {
			selector.find(settings.continueButton).hide();
			selector.find(settings.submitField +','+ settings.backButton).show();
		}else{
			selector.find(settings.continueButton +','+ settings.backButton).show();
			selector.find(settings.submitField).hide();
		}

		// show next step
		selector.find(multistep.containers).removeClass('activeContainer').hide();
		selector.find(multistep.containers[multistep.step]).addClass('activeContainer').show();
		selector.get(0).scrollIntoView();

	}

	buttonSubmitBehaviour(settings.buttonOnLoad);

	// Auto Require certain fields
	autoRequire = ['FirstName','LastName','FullName','EmailAddress','CaptchaV2','ItemName'];
	ccFields = ['CardName','CardNumber','CardExpiryMonth','CardExpiryYear','CardType','CardCCV'];

	for (var i = 0; i< autoRequire.length; i++) {
		autoRequire.field = selector.find('[name="'+autoRequire[i]+'"]');
		if (autoRequire.field.length > 0 && autoRequire.field.not('.'+settings.requiredClass)) autoRequire.field.addClass(settings.requiredClass);
	}

	// Auto require credit card fields depending upon payment method
	autoRequirePaymentFields(selector);
	selector.on('change',paymentMethods,function() {
		autoRequirePaymentFields(selector);
		if (multistep.containers.length > 0) BuildRequiredObjectArray(selector.find(multistep.containers[multistep.step]));
		else BuildRequiredObjectArray(selector);
	});


	// If multistep true configure validations on containers
	if (multistep.containers.length > 0) {

		// start on the first container
		moveToContainer(multistep.step);

		selector.on('click',settings.continueButton,function(event){
			event.preventDefault();
			BuildRequiredObjectArray(selector.find(multistep.containers[multistep.step]));

			for (var i = 0; i<required.length; i++) {
				runValidation(required[i],i,required.length);
			}
			if (errorCount === 0) moveToContainer(++multistep.step);
			else if (settings.validateMode === 'inline') {
				// Now that submission has been attempted, allow active field validation.
				activeValidation(selector.find(multistep.containers[multistep.step]));
			}
		});

		selector.on('click',settings.backButton,function(event){
			event.preventDefault();
			for (var i = 0; i<required.length; i++) {
				resetRequiredField(required[i]);
			}
			moveToContainer(--multistep.step);
		});

		// prevent the enter key from submitting the form until the last step
		selector.on('keypress',function(e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				if (selector.find(settings.continueButton).filter(':visible').size() > 0) selector.find(settings.continueButton).filter(':visible').trigger('click');
				else selector.find('[type="submit"]:visible').trigger('click');
			}
		});

	}

	// bind to the submit event of our form
	selector.on('submit',function(event) {
		event.preventDefault();

		BuildRequiredObjectArray(selector);

		if (lockSubmit) return false;
		else lockSubmit = true;
		if (settings.validateMode !== 'off') {
			for (var i = 0;i<required.length;i++) {
				runValidation(required[i],i,required.length);
			}
		}
		if (errorCount === 0) {
			if (settings.validationSuccess !== null) {
				$.when(executeCallback(win[settings.validationSuccess])).then(function(value) {
					if (value !== 'stop' && settings.noSubmit === false) submitForm(submitCount);
				});
			}else if (settings.noSubmit === false) submitForm(submitCount);
		}
		else
			if (settings.validationError !== null) executeCallback(window[settings.validationError]);
		// Now that submission has been attempted, allow active field validation.
		if (settings.validateMode === 'inline' && onChangeBinding !== true) {
			activeValidation(selector);
		}
		lockSubmit = false;
	});

	// Autosubmit
	if (settings.submitEvent === 'ready') {
		selector.submit();
	}

	// Activate submitEvent
	if (settings.submitField !== '[type="submit"]' && settings.submitEvent !== null) {
		submitField = selector.find(settings.submitField);
		if (submitField.length > 0) {
			selector.on(settings.submitEvent,settings.submitField,function(){
				selector.submit();
			});
		}
	}
};
