var doc = document,body = $(doc.body),win = window;
win.bcpie = {
	active: {
		bcpieSDK: '2015.01.31',
		tricks: {}
	},
	globals: {
		path: win.location.pathname.toLowerCase(),
		pathArray: win.location.pathname.toLowerCase().split(/(?=\/#?[a-zA-Z0-9])/g),
		param: win.location.search,
		paramArray: win.location.search.split(/(?=&#?[a-zA-Z0-9])/g),
		hash: win.location.hash,
		countries: {"AF": {"Country": "Afghanistan", "ContinentCode": "AS", "Continent": "Asia"}, "AX": {"Country": "Aland Islands", "ContinentCode": "EU", "Continent": "Europe"}, "AL": {"Country": "Albania", "ContinentCode": "EU", "Continent": "Europe"}, "DZ": {"Country": "Algeria", "ContinentCode": "AF", "Continent": "Africa"}, "AS": {"Country": "American Samoa", "ContinentCode": "OC", "Continent": "Oceania"}, "AD": {"Country": "Andorra", "ContinentCode": "EU", "Continent": "Europe"}, "AO": {"Country": "Angola", "ContinentCode": "AF", "Continent": "Africa"}, "AI": {"Country": "Anguilla", "ContinentCode": "NA", "Continent": "North America"}, "AQ": {"Country": "Antarctica", "ContinentCode": "AN", "Continent": "Antartica"}, "AG": {"Country": "Antigua and Barbuda", "ContinentCode": "NA", "Continent": "North America"}, "AR": {"Country": "Argentina", "ContinentCode": "SA", "Continent": "South America"}, "AM": {"Country": "Armenia", "ContinentCode": "AS", "Continent": "Asia"}, "AW": {"Country": "Aruba", "ContinentCode": "NA", "Continent": "North America"}, "AU": {"Country": "Australia", "ContinentCode": "OC", "Continent": "Oceania"}, "AT": {"Country": "Austria", "ContinentCode": "EU", "Continent": "Europe"}, "AZ": {"Country": "Azerbaijan", "ContinentCode": "AS", "Continent": "Asia"}, "BS": {"Country": "Bahamas", "ContinentCode": "NA", "Continent": "North America"}, "BH": {"Country": "Bahrain", "ContinentCode": "AS", "Continent": "Asia"}, "BD": {"Country": "Bangladesh", "ContinentCode": "AS", "Continent": "Asia"}, "BB": {"Country": "Barbados", "ContinentCode": "NA", "Continent": "North America"}, "BY": {"Country": "Belarus", "ContinentCode": "EU", "Continent": "Europe"}, "BE": {"Country": "Belgium", "ContinentCode": "EU", "Continent": "Europe"}, "BZ": {"Country": "Belize", "ContinentCode": "NA", "Continent": "North America"}, "BJ": {"Country": "Benin", "ContinentCode": "AF", "Continent": "Africa"}, "BM": {"Country": "Bermuda", "ContinentCode": "NA", "Continent": "North America"}, "BT": {"Country": "Bhutan", "ContinentCode": "AS", "Continent": "Asia"}, "BO": {"Country": "Bolivia", "ContinentCode": "SA", "Continent": "South America"}, "BA": {"Country": "Bosnia and Herzegovina", "ContinentCode": "EU", "Continent": "Europe"}, "BW": {"Country": "Botswana", "ContinentCode": "AF", "Continent": "Africa"}, "BV": {"Country": "Bouvet Island", "ContinentCode": "AN", "Continent": "Antartica"}, "BR": {"Country": "Brazil", "ContinentCode": "SA", "Continent": "South America"}, "IO": {"Country": "British Indian Ocean Territory", "ContinentCode": "AS", "Continent": "Asia"}, "VG": {"Country": "British Virgin Islands", "ContinentCode": "NA", "Continent": "North America"}, "BN": {"Country": "Brunei Darussalam", "ContinentCode": "AS", "Continent": "Asia"}, "BG": {"Country": "Bulgaria", "ContinentCode": "EU", "Continent": "Europe"}, "BF": {"Country": "Burkina Faso", "ContinentCode": "AF", "Continent": "Africa"}, "BI": {"Country": "Burundi", "ContinentCode": "AF", "Continent": "Africa"}, "KH": {"Country": "Cambodia", "ContinentCode": "AS", "Continent": "Asia"}, "CM": {"Country": "Cameroon", "ContinentCode": "AF", "Continent": "Africa"}, "CA": {"Country": "Canada", "ContinentCode": "NA", "Continent": "North America"}, "CV": {"Country": "Cape Verde", "ContinentCode": "AF", "Continent": "Africa"}, "KY": {"Country": "Cayman Islands", "ContinentCode": "NA", "Continent": "North America"}, "CF": {"Country": "Central African Republic", "ContinentCode": "AF", "Continent": "Africa"}, "TD": {"Country": "Chad", "ContinentCode": "AF", "Continent": "Africa"}, "CL": {"Country": "Chile", "ContinentCode": "SA", "Continent": "South America"}, "CN": {"Country": "China", "ContinentCode": "AS", "Continent": "Asia"}, "CX": {"Country": "Christmas Island", "ContinentCode": "AS", "Continent": "Asia"}, "CC": {"Country": "Cocos (Keeling) Islands", "ContinentCode": "AS", "Continent": "Asia"}, "CO": {"Country": "Colombia", "ContinentCode": "SA", "Continent": "South America"}, "KM": {"Country": "Comoros", "ContinentCode": "AF", "Continent": "Africa"}, "CG": {"Country": "Congo", "ContinentCode": "AF", "Continent": "Africa"}, "CD": {"Country": "Congo, Democratic Republic of the", "ContinentCode": "AF", "Continent": "Africa"}, "CK": {"Country": "Cook Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "CR": {"Country": "Costa Rica", "ContinentCode": "NA", "Continent": "North America"}, "HR": {"Country": "Croatia", "ContinentCode": "EU", "Continent": "Europe"}, "CY": {"Country": "Cyprus", "ContinentCode": "AS", "Continent": "Asia"}, "CZ": {"Country": "Czech Republic", "ContinentCode": "EU", "Continent": "Europe"}, "DK": {"Country": "Denmark", "ContinentCode": "EU", "Continent": "Europe"}, "DJ": {"Country": "Djibouti", "ContinentCode": "AF", "Continent": "Africa"}, "DM": {"Country": "Dominica", "ContinentCode": "NA", "Continent": "North America"}, "DO": {"Country": "Dominican Republic", "ContinentCode": "NA", "Continent": "North America"}, "TL": {"Country": "East Timor", "ContinentCode": "AS", "Continent": "Asia"}, "EC": {"Country": "Ecuador", "ContinentCode": "SA", "Continent": "South America"}, "EG": {"Country": "Egypt", "ContinentCode": "AF", "Continent": "Africa"}, "SV": {"Country": "El Salvador", "ContinentCode": "NA", "Continent": "North America"}, "GQ": {"Country": "Equatorial Guinea", "ContinentCode": "AF", "Continent": "Africa"}, "ER": {"Country": "Eritrea", "ContinentCode": "AF", "Continent": "Africa"}, "EE": {"Country": "Estonia", "ContinentCode": "EU", "Continent": "Europe"}, "ET": {"Country": "Ethiopia", "ContinentCode": "AF", "Continent": "Africa"}, "FK": {"Country": "Falkland Islands", "ContinentCode": "SA", "Continent": "South America"}, "FO": {"Country": "Faroe Islands", "ContinentCode": "EU", "Continent": "Europe"}, "FJ": {"Country": "Fiji", "ContinentCode": "OC", "Continent": "Oceania"}, "FI": {"Country": "Finland", "ContinentCode": "EU", "Continent": "Europe"}, "FR": {"Country": "France", "ContinentCode": "EU", "Continent": "Europe"}, "GF": {"Country": "French Guiana", "ContinentCode": "SA", "Continent": "South America"}, "PF": {"Country": "French Polynesia", "ContinentCode": "OC", "Continent": "Oceania"}, "TF": {"Country": "French Southern Territories", "ContinentCode": "AN", "Continent": "Antartica"}, "GA": {"Country": "Gabon", "ContinentCode": "AF", "Continent": "Africa"}, "GM": {"Country": "Gambia", "ContinentCode": "AF", "Continent": "Africa"}, "GE": {"Country": "Georgia", "ContinentCode": "AS", "Continent": "Asia"}, "DE": {"Country": "Germany", "ContinentCode": "EU", "Continent": "Europe"}, "GH": {"Country": "Ghana", "ContinentCode": "AF", "Continent": "Africa"}, "GI": {"Country": "Gibraltar", "ContinentCode": "EU", "Continent": "Europe"}, "GR": {"Country": "Greece", "ContinentCode": "EU", "Continent": "Europe"}, "GL": {"Country": "Greenland", "ContinentCode": "NA", "Continent": "North America"}, "GD": {"Country": "Grenada", "ContinentCode": "NA", "Continent": "North America"}, "GP": {"Country": "Guadeloupe", "ContinentCode": "NA", "Continent": "North America"}, "GU": {"Country": "Guam", "ContinentCode": "OC", "Continent": "Oceania"}, "GT": {"Country": "Guatemala", "ContinentCode": "NA", "Continent": "North America"}, "GG": {"Country": "Guernsey", "ContinentCode": "EU", "Continent": "Europe"}, "GN": {"Country": "Guinea", "ContinentCode": "AF", "Continent": "Africa"}, "GW": {"Country": "Guinea-Bissau", "ContinentCode": "AF", "Continent": "Africa"}, "GY": {"Country": "Guyana", "ContinentCode": "SA", "Continent": "South America"}, "HT": {"Country": "Haiti", "ContinentCode": "NA", "Continent": "North America"}, "HM": {"Country": "Heard Island and McDonald Islands", "ContinentCode": "AN", "Continent": "Antartica"}, "VA": {"Country": "Holy See (Vatican City-State)", "ContinentCode": "EU", "Continent": "Europe"}, "HN": {"Country": "Honduras", "ContinentCode": "NA", "Continent": "North America"}, "HK": {"Country": "Hong Kong SAR", "ContinentCode": "AS", "Continent": "Asia"}, "HU": {"Country": "Hungary", "ContinentCode": "EU", "Continent": "Europe"}, "IS": {"Country": "Iceland", "ContinentCode": "EU", "Continent": "Europe"}, "IN": {"Country": "India", "ContinentCode": "AS", "Continent": "Asia"}, "ID": {"Country": "Indonesia", "ContinentCode": "AS", "Continent": "Asia"}, "IQ": {"Country": "Iraq", "ContinentCode": "AS", "Continent": "Asia"}, "IE": {"Country": "Ireland", "ContinentCode": "EU", "Continent": "Europe"}, "IL": {"Country": "Israel", "ContinentCode": "AS", "Continent": "Asia"}, "IT": {"Country": "Italy", "ContinentCode": "EU", "Continent": "Europe"}, "CI": {"Country": "Ivory Coast", "ContinentCode": "AF", "Continent": "Africa"}, "JM": {"Country": "Jamaica", "ContinentCode": "NA", "Continent": "North America"}, "JP": {"Country": "Japan", "ContinentCode": "AS", "Continent": "Asia"}, "JE": {"Country": "Jersey", "ContinentCode": "EU", "Continent": "Europe"}, "JO": {"Country": "Jordan", "ContinentCode": "AS", "Continent": "Asia"}, "KZ": {"Country": "Kazakhstan", "ContinentCode": "AS", "Continent": "Asia"}, "KE": {"Country": "Kenya", "ContinentCode": "AF", "Continent": "Africa"}, "KI": {"Country": "Kiribati", "ContinentCode": "OC", "Continent": "Oceania"}, "KR": {"Country": "Korea, Republic Of", "ContinentCode": "AS", "Continent": "Asia"}, "KW": {"Country": "Kuwait", "ContinentCode": "AS", "Continent": "Asia"}, "KG": {"Country": "Kyrgyzstan", "ContinentCode": "AS", "Continent": "Asia"}, "LA": {"Country": "Laos", "ContinentCode": "AS", "Continent": "Asia"}, "LV": {"Country": "Latvia", "ContinentCode": "EU", "Continent": "Europe"}, "LB": {"Country": "Lebanon", "ContinentCode": "AS", "Continent": "Asia"}, "LS": {"Country": "Lesotho", "ContinentCode": "AF", "Continent": "Africa"}, "LR": {"Country": "Liberia", "ContinentCode": "AF", "Continent": "Africa"}, "LY": {"Country": "Libya", "ContinentCode": "AF", "Continent": "Africa"}, "LI": {"Country": "Liechtenstein", "ContinentCode": "EU", "Continent": "Europe"}, "LT": {"Country": "Lithuania", "ContinentCode": "EU", "Continent": "Europe"}, "LU": {"Country": "Luxembourg", "ContinentCode": "EU", "Continent": "Europe"}, "MO": {"Country": "Macao SAR", "ContinentCode": "AS", "Continent": "Asia"}, "MK": {"Country": "Macedonia, Former Yugoslav Republic of", "ContinentCode": "EU", "Continent": "Europe"}, "MG": {"Country": "Madagascar", "ContinentCode": "AF", "Continent": "Africa"}, "MW": {"Country": "Malawi", "ContinentCode": "AF", "Continent": "Africa"}, "MY": {"Country": "Malaysia", "ContinentCode": "AS", "Continent": "Asia"}, "MV": {"Country": "Maldives", "ContinentCode": "AS", "Continent": "Asia"}, "ML": {"Country": "Mali", "ContinentCode": "AF", "Continent": "Africa"}, "MT": {"Country": "Malta", "ContinentCode": "EU", "Continent": "Europe"}, "MH": {"Country": "Marshall Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "MQ": {"Country": "Martinique", "ContinentCode": "NA", "Continent": "North America"}, "MR": {"Country": "Mauritania", "ContinentCode": "AF", "Continent": "Africa"}, "MU": {"Country": "Mauritius", "ContinentCode": "AF", "Continent": "Africa"}, "YT": {"Country": "Mayotte", "ContinentCode": "AF", "Continent": "Africa"}, "MX": {"Country": "Mexico", "ContinentCode": "NA", "Continent": "North America"}, "FM": {"Country": "Micronesia, Federated States of", "ContinentCode": "OC", "Continent": "Oceania"}, "MD": {"Country": "Moldova", "ContinentCode": "EU", "Continent": "Europe"}, "MC": {"Country": "Monaco", "ContinentCode": "EU", "Continent": "Europe"}, "MN": {"Country": "Mongolia", "ContinentCode": "AS", "Continent": "Asia"}, "ME": {"Country": "Montenegro", "ContinentCode": "EU", "Continent": "Europe"}, "MS": {"Country": "Montserrat", "ContinentCode": "NA", "Continent": "North America"}, "MA": {"Country": "Morocco", "ContinentCode": "AF", "Continent": "Africa"}, "MZ": {"Country": "Mozambique", "ContinentCode": "AF", "Continent": "Africa"}, "MM": {"Country": "Myanmar", "ContinentCode": "AS", "Continent": "Asia"}, "NA": {"Country": "Namibia", "ContinentCode": "AF", "Continent": "Africa"}, "NR": {"Country": "Nauru", "ContinentCode": "OC", "Continent": "Oceania"}, "NP": {"Country": "Nepal", "ContinentCode": "AS", "Continent": "Asia"}, "NL": {"Country": "Netherlands", "ContinentCode": "EU", "Continent": "Europe"}, "AN": {"Country": "Netherlands Antilles", "ContinentCode": "NA", "Continent": "North America"}, "NC": {"Country": "New Caledonia", "ContinentCode": "OC", "Continent": "Oceania"}, "NZ": {"Country": "New Zealand", "ContinentCode": "OC", "Continent": "Oceania"}, "NI": {"Country": "Nicaragua", "ContinentCode": "NA", "Continent": "North America"}, "NE": {"Country": "Niger", "ContinentCode": "AF", "Continent": "Africa"}, "NG": {"Country": "Nigeria", "ContinentCode": "AF", "Continent": "Africa"}, "NU": {"Country": "Niue", "ContinentCode": "OC", "Continent": "Oceania"}, "NF": {"Country": "Norfolk Island", "ContinentCode": "OC", "Continent": "Oceania"}, "MP": {"Country": "Northern Mariana Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "NO": {"Country": "Norway", "ContinentCode": "EU", "Continent": "Europe"}, "OM": {"Country": "Oman", "ContinentCode": "AS", "Continent": "Asia"}, "PK": {"Country": "Pakistan", "ContinentCode": "AS", "Continent": "Asia"}, "PW": {"Country": "Palau", "ContinentCode": "OC", "Continent": "Oceania"}, "PS": {"Country": "Palestine", "ContinentCode": "AS", "Continent": "Asia"}, "PA": {"Country": "Panama", "ContinentCode": "NA", "Continent": "North America"}, "PG": {"Country": "Papua New Guinea", "ContinentCode": "OC", "Continent": "Oceania"}, "PY": {"Country": "Paraguay", "ContinentCode": "SA", "Continent": "South America"}, "PE": {"Country": "Peru", "ContinentCode": "SA", "Continent": "South America"}, "PH": {"Country": "Philippines", "ContinentCode": "AS", "Continent": "Asia"}, "PN": {"Country": "Pitcairn Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "PL": {"Country": "Poland", "ContinentCode": "EU", "Continent": "Europe"}, "PT": {"Country": "Portugal", "ContinentCode": "EU", "Continent": "Europe"}, "PR": {"Country": "Puerto Rico", "ContinentCode": "NA", "Continent": "North America"}, "QA": {"Country": "Qatar", "ContinentCode": "AS", "Continent": "Asia"}, "RE": {"Country": "Reunion", "ContinentCode": "AF", "Continent": "Africa"}, "RO": {"Country": "Romania", "ContinentCode": "EU", "Continent": "Europe"}, "RU": {"Country": "Russian Federation", "ContinentCode": "EU", "Continent": "Europe"}, "RW": {"Country": "Rwanda", "ContinentCode": "AF", "Continent": "Africa"}, "BL": {"Country": "Saint Barthélemy", "ContinentCode": "NA", "Continent": "North America"}, "WS": {"Country": "Samoa", "ContinentCode": "OC", "Continent": "Oceania"}, "SM": {"Country": "San Marino", "ContinentCode": "EU", "Continent": "Europe"}, "ST": {"Country": "Sao Tome and Principe", "ContinentCode": "AF", "Continent": "Africa"}, "SA": {"Country": "Saudi Arabia", "ContinentCode": "AS", "Continent": "Asia"}, "SN": {"Country": "Senegal", "ContinentCode": "AF", "Continent": "Africa"}, "RS": {"Country": "Serbia", "ContinentCode": "EU", "Continent": "Europe"}, "CS": {"Country": "Serbia and Montenegro", "ContinentCode": "EU", "Continent": "Europe"}, "SC": {"Country": "Seychelles", "ContinentCode": "AF", "Continent": "Africa"}, "SL": {"Country": "Sierra Leone", "ContinentCode": "AF", "Continent": "Africa"}, "SG": {"Country": "Singapore", "ContinentCode": "AS", "Continent": "Asia"}, "SK": {"Country": "Slovakia", "ContinentCode": "EU", "Continent": "Europe"}, "SI": {"Country": "Slovenia", "ContinentCode": "EU", "Continent": "Europe"}, "SB": {"Country": "Solomon Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "SO": {"Country": "Somalia", "ContinentCode": "AF", "Continent": "Africa"}, "ZA": {"Country": "South Africa", "ContinentCode": "AF", "Continent": "Africa"}, "GS": {"Country": "South Georgia and the South Sandwich Islands", "ContinentCode": "AN", "Continent": "Antartica"}, "ES": {"Country": "Spain", "ContinentCode": "EU", "Continent": "Europe"}, "LK": {"Country": "Sri Lanka", "ContinentCode": "AS", "Continent": "Asia"}, "SH": {"Country": "St. Helena", "ContinentCode": "AF", "Continent": "Africa"}, "KN": {"Country": "St. Kitts and Nevis", "ContinentCode": "NA", "Continent": "North America"}, "LC": {"Country": "St. Lucia", "ContinentCode": "NA", "Continent": "North America"}, "MF": {"Country": "St. Martin", "ContinentCode": "NA", "Continent": "North America"}, "PM": {"Country": "St. Pierre and Miquelon", "ContinentCode": "NA", "Continent": "North America"}, "VC": {"Country": "St. Vincent and the Grenadines", "ContinentCode": "NA", "Continent": "North America"}, "SR": {"Country": "Suriname", "ContinentCode": "SA", "Continent": "South America"}, "SJ": {"Country": "Svalbard and Jan Mayen", "ContinentCode": "EU", "Continent": "Europe"}, "SZ": {"Country": "Swaziland", "ContinentCode": "AF", "Continent": "Africa"}, "SE": {"Country": "Sweden", "ContinentCode": "EU", "Continent": "Europe"}, "CH": {"Country": "Switzerland", "ContinentCode": "EU", "Continent": "Europe"}, "TW": {"Country": "Taiwan", "ContinentCode": "AS", "Continent": "Asia"}, "TJ": {"Country": "Tajikistan", "ContinentCode": "AS", "Continent": "Asia"}, "TZ": {"Country": "Tanzania", "ContinentCode": "AF", "Continent": "Africa"}, "TH": {"Country": "Thailand", "ContinentCode": "AS", "Continent": "Asia"}, "TG": {"Country": "Togo", "ContinentCode": "AF", "Continent": "Africa"}, "TK": {"Country": "Tokelau", "ContinentCode": "OC", "Continent": "Oceania"}, "TO": {"Country": "Tonga", "ContinentCode": "OC", "Continent": "Oceania"}, "TT": {"Country": "Trinidad and Tobago", "ContinentCode": "NA", "Continent": "North America"}, "TN": {"Country": "Tunisia", "ContinentCode": "AF", "Continent": "Africa"}, "TR": {"Country": "Turkey", "ContinentCode": "EU", "Continent": "Europe"}, "TM": {"Country": "Turkmenistan", "ContinentCode": "AS", "Continent": "Asia"}, "TC": {"Country": "Turks and Caicos Islands", "ContinentCode": "NA", "Continent": "North America"}, "TV": {"Country": "Tuvalu", "ContinentCode": "OC", "Continent": "Oceania"}, "UG": {"Country": "Uganda", "ContinentCode": "AF", "Continent": "Africa"}, "UA": {"Country": "Ukraine", "ContinentCode": "EU", "Continent": "Europe"}, "AE": {"Country": "United Arab Emirates", "ContinentCode": "AS", "Continent": "Asia"}, "GB": {"Country": "United Kingdom", "ContinentCode": "EU", "Continent": "Europe"}, "US": {"Country": "United States", "ContinentCode": "NA", "Continent": "North America"}, "UY": {"Country": "Uruguay", "ContinentCode": "SA", "Continent": "South America"}, "UM": {"Country": "US Minor Outlying Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "VI": {"Country": "US Virgin Islands", "ContinentCode": "NA", "Continent": "North America"}, "UZ": {"Country": "Uzbekistan", "ContinentCode": "AS", "Continent": "Asia"}, "VU": {"Country": "Vanuatu", "ContinentCode": "OC", "Continent": "Oceania"}, "VE": {"Country": "Venezuela", "ContinentCode": "SA", "Continent": "South America"}, "VN": {"Country": "Viet Nam", "ContinentCode": "AS", "Continent": "Asia"}, "WF": {"Country": "Wallis and Futuna", "ContinentCode": "OC", "Continent": "Oceania"}, "EH": {"Country": "Western Sahara", "ContinentCode": "AF", "Continent": "Africa"}, "YE": {"Country": "Yemen", "ContinentCode": "AS", "Continent": "Asia"}, "ZM": {"Country": "Zambia", "ContinentCode": "AF", "Continent": "Africa"}, "ZW": {"Country": "Zimbabwe", "ContinentCode": "AF", "Continent": "Africa"} }
	},
	api: {
		token: function() {
			if (typeof $.cookie('access_token') !== 'undefined') return $.cookie('access_token');
			else return $.cookie('access_token',window.location.hash.replace('#access_token=',''));
		},
		data: {
			place: function(targets,data) {
				if (targets.length === 1 && targets.is('form')) targets = form.find('input,textarea,select,[data-name]').not('[data-noplace]');
				else targets = targets.not('[data-noplace]');
				if (typeof data === 'string') data = $.parseJSON(data);
				for (var key in data) {
					var value = data[key], unescapedValue = value;
					if(typeof value === 'string') unescapedValue = value.replace(/&#(\d+);/g, function (m, n) { return String.fromCharCode(n); });
					field = targets.filter('[name="'+key+'"]').not('[data-noplace]');
					element = targets.filter('[data-name="'+key+'"]').not('[data-noplace]');
					if (typeof element !== 'undefined') element.text(unescapedValue);
					if (typeof field !== 'undefined') {
						if (field.is('input[type=radio]')) {
							targets.filter('[name="'+key+'"]').filter(function(){
								return $(this).is('[value="'+unescapedValue+'"]');
							}).attr('checked','checked').prop('checked',true);
						}else if (field.is('input[type=checkbox]')) {
							unescapedValue = unescapedValue.split(',');
							for (var i=0; i<unescapedValue.length; i++) {
								targets.filter('[name="'+key+'"]').filter('[value="'+unescapedValue[i]+'"]').attr('checked','checked').prop('checked',true);
							}
						}else if (field.is('input[type=text],textarea')) field.val(unescapedValue);
					}
				}
			}
		},
		file : {
			get: function(path) {
				if (typeof path !== 'undefined' && path.length > 1) {
					if (path.charAt(0) === '/') path.slice(1, path.length - 1);
					if (path.charAt(path.length - 1) === '/') path.slice(0, - 1);
					return $.ajax({
						url: '/api/v2/admin/sites/current/storage/'+path,
						type: 'GET',
						connection: 'keep-alive',
						contentType: 'application/json',
						headers: {Authorization: bcpie.api.token()},
						async: false
					}).responseText;
				}else return 'no filename provided';
			},
			save: function(path,data) {
				if (path.charAt(0) === '/') path.slice(1, path.length - 1);
				if (path.charAt(path.length - 1) === '/') path.slice(0, - 1);
				return $.ajax({
					url: '/api/v2/admin/sites/current/storage/'+path+'?version=draft-publish',
					type: 'PUT',
					headers: {Authorization: bcpie.api.token()},
					contentType: 'application/octet-stream',
					async: false,
					data: data,
					processData: false
				});
			},
			delete: function(path){
				if (path.charAt(0) === '/') path.slice(1, path.length - 1);
				if (path.charAt(path.length - 1) === '/') path.slice(0, - 1);
				return $.ajax({
					url: '/api/v2/admin/sites/current/storage/'+path,
					type: "DELETE",
					headers: {Authorization: bcpie.api.token()}
				});
			}
		},
		webapp : {
			item: {
				get: function(webapp,item) {
					return $.ajax({
							url: '/api/v2/admin/sites/current/webapps/'+webapp+'/items/'+item,
							headers: {'Authorization': bcpie.api.token()},
							contentType: 'application/json',
							async: false
						}).responseJSON;
				},
				place: function(scope,webapp,item,callback) {
					var data = bcpie.api.webapp.item.get(webapp,item),field,element;
					bcpie.api.data.place(scope,data);
					bcpie.api.data.place(scope,data.fields);
					if(typeof callback !== 'undefined') callback(data);
				},
				save: function(selector,webapp,id) {
					var field, data, url = '/api/v2/admin/sites/current/webapps/'+webapp+'/items',
						type = 'POST', formData = selector.serializeObject();

					// Retrieve the custom fields list from the server
					$.ajax({
						url: '/api/v2/admin/sites/current/webapps/'+webapp+'/fields',
						type: 'get',
						async: false,
						contentType: 'application/json',
						headers: {'Authorization': bcpie.api.token()}
					}).done(function (msg) {
						data = {name:'', releaseDate:moment().subtract(12,'hour').format('YYYY-MM-DD'), expiryDate:'9999-01-01', enabled:true, country:'US', fields:{}};
						allFields = {name:'', weight:0, releaseDate:moment().subtract(12,'hour').format('YYYY-MM-DD'), expiryDate:'9999-01-01', enabled:true, slug:'', description:'', roleId:null, submittedBy:-1, templateId:-1, address:'', city:'', state:'', zipCode:'', country:'',fields:{}};

						if (typeof id !== 'undefined' && id !== '' ) {
							url = url+'/'+id;
							type = 'PUT';
							delete data.releaseDate;
						}

						// Add custom fields to data object
						for (var i=0; i<msg.items.length; i++) if (typeof formData[msg.items[i].name] !== 'undefined') data.fields[msg.items[i].name] = '';

						// Fill the data object with form values
						for (var key in formData) {
							if (typeof allFields[key] !== 'undefined') data[key] = formData[key];
							else if (typeof data.fields[key] !== 'undefined') data.fields[key] = formData[key];
						}

						$.ajax({
							url: url,
							type: type,
							connection: 'keep-alive',
							contentType: 'application/json',
							headers: {'Authorization': bcpie.api.token()},
							data: JSON.stringify(data),
							async: false
						});
					});
				},
				delete: function(webapp,id) {
					$.ajax({
						url: '/api/v2/admin/sites/current/webapps/'+webapp+'/items/'+id,
						type: 'DELETE',
						connection: 'keep-alive',
						contentType: 'application/json',
						headers: {'Authorization': bcpie.api.token()}
					});
				}
			}
		}
	},
	frontend: {
		webapp: {
			item: {
				new: function(webappid,data,success,error) {
					// still need to provide secure domain if there is an Amount field
					$.ajax({
						url: '/CustomContentProcess.aspx?CCID='+webappid+'&OTYPE=1',
						type: 'POST',
						data: data,
						success: function(response) {
							if (typeof success !== 'undefined') success(response);
						},
						error: function(response) {
							if (typeof error !== 'undefined') error(response);
						},
					});
				},
				update: function(webappid,itemid,data,success,error) {

				}
			},
			search: function(webappid,formid,responsePageID,data) {
				var response = $.ajax({
					url: '/Default.aspx?CCID='+webappid+'&FID='+formid+'&ExcludeBoolFalse=True&PageID='+responsePageID,
					type: 'POST',
					data: data,
					async: false
				});
				return $(response.responseText).find('.webappsearchresults').children();
			}
		},
		crm: {
			update: function(data,success,error) {
				$.ajax({
					url: '/MemberProcess.aspx',
					type: 'POST',
					data: data,
					success: function(response) {
						if (typeof success !== 'undefined') success(response);
					},
					error: function(response) {
						if (typeof error !== 'undefined') error(response);
					},
				});
			}
		}
	},
	utils: {
		_jsonify_brace: /^[{\[]/,
		_jsonify_token: /[^,:{}\[\]]+/g,
		_jsonify_quote: /^['"](.*)['"]$/,
		_jsonify_escap: /(["])/g,
		escape: function(str) { return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"); },
		jsonify: function(str) {
			// Wrap with `{}` if not JavaScript object literal
			str = $.trim(str);
			if (bcpie.utils._jsonify_brace.test(str) === false) str = '{'+str+'}';

			// Retrieve token and convert to JSON
			return str.replace(bcpie.utils._jsonify_token, function (a) {
				a = $.trim(a);
				// Keep some special strings as they are
				if ('' === a || 'true' === a || 'false' === a || 'null' === a || (!isNaN(parseFloat(a)) && isFinite(a))) return a;
				// For string literal: 1. remove quotes at the top end; 2. escape double quotes in the middle; 3. wrap token with double quotes
				else return '"'+ a.replace(bcpie.utils._jsonify_quote, '$1').replace(bcpie.utils._jsonify_escap, '\\$1')+ '"';
			});
		},
		guid: function() {
			function s4() {
				return Math.floor((1+Math.random()) * 0x10000).toString(16).substring(1);
			}
			return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4();
		},
		serializeObject: function(object) {
			var o = {};
			var a = object.serializeArray();
			for (var i=0; i<a.length; i++) {
				if (o[a[i].name] !== undefined) {
					if (!o[a[i].name].push) o[a[i].name] = [o[a[i].name]];
					o[a[i].name].push(a[i].value || '');
				}
				else o[a[i].name] = a[i].value || '';
			}
			return o;
		},
		closestChildren: function(selector,match,findAll,results) {
			/* the results parameter is used internally by the function */
			var $children = (selector instanceof jQuery) ? selector.children() : $(selector).children();
			if ($children.length === 0) {
				if (typeof results === 'object') return results;
				else return $();
			}
			if (typeof results === 'object') results = results.add($children.filter(match));
			else results = $children.filter(match);

			if (findAll !== true) return (results.length > 0) ? results : $children.closestChildren(match);
			else return bcpie.utils.closestChildren($children.not(results),match,findAll,results);
		},
		searchArray: function(array,value) {
			// Best for large arrays. For tiny arrays, use indexOf.
			for (var i = 0; i < array.length; i++) {
				if (array[i] === value) return i;
			}
			return -1;
		}
	},
	extensions: {
		settings: function(selector,options,settings) {
			if (typeof settings.name === 'string' && settings.name.toLowerCase() !== 'run' && settings.name.toLowerCase() !== 'settings') {
				if (typeof settings.defaults === 'undefined') settings.defaults = {};
				selector.data('bcpie-'+settings.name.toLowerCase()+'-settings', $.extend({}, settings.defaults, options, bcpie.globals));
				bcpie.active.tricks[settings.name] = settings.version;
				return selector.data('bcpie-'+settings.name.toLowerCase()+'-settings');
			}
		},
		engine: function() {
			var tricks = bcpie.extensions.tricks,trick,options,instances,instance,arr=[],str="",options={},module = [],functions = {},defaults = {};
			for (trick in tricks) {
				arr=[],str="",options={},module = [],functions = {},defaults = {};
				instances = $(doc).find('[data-bcpie-'+trick.toLowerCase()+']');
				for (var a = 0; a<instances.length; a++) {
					options = {},instance = $(instances[a]);
					str = instance.data('bcpie-'+trick.toLowerCase());
					if (typeof str === 'string' && str.indexOf(':') > -1) {
						if (str.indexOf(';') > -1) {
							str = str.split(';');
							for (var e=0;e<str.length;e++){
								arr = str[e].split(':');
								options[$.trim(arr[0])] = GetOptionValue($.trim(arr.slice(1).join(':')));
							}
						}else {
							arr = str.split(':');
							options[$.trim(arr[0])] = GetOptionValue($.trim(arr.slice(1).join(':')));
						}
					}
					bcpie.extensions.tricks[trick](instance,options);
				}
			}
			function GetOptionValue(valstr){
				switch(valstr.toLowerCase()){
					case 'true': return true;
					case 'false': return false;
					default: return valstr;
				}
			}
		},
		tricks: {} // populated automatically
	}
};
bcpie.globals = $.extend({},bcpie.globals,globals);
// Initialize tricks
$(function() {
	bcpie.extensions.engine();
});
/*
 * "ActiveNav". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.ActiveNav = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'ActiveNav',
		version: '2015.01.31',
		defaults: {
			navClass: 'activenav',
			activeClass: 'active',
			level: 1,
			levelClass: 'level',
			lastLevel: 0,
			lastLevelClass: 'lastlevel',
			levelTitle: false,
			levelTitleClass: 'leveltitle',
			unlinkTitle: false,
			removeHidden: true,
			activeHash: false,
			hashSupport: true,
			hashOffset: 30,
			removeClass: ''
		}
	});

	// vars
	var shortPath, activeLinks, currentLink, gotIt = 0, first, segment, last, currentHash;

	settings.navClass = classObject(settings.navClass);
	settings.activeClass = classObject(settings.activeClass);
	settings.levelClass = classObject(settings.levelClass);
	settings.lastLevelClass = classObject(settings.lastLevelClass);
	settings.levelTitleClass = classObject(settings.levelTitleClass);
	settings.removeClass = classObject(settings.removeClass);
	settings.primaryDomain = settings.primaryDomain.replace('http:','');
	settings.secureDomain = settings.secureDomain.replace('https:','');


	function classObject(classes) {
		return {
			names: classes,
			selector: '.'+classes.replace(/ /g,'.')
		};
	}
	function makeActive(activeLinks, first, last) {
		for(var i=0, len = $(activeLinks).size(); i<len;i++){
			var _this = activeLinks[i];
			$(_this).parentsUntil(first, 'li').addClass(settings.activeClass.names);
			$(_this).closest(first).children('ul').addClass(settings.levelClass.names);
		}

		if (settings.level > 1 && settings.levelTitle !== false) {
			$(settings.levelClass.selector).parent('li').addClass(settings.levelTitleClass.names);
			if (settings.levelTitle !== false && settings.unlinkTitle !== false) {
				$(settings.levelTitleClass.selector).children('a').replaceWith('<span>' + $(settings.levelTitleClass.selector).children('a').html() + '</span>');
			}
		}
		if (settings.level > 1 && settings.removeHidden === true) {
			if (settings.levelTitle !== false) {
				segment = $(settings.levelTitleClass.selector).detach();
				selector.children('ul').html(segment);
			} else {
				segment = selector.find(settings.levelClass.selector).detach();
				selector.html(segment);
			}
		}
	}
	function updateHashUrl(hash) {
		if (settings.activeHash) history.pushState({}, "", hash);
	}

	function initHashChange(hash) {
		if (hash !== null) settings.hash = hash;
		else settings.hash = win.location.hash; // reset the settings.hash

		currentHash = settings.hash;
		settings.pathArray = $.grep(settings.pathArray, function(el) {
			return (el.indexOf('#') == -1 || el == settings.hash);
		});
		initActiveNav();
	}

	function initActiveNav() {
		shortPath = settings.path.toLowerCase() + settings.hash.toLowerCase();
		selector.find(settings.activeClass.selector).removeClass(settings.activeClass.names);
		if (settings.hash !== '') settings.pathArray.push(settings.hash.toLowerCase());

		// This loop returns all matching links from the first iteration that has a match (within level), then exits the loop;
		for (var i = settings.pathArray.length - 1; i >= 0; i--) {
			// Go through each link
			activeLinks = first.find('a').filter(function(index) {
				currentLink = $(this).attr('href').split('?')[0].toLowerCase().replace('https:','').replace('http:','').replace(settings.primaryDomain,'').replace(settings.secureDomain,'');
				if (currentLink.indexOf('/') !== 0) currentLink = '/'+currentLink;

				if (currentLink === shortPath) {
					gotIt = 1;
					return true;
				}
			});
			if (gotIt === 1) {
				break;
			} else {
				// shorten shortPath and go through the loop again.
				shortPath = shortPath.replace(settings.pathArray[i], '');
			}
		}
		if (activeLinks.length > 1) {
			// Filter remaining activeLinks
			activeLinks = activeLinks.filter(function(index) {

				// shortPath needs to be reset for each link we go through
				shortPath = settings.path.toLowerCase();

				if (settings.path === '/') {
					return true;
				} else {
					for (var i = settings.pathArray.length - 1; i >= 0; i--) {
						currentLink = $(this).attr('href').split('?')[0].toLowerCase();
						if (currentLink === shortPath) {
							return true;
						} else if (shortPath !== "") {
							shortPath = shortPath.replace(settings.pathArray[i], '');
						}
					}
				}
			});
		}
		if (activeLinks.length > 0) {
			makeActive(activeLinks, first, last);
			if ($.trim(settings.removeClass.names).length > 0) {
				selector.find(settings.removeClass.selector).addBack().removeClass(settings.removeClass.names);
			}
		}else if (selector.find(settings.levelClass.selector).size() === 0){
			if (settings.level > 1) {
				selector.children('ul').remove();
			}else {
				selector.children('ul').addClass(settings.levelClass.names);
			}
		}
	}

	function outOfView(elem) {
		var docViewTop = $(win).scrollTop();
		var docViewBottom = docViewTop + $(win).height();

		var elemTop = $(elem).offset().top;
		return (elemTop > docViewBottom);
	}
	function inViewTopBottom(elem) {
		var docViewTop = $(win).scrollTop();
		var elemTop = $(elem).offset().top;
		var elemBottom = elemTop + $(elem).height();
		return (docViewTop < elemBottom && docViewTop > elemTop - settings.hashOffset);
	}

	// Add the window hashchange event, to add the active class on hash change
	$(win).off('hashchange');
	$(win).on('hashchange', function() {
		initHashChange();
	});

	if (settings.hashSupport) { // If hashSupport is true. url and navigation automatically updates on page scroll at certain positions
		currentHash = settings.hash;
		var hashLinks = selector.find('a[href*="' + settings.path + '#"]');
		for(var i=0,len = $(hashLinks).size(); i<len;i++){
			$('#' + $(hashLinks[i]).attr('href').split('#')[1]).addClass('hash');
		}

		$(doc).off('scroll.ActiveNav');
		$(doc).on('scroll.ActiveNav', function() {
			for(var i=0, len = body.find('.hash').size(); i<len; i++){
				var top = win.pageYOffset, _this=$(body.find('.hash')[i]);
				var distance = top - _this.offset().top;
				var hash = _this.attr('id');
				//if (distance < settings.hashOffset && distance > (-1 * settings.hashOffset) && (currentHash != hash || currentHash.length == 0)) {
				if (inViewTopBottom(_this) && (currentHash != hash || currentHash.length === 0)) {
					currentHash = '#' + hash;
					initHashChange(currentHash);
					updateHashUrl('#' + hash);
				}
			}
			if ($('.hash').size() > 0){
				if (outOfView($('.hash')[0])) {
					currentHash = '';
					initHashChange(currentHash);
					updateHashUrl('#');
				}
			}
		});
	}

	// Add .activenav to the selector element
	selector.addClass(settings.navClass.names);

	// find level
	first = $(selector);
	if (settings.level > 1) {
		for (var i = settings.level - 1; i > 0; i--) {
			first = bcpie.utils.closestChildren(first,'li', true);
		}
	}
	// find lastLevel
	if (settings.lastLevel > 0) {
		last = $(selector);
		for (var i = settings.lastLevel; i > 0; i--) {
			last = bcpie.utils.closestChildren(last,'li', true);
		}
	} else last = 0;

	$(last).parent('ul').addClass(settings.lastLevelClass.names);
	if (last !== 0 && settings.removeHidden === true) {
		bcpie.utils.closestChildren(selector.find(settings.lastLevelClass.selector),'ul', true).remove();
	}

	initActiveNav();
};
/*
 * "Crumbs". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Crumbs = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Crumbs',
		version: '2015.01.31',
		defaults: {
			separator: '/',
			makespace: '-',
			ajax: true,
			showHome: false,
			homeTitle: 'Home'
		}
	});

	/* define variables */
		var separator = ' '+settings.separator+' ',crumbArray,crumbURL,crumb,
		reg,pageArray,paramArray,path,breadcrumbs = '',i=0,useAjax = (settings.ajax===true || settings.ajax==='true') ? true : false;
		crumbArray = settings.pathArray; // This may change its value later in the script, so it's best not to use our global.
		paramArray = settings.paramArray;
		path = settings.path; // This may change its value later in the script, so it's best not to use our global.
		reg = new RegExp(settings.makespace,'g'); // create array of pagenames based on the url
		pageArray = path.replace(reg,' ').split('/');
		pageArray.shift(); // remove the first item (it's empty)
		if (settings.showHome !== false) pageArray.unshift(settings.homeTitle);
		crumbURL = win.location.hostname;
	/* end variable definitions */

	/* cleanup messy paths */
		switch (path) {
			case '/ForumRetrieve.aspx':
				crumbURL += '/ForumRetrieve.aspx';
				crumbArray = paramArray;
				if (settings.param.contains('NoTemplate')) {
					crumbArray.pop();
				}
				break;
			case '/FAQRetrieve.aspx':
				crumbURL += '/FAQRetrieve.aspx';
				crumbArray = paramArray;
				break;
			default: crumbArray = crumbArray;
		}
	/* end cleanup messy paths */

	/* define functions */
		function urlCrumbName (i,crumb,pageArray,paramArray) {
			// choolse the information source for crumb
			crumb = pageArray[i];

			// create rules for special pages
			switch (crumb) {
				case 'OrderRetrievev2.aspx' : crumb = 'shopping cart';break;
				case 'ForumRetrieve.aspx' : crumb = 'forum';break;
				case 'ForumRegister.aspx' : crumb = 'forum registration';break;
				default : crumb = crumb;
			}
			if (paramArray!==undefined) {
				switch (paramArray[0]) {
					case '?Step=13' : crumb = 'checkout';break;
					default : crumb = crumb;
				}
			}
			return crumb;
		}
		function ajaxCrumbName (crumb,response,bcID,pagenameAttr) {
			// choolse the information source for crumb
			crumb = $(response).filter('#'+bcID).data(pagenameAttr);
			return crumb;
		}
		function breadcrumb (i,crumbArray,breadcrumbs,crumbURL,crumb,separator) {
			// put the current breadcrumb together
			if (i<crumbArray.length-1) {
				breadcrumbs = '<a href="'+crumbURL+'">'+crumb+'</a>'+separator;
			}else {
				breadcrumbs = '<span class="this_crumb">'+crumb+'</span>';
			}
			return breadcrumbs;
		}
	/* end function definitions */

	/* build breadcrumbs */
		if (useAjax) {
			// build crumbs with Ajax
			while (i<crumbArray.length) {
				crumbURL += crumbArray[i];
				if (path === '/FAQRetrieve.aspx' && i===0) {
					crumbURL = '/faq';	// workaround for FAQs module
				}else if (i === crumbArray.length-1) {
					breadcrumbs += '<span class="this_crumb">'+settings.pageName+'</span>';
				}else {
					$.ajax({
						url: crumbURL,
						type: 'GET',
						dataType: 'html',
						async: false,
						success: function(response) {
							if (settings.pageAddress === $(response).filter('#'+settings.modulesID).data(settings.pageAddressAttr)) return;
							if (crumbArray[i] === '/' && settings.showHome !== false && settings.homeTitle !== null) {
								crumb = crumb;
							}else {
								crumb = ajaxCrumbName (crumb,response,settings.modulesID,settings.pageNameAttr);
							}
							breadcrumbs += breadcrumb (i,crumbArray,breadcrumbs,crumbURL,crumb,separator);
						},
						error: function (response){
							if(response.status===404) {
								// Skip this crumb. Breadcrumbs are meant to show us the way back, not match the menu or URL structure.
								// crumb = urlCrumbName (i,crumb,pageArray,paramArray);
								// breadcrumbs += breadcrumb (i,crumbArray,breadcrumbs,crumbURL,crumb,separator);
							}
						}
					});
				}
				i++;
			}
		}else {
			// build crumbs from URL
			while (i<crumbArray.length) {
				crumbURL += crumbArray[i];
				if (crumbArray[i] === '/' && settings.showHome !== false && settings.homeTitle !== null) {
					crumb = crumb;
				}else {
					crumb = urlCrumbName (i,crumb,pageArray,paramArray);
				}
				breadcrumbs += breadcrumb (i,crumbArray,breadcrumbs,crumbURL,crumb,separator);
				i++;
			}
		}
		if (settings.showHome === true) breadcrumbs = '<a href="/">'+settings.homeTitle+'</a>'+separator+breadcrumbs;
		breadcrumbs = '<span>'+breadcrumbs+'</span>';
	/* end build breadcrumbs */
	return selector.html(breadcrumbs);
};
/*
 * Date
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Date = function(selector,options){
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Date',
		version: '2015.01.29',
		defaults: {
			format: 'YYYY',
			add: '',
			subtract: '',
			moment: 'auto',
			utc: false,
			timezone: '',
			ref: 'text', // specify an html attribute (inputs will assume 'text' means 'value'). You can also say 'now' to use the current date and time.
			target: 'text', // specify an html attribute (inputs will default to 'value'). Separate multiple targets with commas.
			event: 'load' // specify the window event that triggers Date's behavior
		}
	});

	if (settings.add !== '') settings.add = $.parseJSON(bcpie.utils.jsonify(settings.add));
	if (settings.subtract !== '') settings.subtract = $.parseJSON(bcpie.utils.jsonify(settings.subtract));

	var ref,value,targets,parseFormat,order;

	function runDate() {
		// determine the reference
		if (settings.ref === 'text' && selector.is('input')) settings.ref = 'value';
		ref = (settings.ref === 'text') ? selector.text() : selector.prop(settings.ref);

		if(settings.ref === 'now') value = moment();
		else if (ref !== '') {
			if (settings.moment === 'auto' && $.isNumeric(ref) && ref.length === 10) {
				if (settings.utc === true) value = moment.utc(moment.unix(ref)).local();
				else value = moment.unix(ref);
			}else {
				if (typeof settings.site.countryCode === 'undefined') settings.site.countryCode = 'US';
				switch(settings.countries[settings.site.countryCode].ContinentCode) {
					case 'NA': order = 'MDY'; break;
					default: order = 'DMY';
				}
				parseFormat = (settings.moment === 'auto') ? moment.parseFormat(ref,{preferredOrder: order}) : settings.moment;
				value = moment(ref,parseFormat);
			}

			if (value.isAfter(moment()) && ref.match(/(?:\/|-)([0-9]{2})$/)) value = value.subtract('year',100);
		}
		if (settings.timezone !== '') value.tz(settings.timezone);
		if (typeof value !== 'undefined' && value._isAMomentObject === true) {
			value = value.add(settings.add).subtract(settings.subtract).format(settings.format);

			targets = settings.target.split(',');
			for (var i=0; i<targets.length; i++) {
				if (targets[i] === 'text' && selector.is('input')) targets[i] = 'value';
				(targets[i] === 'text') ? selector.text(value) : selector.prop(targets[i],value);
			}
		}
	}
	runDate();
	if (settings.event !== 'load') {
		body.on(settings.event, selector, function() {
			runDate();
		});
	}
};
/*
 * "FormMagic". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.FormMagic = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'FormMagic',
		version: '2015.01.31',
		defaults: {
			'requiredClass' : 'required',
			'errorGroupElement' : 'div',
			'errorGroupClass' : 'error-group',
			'errorMessageElement' : 'small',
			'errorClass' : 'error',
			'messageBoxID' : bc.modulesID,
			'messageMode' : 'prepend', // 'append', 'box'
			'restoreMessageBox' : true, // If submission result is empty, the contents of messageBox will be restored. This is particularly helpful with live searches.
			'afterAjax' : 'remove', // 'hide', 'show'
			'useAjax' : false,
			'validateMode' : 'alert', // 'inline'
			'fieldTitleAttr' : 'label', // or specify a field attribute
			'systemMessageClass' : 'system-message',
			'systemErrorMessageClass' : 'system-error-message',
			'successClass' : 'success',
			'submitEvent' : null,
			'submitField' : '[type="submit"]',
			'beforeSubmit' : null, // deprecated. Replaced with validationSuccess.
			'validationSuccess' : null, // specify a function to run after validation, but before submission
			'validationError' : null, // specify a function to run after validation returns errors
			'noSubmit' : false, // allow form submission to be bypassed after successful validation.
			'ajaxSuccess' : null, // specify a function to run after an Ajax submission 'success' response
			'ajaxError' : null, // specify a function to run after an Ajax submission 'error' response
			'ajaxComplete' : null, // specify a function to run after an Ajax submission 'complete' response
			'multistep' : false,  // True if this is a multistep form or validations are to be done in steps
			'containers' : '', // multistep container selectors, separated by comma
			'continueButton' : '', // Continue button selector for multi step form
			'backButton' : '', // back button selector for multi step form
			'buttonOnSubmit' : 'disable', // none,disable,hide
			'buttonAfterSubmit' : 'enable', //none,enable,hide,show,disable
			'customError' : null, // specify a custom validation function to run against a comma delimeted list of selectors
			'customErrorFields' : '' // takes a comma delimited list of selectors to match against during validation
		}
	});

	// validationFunctions.js and EN validatelang
	if (typeof jslang == "undefined") var jslang = ("EN");
	else {
		if (jslang == "JP") jslang = "JA";
		if (jslang == "CS") jslang = "CZ";
		if (jslang == "SI") jslang = "SL";
		LoadLangV(jslang);
	}
	if (validatelang === undefined && jslang === 'EN') {
		var validatelang = {
			Currency: {
				MustNumber: " must be a number and cannot be empty\n",
				NoSymbol: " amount you entered must be a number without currency symbol\n"
			},
			Number: {
				MustNumber: " must be a number and cannot be empty\n",
				NoDecimal: " must be a number (no decimal points) and cannot be empty\n"
			},
			Float: {
				MustNumber: " must be a number and may contain a decimal point.\n"
			},
			Enter: {
				PleaseEnter: "- Please enter "
			},
			Select: {
				PleaseSelect: "- Please select ",
				MustSelect: " must be selected\n"
			},
			Email: {
				ValidEmail: "- Please enter a valid email address\n",
				Illegal: "- The email address contains illegal characters\n"
			},
			CheckDate: {
				ValidDate: " as a valid date.\n"
			},
			Others: {
				CannotContain: " cannot contain ",
				WhiteSpace: "white spaces\n",
				Character: "character.\n"
			},
			IP: {
				Illegal: "- Please enter a valid IP Address"
			}
		};
	}
	function LoadLangV(b) {
		if (document.getElementById("RADEDITORSTYLESHEET0")) return;
		else {
			var c = document.createElement("script");
			c.setAttribute("src", "/BcJsLang/ValidationFunctions.aspx?lang=" + b);
			document.getElementsByTagName("head")[0].appendChild(c);
		}
	}
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
		function() {
			return new XMLHttpRequest();
		},
		function() {
			return new ActiveXObject("Msxml2.XMLHTTP");
		},
		function() {
			return new ActiveXObject("Msxml3.XMLHTTP");
		},
		function() {
			return new ActiveXObject("Microsoft.XMLHTTP");
		}
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

	// setup some local variables
	var action = selector.attr('action'),requiredFields,required=[],submitCount=0,
		errorArray=[],errorElement='<'+settings.errorGroupElement+' class="'+settings.errorGroupClass+'"></'+settings.errorGroupElement+'>',newRequired,pass={},
		errorTarget,successMessage,messageElement,messageBox,selectorResponse,onChangeBinding,errorElementExists,errorCount=0,autoRequire,currentName,submitField,paymentMethods = selector.find('[name="PaymentMethodType"]'), onlyCCMethod = false, multistepContainers = [],requiredMultistep=[],
		containerIndex=0, lockSubmit = false, messageBoxContents = $('#'+settings.messageBoxID).html(), customFlag = false,
		labelFallback = {'Title' : 'Title', 'FirstName' : 'First Name', 'LastName' : 'Last Name', 'FullName' : 'Full Name', 'EmailAddress' : 'Email Address', 'Username' : 'Username', 'Password' : 'Password', 'HomePhone' : 'Home Phone Number', 'WorkPhone' : 'Work Phone Number', 'CellPhone' : 'Cell Phone Number', 'HomeFax' : 'Home Fax Number', 'WorkFax' : 'Work Fax Number', 'HomeAddress' : 'Home Address', 'HomeCity' : 'Home City', 'HomeState' : 'Home State', 'HomeZip' : 'Home Zip', 'HomeCountry' : 'Home Country', 'WorkAddress' : 'WorkAddress', 'WorkCity' : 'Work City', 'WorkState' : 'Work State', 'WorkZip' : 'Work Zip', 'WorkCountry' : 'Work Country', 'WebAddress' : 'Web Address', 'Company' : 'Company', 'DOB' : 'Date of Birth', 'PaymentMethodType' : 'Payment Method', 'BillingAddress' : 'Billing Address', 'BillingCity' : 'Billing City', 'BillingState' : 'Billing State', 'BillingZip' : 'Billing Zip Code', 'BillingCountry' : 'Billing Country', 'ShippingAddress' : 'Shipping Address', 'ShippingCity' : 'Shipping City', 'ShippingState' : 'Shipping State', 'ShippingZip' : 'Shipping Zip Code', 'ShippingCountry' : 'Shipping Country', 'ShippingInstructions' : 'Shipping Instructions', 'ShippingAttention' : 'Shipping Attention', 'Friend01' : 'Friend Email 1', 'Friend02' : 'Friend Email 2', 'Friend03' : 'Friend Email 3', 'Friend04' : 'Friend Email 4', 'Friend05' : 'Friend Email 5', 'Message' : 'Friend Message', 'Anniversary1Title' : 'Anniversary Title', 'Anniversary1' : 'Anniversary', 'Anniversary2Title' : 'Anniversary 2 Title', 'Anniversary2' : 'Anniversary 2', 'Anniversary3Title' : 'Anniversary 3 Title', 'Anniversary3' : 'Anniversary 3', 'Anniversary4Title' : 'Anniversary 4 Title', 'Anniversary4' : 'Anniversary 4', 'Anniversary5Title' : 'Anniversary 5 Title', 'Anniversary5' : 'Anniversary 5', 'FileAttachment' : 'File Attachment', 'CAT_Custom_1423_326' : 'Gender', 'CAT_Custom_1424_326' : 'Height', 'CAT_Custom_1425_326' : 'Marital Status', 'CAT_Custom_1426_326' : 'Has Children', 'CAT_Custom_1427_326' : 'Years in Business', 'CAT_Custom_1428_326' : 'Number of Employees', 'CAT_Custom_1429_326' : 'Annual Revenue', 'CAT_Custom_1430_326' : 'Financial Year', 'InvoiceNumber' : 'Invoice Number', 'CardName' : 'Name on Card', 'CardNumber' : 'Card Number', 'CardExpiryMonth' : 'Card Expiry Month', 'CardExpiryYear' : 'Card Expiry Year', 'CardType' : 'Card Type', 'CardCCV' : 'CCV Number', 'CaptchaV2' : 'Captcha'};

	if (settings.customErrorFields !== '') settings.customErrorFields = settings.customErrorFields.split(',');

	function runValidation (required,counter,total) {
		var rdoChkFlag = false;
		if (counter===0) {errorCount=0;}

		// Check the field for a value change
		required.value = (required.field.val() === undefined) ? '' : required.field.val();

		// verify field types and make adjustments to them as needed.
		if (required.type === 'text' || required.type === 'hidden' || required.type === 'password') {
			switch (required.name) {
				case 'EmailAddress' : required.type = 'email';      break;
				case 'Friend01'     : required.type = 'email';      break;
				case 'Friend02'     : required.type = 'email';      break;
				case 'Friend03'     : required.type = 'email';      break;
				case 'Friend04'     : required.type = 'email';      break;
				case 'Friend05'     : required.type = 'email';      break;
				case 'DOB'          : required.type = 'date';       break;
				case 'Anniversary1' : required.type = 'date';       break;
				case 'Anniversary2' : required.type = 'date';       break;
				case 'Anniversary3' : required.type = 'date';       break;
				case 'Anniversary4' : required.type = 'date';       break;
				case 'Anniversary5' : required.type = 'date';       break;
				case 'Anniversary5' : required.type = 'date';       break;
				case 'CaptchaV2'    : required.type = 'captcha';    break;
				case 'CardNumber'   : required.type = 'number';     break;
				case 'CardCCV'      : required.type = 'number';     break;
				case 'Amount'       : required.type = 'currency';   break;
				case 'Password'     : required.type = 'password';   break;
				case 'PasswordConfirm'  : required.type = 'passwordconfirm';break;
				case 'Days'         : required.type = 'days';       break;
				default             : required.type = 'text';
			}
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
			switch (required.type) {
				case 'select'     : required.message = checkDropdown(required.value, required.label); break;
				case 'radio'      : required.message = checkSelected(selector.find('[name="'+required.name+'"]'), required.label); break;
				case 'checkbox'     : required.message = checkSelected(selector.find('[name="'+required.name+'"]'), required.label); break;
				case 'email'      : required.message = checkEmail(required.value); break;
				case 'date'       : required.message = checkDate(required.value,required.label); break;
				case 'password'     : required.message = (required.value !== "" && required.value.length < 6) ? "- Password must be 6 characters or longer" : isEmpty(required.value,required.label);pass.value = required.value;pass.label = required.label; break;
				case 'passwordconfirm'  : required.message = (pass.value.length > 0 && pass.value !== required.value) ? pass.label+' and '+required.label+' do not match' : ''; break;
				case 'captcha'      : required.message = captchaIsInvalid(selector[0], "Enter Word Verification in box", "Please enter the correct Word Verification as seen in the image"); break;
				case 'currency'     : required.message = isCurrency(required.value, required.label); break;
				case 'number'     : required.message = isNumeric(required.value, required.label); break;
				case 'days'       : required.message = isNumericIfVisible(required.field, required.label); break;
				default         : required.message = isEmpty(required.value,required.label);
			}
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
				case 'captcha' : (selector.find('#recaptcha_widget_div').length > 0) ? errorTarget = selector.find('#recaptcha_widget_div') : errorTarget = required.field; break;
				default : errorTarget = required.field;
			}
			if (errorTarget.parent().is(settings.errorGroupElement+'.'+settings.errorGroupClass)) {
				errorElementExists = true;
			}else {
				errorElementExists = false;
			}

			if (required.message !=='') {
				if (errorElementExists) {
					// just replace the error message
					errorTarget.siblings(settings.errorMessageElement+'.'+settings.errorClass).text(required.message);
				}else {
					// add the message into new element
					messageElement = '<'+settings.errorMessageElement+' class="'+settings.errorClass+'">'+required.message+'</'+settings.errorMessageElement+'>';
					errorTarget.addClass(settings.errorClass).wrap(errorElement);
					if (rdoChkFlag) selector.find('[name="' + required.name + '"]').addClass(settings.errorClass);
					errorTarget.parent().append(messageElement);
				}
			}else if (errorElementExists) {
				// remove the element
				errorTarget.siblings(settings.errorMessageElement+'.'+settings.errorClass).remove();
				errorTarget.removeClass(settings.errorClass).unwrap();
				if (rdoChkFlag) selector.find('[name="' + required.name + '"]').removeClass(settings.errorClass);
			}
		}
	}
	function buttonSubmitBehaviour(behavior){
		var submitButton = selector.find('[type="submit"]');
		switch(behavior){
			case 'show':
				submitButton.show();
				break;
			case 'hide':
				submitButton.hide();
				break;
			case 'disable':
				submitButton.attr('disabled','disabled');
				break;
			case 'enable':
				submitButton.removeAttr('disabled');
				break;
			default:
				submitButton.show();
				submitButton.removeAttr('disabled');
		}
	}
	function submitForm(submitCount) {
		if (submitCount===0) {

			buttonSubmitBehaviour(settings.buttonOnSubmit);
			if (settings.useAjax) {
				$.ajax({
					type: 'POST',
					url: action,
					data: selector.serialize(),
					success: function(response) {
						if (response.indexOf(settings.systemMessageClass) > 0) {
							var msg = $(response).find('.'+settings.systemMessageClass);
							if ($(msg).size() > 0) successMessage = msg;
							else successMessage = $(response).filter('.'+settings.systemMessageClass);
							showSuccess(selector,successMessage);
						}else if (response.indexOf(settings.systemErrorMessageClass) > 0) {
							var msg = $(response).find('.'+settings.systemErrorMessageClass);
							if ($(msg).size() > 0) successMessage = msg;
							else successMessage = $(response).filter('.'+settings.systemErrorMessageClass);
							showSuccess(selector,successMessage);
						}
						if (settings.ajaxSuccess !== null) executeCallback(window[settings.ajaxSuccess],response);
					},
					error: function(xhr,status) {
						if (settings.ajaxError !== null) executeCallback(window[settings.ajaxError],status);
						return false;
					},
					complete: function(xhr,status) {
						if (settings.ajaxComplete !== null) executeCallback(window[settings.ajaxComplete],status);
						buttonSubmitBehaviour(settings.buttonAfterSubmit);
					}
				});
			}else {
				selector.off('submit').submit();
			}
			return submitCount++;
		}else{
			alert("This form has already been submitted. Please refresh the page if you need to submit again.");
			return false;
		}
	}
	function executeCallback(callback,param){
		if (typeof callback === 'function') {
			var deferred = $.Deferred();
			if (param) deferred.resolve(callback(selector,param));
			else deferred.resolve(callback(selector));

			return deferred.promise();
		}
	}
	function showSuccess(selector,successMessage) {
		messageBox = $('#'+settings.messageBoxID);

		if (settings.afterAjax!=='show') {selector.fadeOut(0);}
		switch (settings.messageMode) {
			case 'append' : selector.after(messageBox);break;
			case 'prepend': selector.before(messageBox);break;
			case 'box': true;break;
			default : true;
		}

		if (successMessage.html().replace(/\n/g,'').replace(/	/g,'').replace(/ /g,'').length === 0 && settings.restoreMessageBox === true) successMessage = messageBoxContents;
		else if(successMessage.find('.search-results').length) successMessage = successMessage.find('.search-results').html();
		messageBox.html(successMessage).fadeIn();

		if (settings.afterAjax==='remove') {selector.remove();}
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
	function buildMultistepRequiredObject(rField,i) {
		requiredMultistep[i] = {
			name : rField.attr('name'),
			field : rField,
			type : (rField.is('input')) ? rField.attr('type') : rField.get(0).tagName.toLowerCase(),
			value : (rField.val() === undefined) ? '' : rField.val(),
			label : (selector.find('label[for="'+rField.attr('name')+'"]').length > 0) ? selector.find('label[for="'+rField.attr('name')+'"]').text() : rField.attr('placeholder')
		};
		if (requiredMultistep[i].label === undefined) requiredMultistep[i].label = labelFallback[requiredMultistep[i].name];
	}
	function autoRequirePaymentFields(){
		if (paymentMethods.filter(':checked').val() == '1' || onlyCCMethod)
			selector.find('[name="CardName"], [name="CardNumber"], [name="CardExpiryMonth"], [name="CardExpiryYear"], [name="CardType"], [name="CardCCV"]').addClass(settings.requiredClass);
		else
			selector.find('[name="CardName"], [name="CardNumber"], [name="CardExpiryMonth"], [name="CardExpiryYear"], [name="CardType"], [name="CardCCV"]').removeClass(settings.requiredClass);
		BuildRequiredObjectArray();
	}
	function BuildRequiredObjectArray(){
		var i = 0,_this = null;
		required=[];
		// Build required array
		requiredFields = selector.find('input, select, button, textarea').filter('.'+settings.requiredClass);

		for(var cnt=0,len = requiredFields.size(); cnt < len; cnt++){
			_this = requiredFields[cnt];
			newRequired = selector.find('[name="'+$(_this).attr("name")+'"]').not('.'+settings.requiredClass);
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
	function showHideNavButtons(index){
		if (multistepContainers.length === 0){
			selector.find(settings.continueButton + ',' + settings.backButton).hide();
			selector.find(settings.submitField).show();
		}
		else if (index === 0){
			selector.find(settings.submitField+', ' + settings.backButton).hide();
			selector.find(settings.continueButton).show();
		}
		else if (index == multistepContainers.length -1){
			selector.find(settings.continueButton).hide();
			selector.find(settings.submitField+', ' + settings.backButton).show();
		}
		else{
			selector.find(settings.continueButton + ',' + settings.backButton).show();
			selector.find(settings.submitField).hide();
		}
	}

	// Auto Require certain fields
	autoRequire = ['FirstName','LastName','FullName','EmailAddress','CaptchaV2','ItemName'];
	for (var i = 0; i< autoRequire.length; i++) {
		autoRequire.field = selector.find('[name="'+autoRequire[i]+'"]');
		if (autoRequire.field.length > 0 && autoRequire.field.not('.'+settings.requiredClass)) autoRequire.field.addClass(settings.requiredClass);
	}

	// Auto require credit card fields depending upon payment method
	if (paymentMethods.size() == 1)
			if ($(paymentMethods[0]).val() == '1') onlyCCMethod = true;
	//autoRequirePaymentFields();
	selector.on('click',paymentMethods,autoRequirePaymentFields);
	// BuildRequiredObjectArray();



	// If multistep true configure validations on containers
	if (settings.multistep){
		var cont = settings.containers.split(',');
		selector.on('keypress',function(e) {
			if (e.keyCode == 13) {
				e.preventDefault();
				if (selector.find(settings.continueButton).filter(':visible').size() > 0) selector.find(settings.continueButton).filter(':visible').trigger('click');
				else selector.find('[type="submit"]:visible').trigger('click');
			}
		});
		for (var i = 0, len = $(cont).size(); i < len; i++) {
			var _this = $(cont[i]);
			multistepContainers.push(_this);
		}
		selector.on('click',settings.continueButton,function(){
			buildMultiRequiredObjects(containerIndex);
			for (var i = 0;i<requiredMultistep.length;i++) {
				runValidation(requiredMultistep[i],i,requiredMultistep.length);
			}
			if (errorCount===0) moveToContainer(++containerIndex);

			// Now that submission has been attempted, allow active field validation.
			if (settings.validateMode === 'inline') {
				// Set onChangeBinding to true in order to prevent these bindings from occuring multiple times.
				if (requiredMultistep.length>0) {
					for (var i = 0;i<requiredMultistep.length;i++) {
						selector.off('change.multistep',requiredMultistep[i].field);
						selector.on('change.multistep',requiredMultistep[i].field,function() {
							currentName = $(this).attr('name');
							for (var i = 0;i<requiredMultistep.length;i++) {
								if (currentName === requiredMultistep[i].name) runValidation(requiredMultistep[i],0,1);
							}
						});
					}
				}
			}
		});
		selector.on('click',settings.backButton,function(){
			moveToContainer(--containerIndex);
		});
		moveToContainer(containerIndex);
	}
	// Move to container specified by index, (default 0)
	function moveToContainer(index){
		showHideNavButtons(index);
		if (index > multistepContainers.length -1){
			index = multistepContainers.length - 1;
			return;
		}

		var currContainer = multistepContainers[index];
		requiredMultistep = [];

		for (var count=0,len=$(multistepContainers).size(); count < len; count++){
			$(multistepContainers[count]).removeClass('activeContainer').hide();
		}


		currContainer.addClass('activeContainer').show();
		if (index > 0) selector.get(0).scrollIntoView();
	}
	function buildMultiRequiredObjects (index) {
		var currContainer = multistepContainers[index];
		requiredMultistep = [];

		// Build required array
		requiredFields = currContainer.find('input, select, button, textarea').filter('.'+settings.requiredClass);
		var i = 0;
		for (var cnt = 0, len = $(requiredFields).size(); cnt < len; cnt++){
			_this = requiredFields[cnt];
			newRequired = currContainer.find('[name="'+$(_this).attr("name")+'"]').not('.'+settings.requiredClass);
			if (newRequired.length > 0) {
				for(var cnt2=0, len2 = $(newRequired).size(); cnt2<len2; cnt2++){
					var newRequiredItem = $(newRequired[cnt2]);
					newRequiredItem.addClass(settings.requiredClass);
					buildMultistepRequiredObject(newRequiredItem,i);
					i++;
				}
			}
			buildMultistepRequiredObject($(_this),i);
			i++;
		}
	}

	// bind to the submit event of our form
	selector.on('submit',function(event) {
		event.preventDefault();

		autoRequirePaymentFields();
		BuildRequiredObjectArray();

		if (lockSubmit) return false;
		else lockSubmit = true;
		for (var i = 0;i<required.length;i++) {
			runValidation(required[i],i,required.length);
		}
		if (errorCount===0) {
			// providing backwards compatibility with beforeSubmit
			if (settings.beforeSubmit !== null && settings.validationSuccess === null) settings.validationSuccess = settings.beforeSubmit;

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
			// Set onChangeBinding to true in order to prevent these bindings from occuring multiple times.
			onChangeBinding = true;
			if (required.length>0) {
				for (var i = 0;i<required.length;i++) {
					selector.on('change','[name="' + required[i].name + '"]', function() {
						currentName = $(this).attr('name');
						for (var i = 0;i<required.length;i++) {
							if (currentName === required[i].name) runValidation(required[i],0,1);
						}
					});
				}
			}
		}
		lockSubmit = false;
	});
	// Activate submitEvent
	if (settings.submitField !== '[type="submit"]') {
		submitField = selector.find(settings.submitField);
		if (submitField.length > 0 && settings.submitEvent !== null && settings.submitEvent === 'keyup' || settings.submitEvent === 'blur' || settings.submitEvent === 'change' || settings.submitEvent === 'dblclick') {
			selector.on(settings.submitEvent,settings.submitField,function(){
				selector.submit();
			});
		}
	}
};

/*
 * "Foundation". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie
*/

bcpie.extensions.tricks.Foundation = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Foundation',
		version: '2015.01.31',
		defaults: {
			feature: null
		}
	});

	if (settings.feature === 'topbar') {
		selector.find('li').filter(function(){
			return $(this).children('ul').length > 0 && !$(this).is('.has-dropdown');
		}).addClass('has-dropdown');
		selector.find('.has-dropdown').filter(function(){
			return $(this).children('.dropdown').length === 0;
		}).removeClass('has-dropdown');
	}
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
			scope : 'form', // Uses 'form' or css selectors as values
			event : 'change', // specify the event that triggers the copy
			ref : 'value' // or text
		}
	});

	// Setup our variables
	var copyGroup = (settings.scope === 'form') ? selector.closest('form') : body.find(settings.scope),
		copyField, checkbox = copyGroup.find('['+settings.attributeType+'='+settings.checkbox+']'),
		copyFields=[],altCopyFields=[],altCheckbox = copyGroup.find('['+settings.attributeType+'='+settings.altCheckbox+']'),value;

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
		var strExpression = settings.copy,expr;
		strExpression = GetfieldVal(strExpression);
		try
		{
			if(settings.copyType == "math"){
				expr = Parser.parse(strExpression);
				return expr.evaluate();
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
/*
 * Secure
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Secure = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Secure',
		version: '2015.01.29',
		defaults: {
			unsecureLinks: true,
			onSessionEnd: '',
			sessionEndRedirect: '',
			securePayments: true
		}
	});

	var blurTime,status,secure = win.location.origin === settings.secureDomain,links,href,interval;

	if (settings.securePayments === true) {
		if (selector.find('[name="Amount"]').length > 0 && secure === false) {
			win.location.href = settings.secureDomain+settings.pageAddress;
		}
	}
	if(settings.onSessionEnd !== '' || settings.sessionEndRedirect !== ''){
		if(settings.user.isLoggedIn === true) {
			sessionBehavior();
			bindSessionEvents();
		}
	}
	if(settings.unsecureLinks === true) unsecureLinks();

	function unsecureLinks () {
		if (secure === true) {
			links = selector.find('a').not('[href^="mailto:"]').not('[href="/LogOutProcess.aspx"]');
			for (var i=0; i<links.length; i++) {
				href = $(links[i]).attr("href") || '';
				if (href.indexOf('http') === -1 && href.indexOf('//') === -1 && href.indexOf('#') === -1) {
					href = (href.indexOf('/') !== 0) ? settings.primaryDomain+'/'+href : settings.primaryDomain+href;
					$(links[i]).attr('href', href);
				}
			}
		}
	}
	function sessionBehavior() {
		$.ajax({
			url: '/',
			type: 'GET',
			success: function(response) {
				if ($(response).filter('#bcmodules').data('bc-loginstatus') === false) {
					if (settings.sessionEndRedirect !== '') win.location.href = settings.primaryDomain+settings.sessionEndRedirect;
					if (settings.onSessionEnd !== '') executeCallback(window[settings.onSessionEnd]);
					clearInterval(interval);
				}
			}
		});
	}
	function bindSessionEvents (argument) {
		interval = setInterval(function(){sessionBehavior();},900000); // 15min
		$(win).on('focus',function(){
			sessionBehavior();
		});
	}
	function executeCallback(callback){
		if(typeof callback === 'function') {
			var deferred = $.Deferred();
			deferred.resolve(callback());
			return deferred.promise();
		}
	}
};
/*
 * ThemeClean
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie
*/

bcpie.extensions.tricks.ThemeClean = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'ThemeClean',
		version: '2015.01.28'
	});

	$('link').filter(function(){
		return $(this).attr('href').toLowerCase().indexOf('.css') > -1;
	}).not(function(){
		return ['modulestylesheets.css','theme.css'].indexOf($(this).attr('href').toLowerCase()) > -1;
	}).remove();
};
/*
 * "Trigger". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie, or as licensed in Dev-in-a-Box from http://www.bcappstore.com/apps/dev-in-a-box
*/

bcpie.extensions.tricks.Trigger = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'Trigger',
		version: '2015.01.29',
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
				return triggerElement.filter(':checked').val();
			else if(triggerElement.is('[type=checkbox]')){
				if(settings.triggerValue === '' && triggerElement.filter(':checked').size() > 0)
					return "";
				if(triggerElement.filter("[value='" + settings.triggerValue + "']:checked").size() > 0)
					return triggerElement.filter("[value='" + settings.triggerValue + "']:checked").val();
				else null;
			}else return triggerElement.val();
		}
		else {
			triggerElement.attr(settings.triggerAttr);
		}
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