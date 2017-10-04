/*
 * "FormMagic". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.FormMagic = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'FormMagic',
		version: '2017.10.04',
		defaults: {
			'submitMode' : 'standard', // 'ajax', 'webapp', 'webapp.item', 'off'
			'submitEvent' : 'submit',
			'submitField' : '[type="submit"]', // comma separated list of fields that can be used to submit the form. CSS syntax.
			'validateMode' : 'inline', // 'alert', 'off'
			'steps' : '', // multistep container selectors, separated by comma
			'prev' : '', // back button selector for multistep form
			'next' : '', // Continue button selector for multistep form
			'beforeResponseMode' : 'off', // off, prepend, append, before, append, replace
			'beforeResponseMessage' : null, // a css selector with a message to display during the submission process.
			'beforeResponseTarget' : selector, // selector, alert, css selector
			'responseMode' : 'replace', // off, prepend, append, before, append, replace
			'responseTarget' : selector, // where to show an ajax response after submission. 'selector' replaces the form with the message, 'off' returns no message, 'alert' displays the message in a temporary alert box, 'dialog' displays the message in a dialog box. Otherwise, a CSS selector indicates where to put the message.
			'restoreTarget' : true, // If ajax submission result is empty, the contents of the responseTarget will be restored. This is particularly helpful with live searches.
			'successMessage': null, // null tells FormMagic to find the message via ajax, using the 'systemMessageClass'. Otherwise, text in this option will be used for the success message, and shown in an Alertify notification.
			'errorMessage': null, // null tells FormMagic to find the message via ajax, using the 'systemErrorMessageClass'. Otherwise, text in this option will be used for the error message, and shown in an Alertify notification.
			'formBeforeResponse' : null, // null, 'hide'
			'formOnSuccessResponse' : null, // null, 'hide', 'show'
			'formOnErrorResponse' : null, // null, 'hide', 'show'
			'buttonOnSubmit' : 'off', // disable,hide
			'buttonOnResponse' : 'off', // disable,hide
			'validationGroupElement' : 'div', // the default parent element to receive the validationGroupClass. It will be the closest matching parent.
			'validationGroupClass' : 'validation-group',
			'validationMessageElement' : 'small',
			'validationMessageClass' : 'validation-message',
			'validationInputClass' : 'validation-input',
			'errorClass' : 'error',
			'validClass' : 'valid',
			'requiredClass' : 'required',
			'systemMessageClass' : 'system-message',
			'systemErrorMessageClass' : 'system-error-message',
			'fieldTitleAttr' : 'label', // or specify a field attribute
			'fieldNameAttr' : 'name', // specify which attribute has the field name
			'customErrorFields' : '', // takes a comma delimited list of selectors to match against during validation
			'customError' : null, // specify a custom validation function to run against a comma delimeted list of selectors
			'beforeValidation' : null, // specify a function to run before validation
			'validationSuccess' : null, // specify a function to run after validation, but before submission
			'validationError' : null, // specify a function to run after validation returns errors
			'ajaxSuccess' : null, // specify a function to run after an Ajax submission 'success' response. Or 'refresh' to reload the page.
			'ajaxError' : null, // specify a function to run after an Ajax submission 'error' response
			'ajaxComplete' : null, // specify a function to run after an Ajax submission 'complete' response
			'async' : true, // if submitMode:ajax, this determines the async mode
			'onStep' : null, // specify a function to run on multistep step (either direction)
			'onPrev' : null, // specify a function to run on step backwards
			'onNext' : null // specify a function to run on step forward
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
		validatelang = {
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
	if (selector.find('[type=submit]').length > 0 && settings.fieldNameAttr !== 'type') selector.find('[type=submit]').removeAttr(settings.fieldNameAttr);

	function formfield(strng, actiontype) {

		switch (actiontype) {
			// makes first letter upper and all else lower, removes (.) and (,)
			case 'firstupper':
				var allCaps = true;
				var allLower = true;
				// handle surnames properly, e.g. McDermon, deCaprio, if all lower or all upper, we change, otherwise we don't
				// we ignore the first character, e.g. Johnson
				for (var i = 1; i < strng.length; i++) {
					var c = strng.charCodeAt(i);
					if (c >= 65 && c <= 90)
						allLower = false;
					if (c >= 97 && c <= 127)
						allCaps = false;
				}
				if (allCaps || allLower) {
					var word = strng.split(" ");
					strng = "";
					for (var i = 0; i < word.length; i++) {
						if (word[i].length >= 1) {
							strng = strng + " " + word[i].substring(0, 1).toUpperCase() + word[i].substring(1).toLowerCase();
						}
					}
				}
				strng = strng.replace(".", "");
				strng = strng.replace(",", "");
				break;

				// makes first letter upper only and does not affect any other letters or punctuation
			case 'firstupperspecial':
				var word = strng.split(" ");
				strng = ""
				for (var i = 0; i < word.length; i++) {
					if (word[i].length >= 1) {
						strng = strng + " " + word[i].substring(0, 1).toUpperCase() + word[i].substring(1);
					}
				}
				break;

			case 'alllower':
				strng = strng.toLowerCase();
				break;

			case 'allupper':
				strng = strng.toUpperCase();
				break;

			default:
				break;
		}
		if (strng.substring(0, 1) == " ") {
			strng = strng.substring(1);
		}
		return strng;
	}

	function isCurrency(s, FieldName) {
		var error = "";
		if (s.length == 0) {
			error = "- " + FieldName + validatelang.Currency.MustNumber;
		} else {
			for (var i = 0; i < s.length; i++) {
				var c = s.charAt(i);
				if ((c < "0") || (c > "9")) {
					if (c != "." && c != ",") // with multilingual in europe $3.33 = $3,33
						error = "- " + FieldName + validatelang.Currency.NoSymbol;
				}
			}
		}
		return error;
	}

	function isNumeric(s, FieldName) {
		var error = "";
		if (s.length == 0) {
			error = "- " + FieldName + validatelang.Number.MustNumber;
		} else {
			var i;
			for (i = 0; i < s.length; i++) {
				var c = s.charAt(i);
				if ((c < "0") || (c > "9")) {
					error = "- " + FieldName + validatelang.Number.NoDecimal;
					return error;
				}
			}
		}
		return error;
	}

	function isNumericGreaterThan(s, FieldName, minValue) {
		var error = "";
		var inputNumber = 0;
		
		if (s.length == 0) {
			error = "- " + FieldName + validatelang.Number.MustNumber;
		} else {
			var i;
			for (i = 0; i < s.length; i++) {
				var c = s.charAt(i);
				if ((c < "0") || (c > "9")) {
					error = "- " + FieldName + validatelang.Number.NoDecimal;
					return error;
				}
				inputNumber = inputNumber * 10 + parseInt(c);
			}
			
			if (inputNumber <= minValue){
				error = "- " + FieldName + validatelang.Number.GreaterThan.replace(/\{0\}/g, minValue)  ;
				return error;
			}
		}
		return error;
	}

	function isFloat(s, FieldName) {
		var error = "";
		var i;
		if (s.length == 0) {
			error = "- " + FieldName + validatelang.Float.MustNumber;
		} else {
			for (i = 0; i < s.length; i++) {
				var c = s.charAt(i);
				if (((c < "0") || (c > "9"))) {

					if (c != "." && c != ",") {
						error = "- " + FieldName + validatelang.Float.MustNumber;
						return error;
					}
				}
			}
		}
		return error;
	}

	function isEmpty(strng, FieldName) {
		var error = "";
		if (strng.trim().length == 0) {
			error = validatelang.Enter.PleaseEnter + FieldName + "\n";
		}
		return error;
	}

	function isCharacterLimitExceededGeneric(strng, limit, FieldName, message) {
		var error = "";
		if (strng.length > limit) {
			error = '- ' + FieldName + message.replace(/\{0\}/g, limit) + "\n";
		}
		return error;
	}

	function isCharacterLimitExceeded(strng, limit, FieldName) {
		return isCharacterLimitExceededGeneric(strng, limit, FieldName, validatelang.TextMultiline.MaxCharacters);
	}

	function isCharacterLimitExceededRich(strng, limit, FieldName) {
		return isCharacterLimitExceededGeneric(strng, limit, FieldName, validatelang.TextMultiline.MaxCharactersRich);
	}

	function checkDropdown(strng, FieldName) {
		var error = "";
		if (strng.length == 0 || strng == " ") { // we put a space to ensure value attribute is not stripped by browser in WYSIWYG editor
			error = validatelang.Select.PleaseSelect + FieldName + "\n";
		}
		return error;
	}

	function checkEmail(strng) {
		var error = "";
		if (strng.length > 0) {
			// TLDs from http://data.iana.org/TLD/tlds-alpha-by-domain.txt 
			var emailFilter = new RegExp('^[a-zA-Z0-9._-]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+(?:aaa|abb|abbott|abogado|ac|academy|accenture|accountant|accountants|aco|active|actor|ad|ads|adult|ae|aeg|aero|af|afl|ag|agency|ai|aig|airforce|airtel|al|allfinanz|alsace|am|amica|amsterdam|android|ao|apartments|app|aq|aquarelle|ar|archi|army|arpa|as|asia|associates|at|attorney|au|auction|audio|auto|autos|aw|ax|axa|az|azure|ba|band|bank|bar|barcelona|barclaycard|barclays|bargains|bauhaus|bayern|bb|bbc|bbva|bcn|bd|be|beer|bentley|berlin|best|bet|bf|bg|bh|bharti|bi|bible|bid|bike|bing|bingo|bio|biz|bj|black|blackfriday|bloomberg|blue|bm|bms|bmw|bn|bnl|bnpparibas|bo|boats|bom|bond|boo|boots|boutique|br|bradesco|bridgestone|broker|brother|brussels|bs|bt|budapest|build|builders|business|buzz|bv|bw|by|bz|bzh|ca|cab|cafe|cal|camera|camp|cancerresearch|canon|capetown|capital|car|caravan|cards|care|career|careers|cars|cartier|casa|cash|casino|cat|catering|cba|cbn|cc|cd|ceb|center|ceo|cern|cf|cfa|cfd|cg|ch|chanel|channel|chat|cheap|chloe|christmas|chrome|church|ci|cipriani|cisco|citic|city|ck|cl|claims|cleaning|click|clinic|clothing|cloud|club|clubmed|cm|cn|co|coach|codes|coffee|college|cologne|com|commbank|community|company|computer|condos|construction|consulting|contractors|cooking|cool|coop|corsica|country|coupons|courses|cr|credit|creditcard|cricket|crown|crs|cruises|csc|cu|cuisinella|cv|cw|cx|cy|cymru|cyou|cz|dabur|dad|dance|date|dating|datsun|day|dclk|de|deals|degree|delivery|dell|delta|democrat|dental|dentist|desi|design|dev|diamonds|diet|digital|direct|directory|discount|dj|dk|dm|dnp|do|docs|dog|doha|domains|doosan|download|drive|durban|dvag|dz|earth|eat|ec|edu|education|ee|eg|email|emerck|energy|engineer|engineering|enterprises|epson|equipment|er|erni|es|esq|estate|et|eu|eurovision|eus|events|everbank|exchange|expert|exposed|express|fage|fail|faith|family|fan|fans|farm|fashion|feedback|fi|film|final|finance|financial|firmdale|fish|fishing|fit|fitness|fj|fk|flights|florist|flowers|flsmidth|fly|fm|fo|foo|football|forex|forsale|forum|foundation|fr|frl|frogans|fund|furniture|futbol|fyi|ga|gal|gallery|game|garden|gb|gbiz|gd|gdn|ge|gea|gent|genting|gf|gg|ggee|gh|gi|gift|gifts|gives|giving|gl|glass|gle|global|globo|gm|gmail|gmo|gmx|gn|gold|goldpoint|golf|goo|goog|google|gop|gov|gp|gq|gr|graphics|gratis|green|gripe|group|gs|gt|gu|guge|guide|guitars|guru|gw|gy|hamburg|hangout|haus|healthcare|help|here|hermes|hiphop|hitachi|hiv|hk|hm|hn|hockey|holdings|holiday|homedepot|homes|honda|horse|host|hosting|hoteles|hotmail|house|how|hr|hsbc|ht|hu|hyundai|ibm|icbc|ice|icu|id|ie|ifm|iinet|il|im|immo|immobilien|in|industries|infiniti|info|ing|ink|institute|insure|int|international|investments|io|ipiranga|iq|ir|irish|is|ist|istanbul|it|itau|iwc|java|jcb|je|jetzt|jewelry|jlc|jll|jm|jo|jobs|joburg|jp|jprs|juegos|kaufen|kddi|ke|kg|kh|ki|kia|kim|kinder|kitchen|kiwi|km|kn|koeln|komatsu|kp|kr|krd|kred|kw|ky|kyoto|kz|la|lacaixa|lancaster|land|lasalle|lat|latrobe|law|lawyer|lb|lc|lds|lease|leclerc|legal|lexus|lgbt|li|liaison|lidl|life|lighting|limited|limo|linde|link|live|lixil|lk|loan|loans|lol|london|lotte|lotto|love|lr|ls|lt|ltd|ltda|lu|lupin|luxe|luxury|lv|ly|ma|madrid|maif|maison|man|management|mango|market|marketing|markets|marriott|mba|mc|md|me|media|meet|melbourne|meme|memorial|men|menu|mg|mh|miami|microsoft|mil|mini|mk|ml|mm|mma|mn|mo|mobi|moda|moe|moi|mom|monash|money|montblanc|mormon|mortgage|moscow|motorcycles|mov|movie|movistar|mp|mq|mr|ms|mt|mtn|mtpc|mtr|mu|museum|mv|mw|mx|my|mz|na|nadex|nagoya|name|navy|nc|ne|nec|net|netbank|network|neustar|new|news|nexus|nf|ng|ngo|nhk|ni|nico|ninja|nissan|nl|no|nokia|np|nr|nra|nrw|ntt|nu|nyc|nz|obi|office|okinawa|om|omega|one|ong|onl|online|ooo|oracle|orange|org|organic|osaka|otsuka|ovh|pa|page|panerai|paris|partners|parts|party|pe|pet|pf|pg|ph|pharmacy|philips|photo|photography|photos|physio|piaget|pics|pictet|pictures|pink|pizza|pk|pl|place|play|plumbing|plus|pm|pn|pohl|poker|porn|post|pr|praxi|press|pro|prod|productions|prof|properties|property|protection|ps|pt|pub|pw|py|qa|qpon|quebec|racing|re|realtor|realty|recipes|red|redstone|rehab|reise|reisen|reit|ren|rent|rentals|repair|report|republican|rest|restaurant|review|reviews|rich|ricoh|rio|rip|ro|rocks|rodeo|rs|rsvp|ru|ruhr|run|rw|ryukyu|sa|saarland|sakura|sale|samsung|sandvik|sandvikcoromant|sanofi|sap|sarl|saxo|sb|sc|sca|scb|schmidt|scholarships|school|schule|schwarz|science|scor|scot|sd|se|seat|security|seek|sener|services|seven|sew|sex|sexy|sg|sh|shiksha|shoes|show|shriram|si|singles|site|sj|sk|ski|sky|skype|sl|sm|sn|sncf|so|soccer|social|software|sohu|solar|solutions|sony|soy|space|spiegel|spreadbetting|sr|srl|st|stada|starhub|statoil|stc|stcgroup|stockholm|studio|study|style|su|sucks|supplies|supply|support|surf|surgery|suzuki|sv|swatch|swiss|sx|sy|sydney|systems|sz|taipei|tatamotors|tatar|tattoo|tax|taxi|tc|td|team|tech|technology|tel|telefonica|temasek|tennis|tf|tg|th|thd|theater|theatre|tickets|tienda|tips|tires|tirol|tj|tk|tl|tm|tn|to|today|tokyo|tools|top|toray|toshiba|tours|town|toyota|toys|tr|trade|trading|training|travel|trust|tt|tui|tv|tw|tz|ua|ubs|ug|uk|university|uno|uol|us|uy|uz|va|vacations|vc|ve|vegas|ventures|versicherung|vet|vg|vi|viajes|video|villas|vin|virgin|vision|vista|vistaprint|viva|vlaanderen|vn|vodka|vote|voting|voto|voyage|vu|wales|walter|wang|watch|webcam|website|wed|wedding|weir|wf|whoswho|wien|wiki|williamhill|win|windows|wine|wme|work|works|world|ws|wtc|wtf|xbox|xerox|xin|xn--11b4c3d|xn--1qqw23a|xn--30rr7y|xn--3bst00m|xn--3ds443g|xn--3e0b707e|xn--3pxu8k|xn--42c2d9a|xn--45brj9c|xn--45q11c|xn--4gbrim|xn--55qw42g|xn--55qx5d|xn--6frz82g|xn--6qq986b3xl|xn--80adxhks|xn--80ao21a|xn--80asehdb|xn--80aswg|xn--90a3ac|xn--90ais|xn--9dbq2a|xn--9et52u|xn--b4w605ferd|xn--c1avg|xn--c2br7g|xn--cg4bki|xn--clchc0ea0b2g2a9gcd|xn--czr694b|xn--czrs0t|xn--czru2d|xn--d1acj3b|xn--d1alf|xn--efvy88h|xn--estv75g|xn--fhbei|xn--fiq228c5hs|xn--fiq64b|xn--fiqs8s|xn--fiqz9s|xn--fjq720a|xn--flw351e|xn--fpcrj9c3d|xn--fzc2c9e2c|xn--gecrj9c|xn--h2brj9c|xn--hxt814e|xn--i1b6b1a6a2e|xn--imr513n|xn--io0a7i|xn--j1aef|xn--j1amh|xn--j6w193g|xn--kcrx77d1x4a|xn--kprw13d|xn--kpry57d|xn--kput3i|xn--l1acc|xn--lgbbat1ad8j|xn--mgb9awbf|xn--mgba3a4f16a|xn--mgbaam7a8h|xn--mgbab2bd|xn--mgbayh7gpa|xn--mgbbh1a71e|xn--mgbc0a9azcg|xn--mgberp4a5d4ar|xn--mgbpl2fh|xn--mgbx4cd0ab|xn--mk1bu44c|xn--mxtq1m|xn--ngbc5azd|xn--node|xn--nqv7f|xn--nqv7fs00ema|xn--nyqy26a|xn--o3cw4h|xn--ogbpf8fl|xn--p1acf|xn--p1ai|xn--pgbs0dh|xn--pssy2u|xn--q9jyb4c|xn--qcka1pmc|xn--rhqv96g|xn--s9brj9c|xn--ses554g|xn--t60b56a|xn--tckwe|xn--unup4y|xn--vermgensberater-ctb|xn--vermgensberatung-pwb|xn--vhquv|xn--vuq861b|xn--wgbh1c|xn--wgbl6a|xn--xhq521b|xn--xkc2al3hye2a|xn--xkc2dl3a5ee0h|xn--y9a3aq|xn--yfro4i67o|xn--ygbi2ammx|xn--zfr164b|xperia|xxx|xyz|yachts|yamaxun|yandex|ye|yodobashi|yoga|yokohama|youtube|yt|za|zip|zm|zone|zuerich|zw)$', 'i');
			if (!(emailFilter.test(strng)))
				error = validatelang.Email.ValidEmail;
			else {
				// Check email for illegal characters
				var illegalChars = /[\(\)\<\>\,\;\:\\\"\[\]]/
				if (strng.match(illegalChars))
					error = validatelang.Email.Illegal;
			}
		} else
			error = validatelang.Email.ValidEmail;

		return error;
	}

	// Checks in a checkbox or radio list that at least one item is selected
	function checkSelected(FieldName, strng) {
		var error = "- " + strng + validatelang.Select.MustSelect;
		if (FieldName.length > 0) {
			for (var i = 0; i < FieldName.length; i++) {
				if (FieldName[i].disabled == false && FieldName[i].checked == true) error = "";
			}
		} else
		if (FieldName.disabled == false && FieldName.checked == true) error = "";
		return error;
	}

	// returns the selected value from a radio list or nothing
	function getRadioSelected(FieldName) {
		if (FieldName.length > 0) {
			for (var i = 0; i < FieldName.length; i++) {
				if (FieldName[i].disabled == false && FieldName[i].checked == true)
					return FieldName[i].value;
			}
		} else
		if (FieldName.disabled == false && FieldName.checked == true)
			return FieldName.value;
		return null;
	}

	// Checks asp.net checkbox lists as the elements of a checkbox have 2 extra characters
	// appended to each one which makes the name no longer unique
	function checkSelectedX(FieldName, strng) {
		var error = "- " + strng + validatelang.Select.MustSelect;
		var table = document.getElementById(FieldName);
		var cells = table.getElementsByTagName("td");
		var ctrl;
		for (var i = 0; i < cells.length; i++) {
			ctrl = cells[i].firstChild;
			if (ctrl && (ctrl.type == 'checkbox' || ctrl.type == 'radio'))
				if (ctrl.disabled == false && ctrl.checked == true)
					error = "";
		}
		return error;
	}

	function checkSpaces(strng, FieldName) {
		var error = "";
		for (var i = 0; i < strng.length; i++) {
			if (strng.charAt(i) == " ")
				error = "- " + FieldName + validatelang.Others.CannotContain + validatelang.Others.WhiteSpace;
		}
		return error;
	}

	// consistent with General->Check_URLChar()
	function checkUrlChar(strng, FieldName) {
		var error = "";
		for (i = 0; i < strng.length; i++) {
			var c = strng.charAt(i);
			switch (c) {
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
					error = "- " + FieldName + validatelang.Others.CannotContain + "[" + c + "] " + validatelang.Others.Character;
					return error;
			}
		}
		return error;
	}

	function isInteger(s) {
		var i;

		if (s.length == 0)
			return false;

		for (i = 0; i < s.length; i++) {
			// Check that current character is number.
			var c = s.charAt(i);
			if (((c < "0") || (c > "9"))) return false;
		}
		// All characters are numbers.
		return true;
	}

	// Checks to see if a date is valid. All date fields inside admin are readonly, if this function
	// is called and no value is entered then the date is invalid, otherwise always valid
	function checkDate(d, FieldName) {
		var error = "";

		if (d.length == 0) {
			error = validatelang.Enter.PleaseEnter + FieldName + validatelang.CheckDate.ValidDate;
			return error;
		}
		return error;
	}

	function appendBreak(msg) {
		return msg = msg + '\n';
	}

	String.prototype.trim = function() {
		a = this.replace(/^\s+/, '');
		return a.replace(/\s+$/, '');
	}



	function addEventSimple(obj, evt, fn) {
		if (obj.addEventListener)
			obj.addEventListener(evt, fn, false);
		else if (obj.attachEvent)
			obj.attachEvent('on' + evt, fn);
	}

	function sendRequestSync(url, callback, postData) {
		var req = createXMLHTTPObject();
		if (!req) return;
		var method = (postData) ? "POST" : "GET";
		req.open(method, url, false);
		if (postData)
			req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

		req.send(postData);

		if (req.status === 200) {
			return req.responseText;
		}
	}

	var XMLHttpFactories = [
		function() {
			return new XMLHttpRequest()
		},
		function() {
			return new ActiveXObject("Msxml2.XMLHTTP")
		},
		function() {
			return new ActiveXObject("Msxml3.XMLHTTP")
		},
		function() {
			return new ActiveXObject("Microsoft.XMLHTTP")
		}
	];

	function createXMLHTTPObject() {
		var xmlhttp = false;
		for (var i = 0; i < XMLHttpFactories.length; i++) {
			try {
				xmlhttp = XMLHttpFactories[i]();
			} catch (e) {
				continue;
			}
			break;
		}
		return xmlhttp;
	}

	for (var i = 0; i < document.forms.length; i++) {
		initCaptchaOnForm(document.forms[i]);
	}

	function initCaptchaOnForm(f) {
		if (f._CaptchaHookedUp)
			return;

		if (!f.CaptchaV2)
			return;

		if (!f.CaptchaHV2)
			return;

		f._CaptchaHookedUp = true;
	}

	function reCaptchaV2IsInvalid(f, messageWhenRobot) {
		if (typeof f['g-recaptcha-response'] != "undefined") {
			var hidden = f['bc-recaptcha-token'];
			var captchaId = hidden.getAttribute('data-recaptcha-id');
			var isValid = reCaptchaV2Manager.isInstanceVerified(captchaId);

			if (!isValid)
				return "- " + messageWhenRobot;
		}
		return "";
	}

	function captchaIsInvalid(f, messageWhenEmpty, messageWhenInvalid) {
		if ((f._CaptchaTextValidated === true) && (f._CaptchaTextIsInvalid === false)) {
			return "";
		}

		if (typeof f.ReCaptchaChallenge != "undefined") {
			var key = Recaptcha.get_challenge();
			var answer = Recaptcha.get_response();

			if (answer.trim().length == 0)
				return "- " + messageWhenEmpty;

			f.ReCaptchaAnswer.value = Recaptcha.get_response();
			f.ReCaptchaChallenge.value = Recaptcha.get_challenge();

			var response = sendRequestSync('/ValidateCaptcha.ashx?key=' + key + '&answer=' + answer + '&imageVerificationType=recaptcha');
			f._CaptchaTextIsInvalid = response == 'false';
			f._CaptchaTextValidated = true;
			if (f._CaptchaTextIsInvalid) {
				regenerateCaptcha(f);
			}
		} else {
			var key = f.CaptchaHV2.value;
			var answer = f.CaptchaV2.value;
			var correctCaptchaLength = 6;

			if (answer.trim().length == 0)
				return "- " + messageWhenEmpty;

			if (answer.length != correctCaptchaLength) {
				f._CaptchaTextIsInvalid = true;
			} else {
				var response = sendRequestSync('/ValidateCaptcha.ashx?key=' + key + '&answer=' + answer);
				f._CaptchaTextIsInvalid = response == 'false';
				f._CaptchaTextValidated = true;
				if (f._CaptchaTextIsInvalid) {
					regenerateCaptcha(f);
				}
			}
		}


		if (f._CaptchaTextIsInvalid)
			return "- " + messageWhenInvalid;

		return "";
	}

	function regenerateCaptcha(f) {
		f._CaptchaTextValidated = false;
		f._CaptchaTextIsInvalid = true;

		if (typeof f.ReCaptchaChallenge != "undefined") {
			Recaptcha.reload();
		} else {
			var key = sendRequestSync('/CaptchaHandler.ashx?Regenerate=true&rand=' + Math.random());

			f.CaptchaHV2.value = key;
			f.CaptchaV2.value = "";

			var imgs = f.getElementsByTagName("img");
			if (imgs.length == 0) { // fix for broken dom in ie9
				if ((f.parentNode.nodeName.toLowerCase() == "p") && (f.parentNode.nextSibling) && (f.parentNode.nextSibling.nodeName.toLowerCase() == "table") && (f.parentNode.nextSibling.className == "webform")) {
					imgs = f.parentNode.nextSibling.getElementsByTagName("img");
				}
			}

			for (var i = 0; i < imgs.length; i++) {
				var src = imgs[i].src;
				var srcLower = src.toLowerCase();
				if (srcLower.indexOf("/captchahandler.ashx") > -1) {
					var p1 = srcLower.indexOf("?id=") + 4;
					var p2 = srcLower.indexOf("&", p1);
					var oldKey = src.substring(p1, p2);
					var newSrc = src.replace(oldKey, key);

					imgs[i].src = newSrc;

					break;
				}
			}
		}
	}

	function isNumericIfVisible(s, FieldName) {
		var error = "";
		if (s.style.display == 'inline') {
			if (s.value.length == 0) {
				error = "- " + FieldName + validatelang.Number.MustNumber;
			} else {
				var i;
				for (i = 0; i < s.value.length; i++) {
					var c = s.value.charAt(i);
					if ((c < "0") || (c > "9")) {
						error = "- " + FieldName + validatelang.Number.NoDecimal;
						return error;
					}
				}
			}
		}
		return error;
	}

	function checkIPAddress(text) {
		var reg = /^\s*((0|[1-9]\d?|1\d{2}|2[0-4]\d|25[0-5])\.){3}(0|[1-9]\d?|1\d{2}|2[0-4]\d|25[0-5])\s*$/;
		if (reg.test(text)) return '';
		return validatelang.IP.Illegal;
	}

	/* reCaptchaV2Manager - manages all ReCaptcha V2 operations 
	*/
	var reCaptchaV2Manager = (function(){
		var _controlInstances = {};
		var _dataObjects = [];

		function initializeControls() {
			if (_dataObjects.length == 0) {
				return;
			}

			retrieveTokensWithAjax(_dataObjects.length, function(tokens) {
				for(var i=0; i<_dataObjects.length && i<tokens.length; i++) {
					var crtDataObject = _dataObjects[i];

					var hidden = document.getElementById('token' + crtDataObject.id);
					hidden.value = tokens[i];

					var renderParams = {
						'sitekey': crtDataObject.sitekey,
						'type': crtDataObject.type,
						'theme': crtDataObject.theme,
						'size': crtDataObject.size
					};

					if (typeof _controlInstances[crtDataObject.id] == "undefined") {
						_controlInstances[crtDataObject.id] = grecaptcha.render('recaptcha' + crtDataObject.id, renderParams);
					}
					else {
						grecaptcha.reset(_controlInstances[crtDataObject.id], renderParams);
					}
				}
			});
		}

		function retrieveTokensWithAjax(count, callback) {
			var req = new XMLHttpRequest();
			req.onreadystatechange = function() {
				if (req.readyState == 4 && req.status == 200) {
					var tokens = req.responseText.split(';');
					callback(tokens);
				}
			};

			req.open('GET', '/CaptchaHandler.ashx?RegenerateV2=true&count=' + count + '&rand=' + Math.random(), true);
			req.send();
		}

		return {
			/* Needs to be assigned as the onload handler for the google reCaptcha V2 library.
			*/
			onLoadHandler: function() {
				window.setTimeout(initializeControls, 1);
			},
			/* Use this method to register the parameters for each reCaptcha instance that will be rendered as a control 
			** during the onLoadHandler.
			*/
			registerInstance: function(data) {
				if(data) {
					_dataObjects.push(data);
				}
			},
			/* Call this method reinitialize all ReCaptcha V2 controls corresponding to the registered instances.
			*/
			reloadControls: function() {
				initializeControls();
			},
			/* Checks if the validation has been performed on the given captcha control.
			*/
			isInstanceVerified: function(captchaId){
				if(typeof _controlInstances[captchaId] != "undefined") {
					var googleAnswer = grecaptcha.getResponse(_controlInstances[captchaId]);

					// The google answer will be an empty string if the recaptcha instance has 
					// not been validated
					return googleAnswer.trim().length != 0;
				}
				else {
					return false;
				}
			}
		};
	})();

	if (settings.steps === '' && typeof settings.containers !== 'undefined') settings.steps = settings.containers;
	if (settings.prev === ''  && typeof settings.backButton !== 'undefined') settings.prev = settings.backButton;
	if (settings.next === ''  && typeof settings.continueButton !== 'undefined') settings.next = settings.continueButton;
	if (settings.onPrev === ''  && typeof settings.onBack !== 'undefined') settings.onPrev = settings.onBack;
	if (settings.onNext === ''  && typeof settings.onContinue !== 'undefined') settings.onNext = settings.onContinue;
	if (settings.responseMode === 'replace'  && typeof settings.messageMode !== 'undefined') settings.responseMode = settings.messageMode;
	if (settings.responseTarget === selector  && typeof settings.messageBox !== 'undefined') settings.responseTarget = settings.messageBox;
	if (settings.restoreTarget === true  && typeof settings.restoreMessageBox !== 'undefined') settings.restoreTarget = settings.restoreMessageBox;
	if (settings.formOnSuccessResponse === null  && typeof settings.afterAjax !== 'undefined') settings.formOnSuccessResponse = settings.afterAjax;
	if (settings.formOnErrorResponse === null  && typeof settings.afterAjax !== 'undefined') settings.formOnErrorResponse = settings.afterAjax;
	if (settings.buttonOnResponse === null  && typeof settings.buttonAfterSubmit !== 'undefined') settings.buttonOnResponse = settings.buttonAfterSubmit;
	if (settings.submitMode === 'standard') {
		if (typeof settings.mode !== 'undefined') settings.submitMode = settings.mode;
		else if (typeof settings.noSubmit !== 'undefined' && settings.noSubmit === true) settings.submitMode = 'off';
		else if (typeof settings.useAjax !== 'undefined' && settings.useAjax === true) settings.submitMode = 'ajax';
	}
	

	// setup some local variables
	var requiredFields,required=[],submitCount=0,
		errorArray=[],errorElement='<'+settings.validationGroupElement+' class="'+settings.validationGroupClass+'"></'+settings.validationGroupElement+'>',newRequired,pass={},
		validationTarget,successMessage,messageElement,selectorResponse,onChangeBinding,errorElementExists,errorCount=0,autoRequire,currentName,submitField,
		paymentMethods = selector.find('['+settings.fieldNameAttr+'="PaymentMethodType"]'), onlyCCMethod = false,
		multistep = {containers: selector.find(settings.steps), step: 0},
		lockSubmit = false, messageBoxContents = (body.find(settings.responseTarget).length > 0) ? body.find(settings.responseTarget).html() : selector.html(), customFlag = false,msg,
		labelFallback = {'Title' : 'Title', 'FirstName' : 'First Name', 'LastName' : 'Last Name', 'FullName' : 'Full Name', 'EmailAddress' : 'Email Address', 'Username' : 'Username', 'Password' : 'Password', 'HomePhone' : 'Home Phone Number', 'WorkPhone' : 'Work Phone Number', 'CellPhone' : 'Cell Phone Number', 'HomeFax' : 'Home Fax Number', 'WorkFax' : 'Work Fax Number', 'HomeAddress' : 'Home Address', 'HomeCity' : 'Home City', 'HomeState' : 'Home State', 'HomeZip' : 'Home Zip', 'HomeCountry' : 'Home Country', 'WorkAddress' : 'WorkAddress', 'WorkCity' : 'Work City', 'WorkState' : 'Work State', 'WorkZip' : 'Work Zip', 'WorkCountry' : 'Work Country', 'WebAddress' : 'Web Address', 'Company' : 'Company', 'DOB' : 'Date of Birth', 'PaymentMethodType' : 'Payment Method', 'BillingAddress' : 'Billing Address', 'BillingCity' : 'Billing City', 'BillingState' : 'Billing State', 'BillingZip' : 'Billing Zip Code', 'BillingCountry' : 'Billing Country', 'ShippingAddress' : 'Shipping Address', 'ShippingCity' : 'Shipping City', 'ShippingState' : 'Shipping State', 'ShippingZip' : 'Shipping Zip Code', 'ShippingCountry' : 'Shipping Country', 'ShippingInstructions' : 'Shipping Instructions', 'ShippingAttention' : 'Shipping Attention', 'Friend01' : 'Friend Email 1', 'Friend02' : 'Friend Email 2', 'Friend03' : 'Friend Email 3', 'Friend04' : 'Friend Email 4', 'Friend05' : 'Friend Email 5', 'Message' : 'Friend Message', 'Anniversary1Title' : 'Anniversary Title', 'Anniversary1' : 'Anniversary', 'Anniversary2Title' : 'Anniversary 2 Title', 'Anniversary2' : 'Anniversary 2', 'Anniversary3Title' : 'Anniversary 3 Title', 'Anniversary3' : 'Anniversary 3', 'Anniversary4Title' : 'Anniversary 4 Title', 'Anniversary4' : 'Anniversary 4', 'Anniversary5Title' : 'Anniversary 5 Title', 'Anniversary5' : 'Anniversary 5', 'FileAttachment' : 'File Attachment', 'CAT_Custom_1423_326' : 'Gender', 'CAT_Custom_1424_326' : 'Height', 'CAT_Custom_1425_326' : 'Marital Status', 'CAT_Custom_1426_326' : 'Has Children', 'CAT_Custom_1427_326' : 'Years in Business', 'CAT_Custom_1428_326' : 'Number of Employees', 'CAT_Custom_1429_326' : 'Annual Revenue', 'CAT_Custom_1430_326' : 'Financial Year', 'InvoiceNumber' : 'Invoice Number', 'CardName' : 'Name on Card', 'CardNumber' : 'Card Number', 'CardExpiryMonth' : 'Card Expiry Month', 'CardExpiryYear' : 'Card Expiry Year', 'CardType' : 'Card Type', 'CardCCV' : 'CCV Number', 'CaptchaV2' : 'Captcha', 'g-recaptcha-response' : 'Captcha'};

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
			'g-recaptcha-response' : 'recaptcha',
			CardNumber:			'number',
			CardCCV:			'number',
			Amount:				'currency',
			Password:			'password',
			PasswordConfirm:	'passwordconfirm',
			Days:				'days'
		},
		validation: {
			select:				function (required) {return checkDropdown(required.value, required.label);},
			radio:				function (required) {return checkSelected(selector.find('['+settings.fieldNameAttr+'="'+required.name+'"]'), required.label);},
			checkbox:			function (required) {return checkSelected(selector.find('['+settings.fieldNameAttr+'="'+required.name+'"]'), required.label);},
			email:				function (required) {return checkEmail(required.value);},
			date:				function (required) {return checkDate(required.value,required.label);},
			password:			function (required) {pass.value = required.value; pass.label = required.label; return (required.value !== "" && required.value.length < 6) ? "- Password must be 6 characters or longer" : isEmpty(required.value,required.label);},
			passwordconfirm:	function (required) {return (pass.value.length > 0 && pass.value !== required.value) ? pass.label+' and '+required.label+' do not match' : '';},
			captcha:			function (required) {return captchaIsInvalid(selector[0], "Enter Word Verification in box", "Please enter the correct Word Verification as seen in the image");},
			recaptcha:			function (required) {return (grecaptcha.getResponse($('.g-recaptcha').index(selector.find('.g-recaptcha'))) === '') ? 'Please prove you\'re not a robot' : '';},
			currency:			function (required) {return isCurrency(required.value, required.label);},
			number:				function (required) {return isNumeric(required.value, required.label);},
			days:				function (required) {return isNumericIfVisible(required.field, required.label);}
		}
	};

	function runValidation (required,counter,total) {
		var rdoChkFlag = false;
		if (counter===0) {errorCount=0;}

		// Check the field for a value change
		required.value = (typeof required.field.val() === 'undefined' || required.field.val() === null) ? '' : required.field.val();

		// verify field types and make adjustments to them as needed.
		required.type = fieldCheck.types[required.name] || required.type || 'text';
		if (required.type === 'hidden' || required.type === 'password') required.type = 'text';

		for (var i=0; i<settings.customErrorFields.length; i++) {
			if (required.field.is(settings.customErrorFields[i])) {
				customFlag = true;
				break;
			}else customFlag = false;
		}
		if (customFlag === true && settings.customError !== '') {
			$.when(bcpie.utils.executeCallback({
				selector: selector,
				settings: settings,
				callback: settings.customError,
				content: required
			})).then(function(value) {
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
			validationTarget = (required.field.is('[data-validation-group]') && required.field.data('validationGroup') !== '') ? required.field.closest(required.field.data('validationGroup')) : required.field.closest(settings.validationGroupElement);
			if (validationTarget.length > -1) {
				if (!validationTarget.is('.'+settings.validationGroupClass)) validationTarget.addClass(settings.validationGroupClass);
				if (!required.field.is('.'+settings.validationInputClass)) required.field.addClass(settings.validationInputClass);
				if (validationTarget.find('.'+settings.validationMessageClass).length === 0) validationTarget.append('<'+settings.validationMessageElement+' class="'+settings.validationMessageClass+'" />');
				validationTarget.find('.'+settings.validationMessageClass).text(required.message);
				if (required.message !== '') {
					if (validationTarget.is('.'+settings.validClass)) validationTarget.removeClass(settings.validClass);
					if (!validationTarget.is('.'+settings.errorClass)) validationTarget.addClass(settings.errorClass);
				}else {
					if (validationTarget.is('.'+settings.errorClass)) validationTarget.removeClass(settings.errorClass);
					if (!validationTarget.is('.'+settings.validClass)) validationTarget.addClass(settings.validClass);
				}
			}
		}
	}
	function buttonSubmitBehaviour(behavior){
		var submitButton = selector.find('[type="submit"]');
		switch(behavior){
			case 'hide': submitButton.hide(); break;
			case 'disable': submitButton.attr('disabled','disabled'); break;
			default: submitButton.removeAttr('disabled').show();
		}
	}
	function submitForm(submitCount) {
		if (submitCount===0) {
			buttonSubmitBehaviour(settings.buttonOnSubmit);
			var otherURL,
				thisURL = selector.attr('action'),
				loggingIn = (bcpie.globals.user.isLoggedIn === false && selector.find('['+settings.fieldNameAttr+'=Username]').length > 0 && selector.find('['+settings.fieldNameAttr+'=Password]').length > 0) ? true : false;
			if (loggingIn === true) {
				thisURL = thisURL.replace(bcpie.globals.secureDomain,'').replace(bcpie.globals.primaryDomain,'');
				otherURL = (bcpie.globals.currentDomain === bcpie.globals.secureDomain) ? bcpie.globals.currentDomain : bcpie.globals.secureDomain;
				otherURL += thisURL+'&callback=?';
			}
			if (settings.submitMode === 'ajax') {
				if (settings.formBeforeResponse === 'hide') selector.hide();
				if (settings.beforeResponseMode !== 'off' && settings.beforeResponseMessage !== null) {
					settings.beforeResponseMessage = body.find(settings.beforeResponseMessage);
					if (settings.beforeResponseMessage.length > 0) {
						if (settings.beforeResponseTarget !== selector) settings.beforeResponseTarget = body.find(settings.beforeResponseTarget);
						if (settings.beforeResponseMode === 'replace') settings.beforeResponseTarget = settings.beforeResponseTarget.html(settings.beforeResponseMessage).fadeIn();
						else if (settings.beforeResponseMode === 'append') settings.beforeResponseTarget = settings.beforeResponseTarget.append(settings.beforeResponseMessage).fadeIn();
						else if (settings.beforeResponseMode === 'prepend') settings.beforeResponseTarget = settings.beforeResponseTarget.prepend(settings.beforeResponseMessage).fadeIn();
						else if (settings.beforeResponseMode === 'before') settings.beforeResponseTarget = settings.beforeResponseTarget.before(settings.beforeResponseMessage).fadeIn();
						else if (settings.beforeResponseMode === 'after') settings.beforeResponseTarget = settings.beforeResponseTarget.after(settings.beforeResponseMessage).fadeIn();
					}
				}
				$.ajax({
					type: 'POST',
					url: thisURL,
					data: selector.serialize(),
					async: settings.async,
					success: function(response,status,xhr) {

						// Retrieve Message
						var messageClass = '';
						if (response.indexOf(settings.systemMessageClass) > 0) messageClass = settings.systemMessageClass;
						else if (response.indexOf(settings.systemErrorMessageClass) > 0) {
							messageClass = settings.systemErrorMessageClass;
							errorCount += 1;
						}
						if (errorCount === 0 && loggingIn === true) {
							$.ajax({
								url: otherURL,
								method:'POST',
								dataType:'jsonp',
								data: {
									Username: selector.find('['+settings.fieldNameAttr+'=Username]').val(),
									Password: selector.find('['+settings.fieldNameAttr+'=Password]').val()
								}
							});
						}
						if (errorCount > 0 && settings.errorMessage !== null) responseMessage = settings.errorMessage;
						else if (errorCount === 0 && settings.successMessage !== null) responseMessage = settings.successMessage;
						else {
							if (messageClass !== '') {
								if ($(response).is('.'+messageClass)) msg = $(response);
								else msg = $(response).find('.'+messageClass);
							}else if ($(response).is('font')) msg = $(response);

							if (typeof msg !== 'undefined' && typeof msg.size !== 'undefined' && messageClass !== '') responseMessage = msg.filter('.'+messageClass);
							else if (messageClass !== '') responseMessage = $(response).filter('.'+messageClass);
							
							if (typeof responseMessage === 'object') {
								if (responseMessage.html().replace(/\n/g,'').trim().length === 0 && settings.restoreTarget === true) responseMessage = messageBoxContents;
								else if(responseMessage.find('.search-results').length > 0) responseMessage = responseMessage.find('.search-results').html();
								else if(responseMessage.find('.webappsearchresults').length > 0) responseMessage = responseMessage.find('.webappsearchresults').html();
							}
						}
						if (typeof responseMessage === 'undefined') responseMessage = '';

						// Response Status
						if (settings.beforeResponseMode !== 'off' && settings.beforeResponseMessage.length > 0) settings.beforeResponseTarget.remove();
						if (settings.responseMode !== 'off') {
							if (settings.responseTarget === 'alert') {
								if (errorCount > 0) alertify.error(responseMessage);
								else alertify.success(responseMessage);
							}else if (settings.responseTarget === 'dialog') {
								// put dialog code here
							}else {
								if (settings.responseTarget !== selector) settings.responseTarget = body.find(settings.responseTarget);
								if (settings.responseMode === 'replace') settings.responseTarget = settings.responseTarget.html(responseMessage).fadeIn();
								else if (settings.responseMode === 'append') settings.responseTarget = settings.responseTarget.append(responseMessage).fadeIn();
								else if (settings.responseMode === 'prepend') settings.responseTarget = settings.responseTarget.prepend(responseMessage).fadeIn();
								else if (settings.responseMode === 'before') settings.responseTarget = settings.responseTarget.before(responseMessage).fadeIn();
								else if (settings.responseMode === 'after') settings.responseTarget = settings.responseTarget.after(responseMessage).fadeIn();
							}
						}
						
						if (errorCount === 0) {
							if (settings.formOnSuccessResponse === 'remove') selector.remove();
							else if (settings.formOnSuccessResponse === 'hide') selector.fadeOut(0);
							else if (settings.formOnSuccessResponse === 'show') selector.fadeIn();
						}else {
							if (settings.formOnErrorResponse === 'hide') selector.fadeOut(0);
							else if (settings.formOnErrorResponse === 'show') selector.fadeIn();
						}

						submitCount = 0;
						lockSubmit = false;

						// Callbacks
						if (errorCount === 0 && settings.ajaxSuccess !== null) {
							if (settings.ajaxSuccess === 'refresh') win.location.reload();
							else bcpie.utils.executeCallback({
									selector: selector,
									settings: settings,
									callback: settings.ajaxSuccess,
									content: response,
									status: status,
									xhr: xhr
								});
						}else if (errorCount > 0 && settings.ajaxError !== null) bcpie.utils.executeCallback({
								selector: selector,
								settings: settings,
								callback: window[settings.ajaxError],
								content: response,
								status: status,
								xhr: xhr
							});
					},
					error: function(xhr,status,error) {
						if (settings.successMessage !== null && settings.responseTarget === 'alert') alertify.error(settings.errorMessage);
						if (settings.ajaxError !== null) bcpie.utils.executeCallback({
								selector: selector,
								settings: settings,
								callback: settings.ajaxError,
								content: error,
								status: status,
								xhr: xhr
							});
						return false;
					},
					complete: function(xhr,status) {
						if (settings.ajaxComplete !== null) bcpie.utils.executeCallback({
							selector: selector,
							settings: settings,
							callback: settings.ajaxComplete,
							status: status,
							xhr: xhr
						});
						buttonSubmitBehaviour(settings.buttonOnResponse);
					}
				});
			}else if (settings.submitMode === 'webapp.item' && typeof settings.webapp !== 'undefined') {
				var data = {};
				data.webapp = settings.webapp;
				if (typeof settings.item !== 'undefined') data.item = settings.item;
				data.content = selector;
				bcpie.ajax.webapp.item.save(data).always(function(data, status, xhr){
					if (typeof xhr.status === 'undefined') xhr = data;
					if (xhr.status.toString().indexOf('20') === 0) {
						if (settings.ajaxSuccess !== null) bcpie.utils.executeCallback({
							selector: selector,
							settings: settings,
							callback: settings.ajaxSuccess,
							status: status,
							xhr: xhr
						});
					}else {
						if (settings.ajaxError !== null) bcpie.utils.executeCallback({
							selector: selector,
							settings: settings,
							callback: settings.ajaxError,
							status: status,
							xhr: xhr
						});
					}
					if (settings.ajaxComplete !== null) bcpie.utils.executeCallback({
						selector: selector,
						settings: settings,
						callback: settings.ajaxComplete,
						status: status,
						xhr: xhr
					});
					buttonSubmitBehaviour(settings.buttonOnResponse);
				});
			}else selector.off('submit').submit();

			return submitCount++;
		}else{
			alert("This form has already been submitted. Please refresh the page if you need to submit again.");
			return false;
		}
	}
	function buildRequiredObject(rField,i) {
		required[i] = {
			name : rField.attr(settings.fieldNameAttr),
			field : rField,
			type : (rField.is('input')) ? rField.attr('type') : rField.get(0).tagName.toLowerCase(),
			value : (typeof rField.val() === 'undefined') ? '' : rField.val(),
			label : (selector.find('label[for="'+rField.attr(settings.fieldNameAttr)+'"]').length > 0) ? selector.find('label[for="'+rField.attr(settings.fieldNameAttr)+'"]').text() : rField.attr('placeholder')
		};
		if (typeof required[i].label === 'undefined') required[i].label = labelFallback[required[i].name];
	}
	function autoRequirePaymentFields(scope) {
		if (paymentMethods.size() == 1 && $(paymentMethods[0]).val() == '1') onlyCCMethod = true;
		if (paymentMethods.filter(':checked').val() == '1' || onlyCCMethod) {
			scope.find('['+settings.fieldNameAttr+'="CardName"], ['+settings.fieldNameAttr+'="CardNumber"], ['+settings.fieldNameAttr+'="CardExpiryMonth"], ['+settings.fieldNameAttr+'="CardExpiryYear"], ['+settings.fieldNameAttr+'="CardType"], ['+settings.fieldNameAttr+'="CardCCV"]').addClass(settings.requiredClass);
		}else scope.find('['+settings.fieldNameAttr+'="CardName"], ['+settings.fieldNameAttr+'="CardNumber"], ['+settings.fieldNameAttr+'="CardExpiryMonth"], ['+settings.fieldNameAttr+'="CardExpiryYear"], ['+settings.fieldNameAttr+'="CardType"], ['+settings.fieldNameAttr+'="CardCCV"]').removeClass(settings.requiredClass);
	}
	function BuildRequiredObjectArray(scope) {
		var i = 0,_this = null;
		required=[];
		
		// Build required array
		for (var e = 0; e< autoRequire.length; e++) {
			autoRequire.field = selector.find('['+settings.fieldNameAttr+'="'+autoRequire[e]+'"]');
			if (autoRequire.field.length > 0 && autoRequire.field.not('.'+settings.requiredClass)) autoRequire.field.addClass(settings.requiredClass);
		}
		requiredFields = scope.find('input, select, button, textarea').filter('.'+settings.requiredClass);

		for(var cnt=0,len = requiredFields.size(); cnt < len; cnt++){
			_this = requiredFields[cnt];
			newRequired = scope.find('['+settings.fieldNameAttr+'="'+$(_this).attr(settings.fieldNameAttr)+'"]').not('.'+settings.requiredClass);
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
			required.field.siblings(settings.validationMessageElement+'.'+settings.errorClass.replace(' ','.')).remove();
			required.field.removeClass(settings.errorClass).unwrap();
			if (required.type === 'checkbox' || required.type === 'radio') selector.find('['+settings.fieldNameAttr+'="' + required.name + '"]').removeClass(settings.errorClass);
			--errorCount;
		}
	}
	function activeValidation(scope) {
		// Set onChangeBinding to true in order to prevent these bindings from occuring multiple times.
		onChangeBinding = true;
		for (var i = 0; i<required.length; i++) {
			scope.on('change','['+settings.fieldNameAttr+'="' + required[i].name + '"]', function() {
				for (var i = 0;i<required.length;i++) {
					if ($(this).attr(settings.fieldNameAttr) === required[i].name) runValidation(required[i],0,1);
				}
			});
		}
	}
	function moveToContainer(index){
		// show/hide buttons
		if (index === 0) {
			selector.find(settings.submitField +','+ settings.prev).hide();
			selector.find(settings.next).show();
		}else if (index === multistep.containers.length - 1) {
			selector.find(settings.next).hide();
			selector.find(settings.submitField +','+ settings.prev).show();
		}else{
			selector.find(settings.next +','+ settings.prev).show();
			selector.find(settings.submitField).hide();
		}

		// show next step
		selector.find(multistep.containers).removeClass('activeContainer').hide();
		selector.find(multistep.containers[multistep.step]).addClass('activeContainer').show();
		if (index !== 0) selector.get(0).scrollIntoView();
	}

	buttonSubmitBehaviour('');

	// Auto Require certain fields
	autoRequire = ['EmailAddress','CaptchaV2','g-recaptcha-response','ItemName'];
	ccFields = ['CardName','CardNumber','CardExpiryMonth','CardExpiryYear','CardType','CardCCV'];

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

		selector.on('click',settings.next,function(event){
			event.preventDefault();
			BuildRequiredObjectArray(selector.find(multistep.containers[multistep.step]));

			for (var i = 0; i<required.length; i++) {
				runValidation(required[i],i,required.length);
			}
			if (errorCount === 0) {
				moveToContainer(++multistep.step);
				if (settings.onStep !== null) {
					bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.onStep
				});
				}
				if (settings.onNext !== null) {
					bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.onNext
				});
				}
			}else if (settings.validateMode === 'inline') {
				// Now that submission has been attempted, allow active field validation.
				activeValidation(selector.find(multistep.containers[multistep.step]));
			}
		});

		selector.on('click',settings.prev,function(event){
			event.preventDefault();
			for (var i = 0; i<required.length; i++) {
				resetRequiredField(required[i]);
			}
			moveToContainer(--multistep.step);
			if (settings.onPrev !== null) {
				bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.onPrev
				});
			}
		});

		// prevent the enter key from submitting the form until the last step
		selector.on('keypress',function(e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				if (selector.find(settings.next).filter(':visible').size() > 0) selector.find(settings.next).filter(':visible').trigger('click');
				else selector.find('[type="submit"]:visible').trigger('click');
			}
		});

	}

	// bind to the submit event of our form
	selector.on('submit',function(event) {
		event.preventDefault();
		if (settings.beforeValidation !== null) {
			bcpie.utils.executeCallback({
				selector: selector,
				settings: settings,
				callback: settings.beforeValidation
			});
		}
		BuildRequiredObjectArray(selector);

		if (lockSubmit) return false;
		else lockSubmit = true;
		if (settings.validateMode !== 'off') {
			for (var i = 0;i<required.length;i++) {
				runValidation(required[i],i,required.length);
			}
		}
		if (selector.find('.g-recaptcha-response').length > 0 && grecaptcha.getResponse() === '') errorCount ++;
		if (errorCount === 0) {
			if (settings.validationSuccess !== null) {
				$.when(bcpie.utils.executeCallback({
					selector: selector,
					settings: settings,
					callback: settings.validationSuccess
				})).then(function(value) {
					if (value !== 'stop' && settings.submitMode !== 'off') submitForm(submitCount);
				});
			}else if (settings.submitMode !== 'off') submitForm(submitCount);
		}
		else
			if (settings.validationError !== null) bcpie.utils.executeCallback({
				selector: selector,
				settings: settings,
				callback: settings.validationError
			});
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
	if (settings.submitField !== '[type="submit"]' && settings.submitEvent !== 'submit') {
		selector.on(settings.submitEvent,settings.submitField,function(){
			selector.submit();
		});
	}
};
