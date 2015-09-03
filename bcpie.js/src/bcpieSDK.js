var doc = document,body = $(doc.body),win = window,settings;
win.bcpie = {
	active: {
		bcpieSDK: '2015.09.02',
		tricks: {} // populated automatically
	},
	globals: {
		path: win.location.pathname.toLowerCase(),
		pathArray: win.location.pathname.toLowerCase().split(/(?=\/#?[a-zA-Z0-9])/g),
		param: win.location.search,
		paramArray: win.location.search.split(/(?=&#?[a-zA-Z0-9])/g),
		hash: win.location.hash,
		countries: {"AF": {"Country": "Afghanistan", "ContinentCode": "AS", "Continent": "Asia"}, "AX": {"Country": "Aland Islands", "ContinentCode": "EU", "Continent": "Europe"}, "AL": {"Country": "Albania", "ContinentCode": "EU", "Continent": "Europe"}, "DZ": {"Country": "Algeria", "ContinentCode": "AF", "Continent": "Africa"}, "AS": {"Country": "American Samoa", "ContinentCode": "OC", "Continent": "Oceania"}, "AD": {"Country": "Andorra", "ContinentCode": "EU", "Continent": "Europe"}, "AO": {"Country": "Angola", "ContinentCode": "AF", "Continent": "Africa"}, "AI": {"Country": "Anguilla", "ContinentCode": "NA", "Continent": "North America"}, "AQ": {"Country": "Antarctica", "ContinentCode": "AN", "Continent": "Antartica"}, "AG": {"Country": "Antigua and Barbuda", "ContinentCode": "NA", "Continent": "North America"}, "AR": {"Country": "Argentina", "ContinentCode": "SA", "Continent": "South America"}, "AM": {"Country": "Armenia", "ContinentCode": "AS", "Continent": "Asia"}, "AW": {"Country": "Aruba", "ContinentCode": "NA", "Continent": "North America"}, "AU": {"Country": "Australia", "ContinentCode": "OC", "Continent": "Oceania"}, "AT": {"Country": "Austria", "ContinentCode": "EU", "Continent": "Europe"}, "AZ": {"Country": "Azerbaijan", "ContinentCode": "AS", "Continent": "Asia"}, "BS": {"Country": "Bahamas", "ContinentCode": "NA", "Continent": "North America"}, "BH": {"Country": "Bahrain", "ContinentCode": "AS", "Continent": "Asia"}, "BD": {"Country": "Bangladesh", "ContinentCode": "AS", "Continent": "Asia"}, "BB": {"Country": "Barbados", "ContinentCode": "NA", "Continent": "North America"}, "BY": {"Country": "Belarus", "ContinentCode": "EU", "Continent": "Europe"}, "BE": {"Country": "Belgium", "ContinentCode": "EU", "Continent": "Europe"}, "BZ": {"Country": "Belize", "ContinentCode": "NA", "Continent": "North America"}, "BJ": {"Country": "Benin", "ContinentCode": "AF", "Continent": "Africa"}, "BM": {"Country": "Bermuda", "ContinentCode": "NA", "Continent": "North America"}, "BT": {"Country": "Bhutan", "ContinentCode": "AS", "Continent": "Asia"}, "BO": {"Country": "Bolivia", "ContinentCode": "SA", "Continent": "South America"}, "BA": {"Country": "Bosnia and Herzegovina", "ContinentCode": "EU", "Continent": "Europe"}, "BW": {"Country": "Botswana", "ContinentCode": "AF", "Continent": "Africa"}, "BV": {"Country": "Bouvet Island", "ContinentCode": "AN", "Continent": "Antartica"}, "BR": {"Country": "Brazil", "ContinentCode": "SA", "Continent": "South America"}, "IO": {"Country": "British Indian Ocean Territory", "ContinentCode": "AS", "Continent": "Asia"}, "VG": {"Country": "British Virgin Islands", "ContinentCode": "NA", "Continent": "North America"}, "BN": {"Country": "Brunei Darussalam", "ContinentCode": "AS", "Continent": "Asia"}, "BG": {"Country": "Bulgaria", "ContinentCode": "EU", "Continent": "Europe"}, "BF": {"Country": "Burkina Faso", "ContinentCode": "AF", "Continent": "Africa"}, "BI": {"Country": "Burundi", "ContinentCode": "AF", "Continent": "Africa"}, "KH": {"Country": "Cambodia", "ContinentCode": "AS", "Continent": "Asia"}, "CM": {"Country": "Cameroon", "ContinentCode": "AF", "Continent": "Africa"}, "CA": {"Country": "Canada", "ContinentCode": "NA", "Continent": "North America"}, "CV": {"Country": "Cape Verde", "ContinentCode": "AF", "Continent": "Africa"}, "KY": {"Country": "Cayman Islands", "ContinentCode": "NA", "Continent": "North America"}, "CF": {"Country": "Central African Republic", "ContinentCode": "AF", "Continent": "Africa"}, "TD": {"Country": "Chad", "ContinentCode": "AF", "Continent": "Africa"}, "CL": {"Country": "Chile", "ContinentCode": "SA", "Continent": "South America"}, "CN": {"Country": "China", "ContinentCode": "AS", "Continent": "Asia"}, "CX": {"Country": "Christmas Island", "ContinentCode": "AS", "Continent": "Asia"}, "CC": {"Country": "Cocos (Keeling) Islands", "ContinentCode": "AS", "Continent": "Asia"}, "CO": {"Country": "Colombia", "ContinentCode": "SA", "Continent": "South America"}, "KM": {"Country": "Comoros", "ContinentCode": "AF", "Continent": "Africa"}, "CG": {"Country": "Congo", "ContinentCode": "AF", "Continent": "Africa"}, "CD": {"Country": "Congo, Democratic Republic of the", "ContinentCode": "AF", "Continent": "Africa"}, "CK": {"Country": "Cook Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "CR": {"Country": "Costa Rica", "ContinentCode": "NA", "Continent": "North America"}, "HR": {"Country": "Croatia", "ContinentCode": "EU", "Continent": "Europe"}, "CY": {"Country": "Cyprus", "ContinentCode": "AS", "Continent": "Asia"}, "CZ": {"Country": "Czech Republic", "ContinentCode": "EU", "Continent": "Europe"}, "DK": {"Country": "Denmark", "ContinentCode": "EU", "Continent": "Europe"}, "DJ": {"Country": "Djibouti", "ContinentCode": "AF", "Continent": "Africa"}, "DM": {"Country": "Dominica", "ContinentCode": "NA", "Continent": "North America"}, "DO": {"Country": "Dominican Republic", "ContinentCode": "NA", "Continent": "North America"}, "TL": {"Country": "East Timor", "ContinentCode": "AS", "Continent": "Asia"}, "EC": {"Country": "Ecuador", "ContinentCode": "SA", "Continent": "South America"}, "EG": {"Country": "Egypt", "ContinentCode": "AF", "Continent": "Africa"}, "SV": {"Country": "El Salvador", "ContinentCode": "NA", "Continent": "North America"}, "GQ": {"Country": "Equatorial Guinea", "ContinentCode": "AF", "Continent": "Africa"}, "ER": {"Country": "Eritrea", "ContinentCode": "AF", "Continent": "Africa"}, "EE": {"Country": "Estonia", "ContinentCode": "EU", "Continent": "Europe"}, "ET": {"Country": "Ethiopia", "ContinentCode": "AF", "Continent": "Africa"}, "FK": {"Country": "Falkland Islands", "ContinentCode": "SA", "Continent": "South America"}, "FO": {"Country": "Faroe Islands", "ContinentCode": "EU", "Continent": "Europe"}, "FJ": {"Country": "Fiji", "ContinentCode": "OC", "Continent": "Oceania"}, "FI": {"Country": "Finland", "ContinentCode": "EU", "Continent": "Europe"}, "FR": {"Country": "France", "ContinentCode": "EU", "Continent": "Europe"}, "GF": {"Country": "French Guiana", "ContinentCode": "SA", "Continent": "South America"}, "PF": {"Country": "French Polynesia", "ContinentCode": "OC", "Continent": "Oceania"}, "TF": {"Country": "French Southern Territories", "ContinentCode": "AN", "Continent": "Antartica"}, "GA": {"Country": "Gabon", "ContinentCode": "AF", "Continent": "Africa"}, "GM": {"Country": "Gambia", "ContinentCode": "AF", "Continent": "Africa"}, "GE": {"Country": "Georgia", "ContinentCode": "AS", "Continent": "Asia"}, "DE": {"Country": "Germany", "ContinentCode": "EU", "Continent": "Europe"}, "GH": {"Country": "Ghana", "ContinentCode": "AF", "Continent": "Africa"}, "GI": {"Country": "Gibraltar", "ContinentCode": "EU", "Continent": "Europe"}, "GR": {"Country": "Greece", "ContinentCode": "EU", "Continent": "Europe"}, "GL": {"Country": "Greenland", "ContinentCode": "NA", "Continent": "North America"}, "GD": {"Country": "Grenada", "ContinentCode": "NA", "Continent": "North America"}, "GP": {"Country": "Guadeloupe", "ContinentCode": "NA", "Continent": "North America"}, "GU": {"Country": "Guam", "ContinentCode": "OC", "Continent": "Oceania"}, "GT": {"Country": "Guatemala", "ContinentCode": "NA", "Continent": "North America"}, "GG": {"Country": "Guernsey", "ContinentCode": "EU", "Continent": "Europe"}, "GN": {"Country": "Guinea", "ContinentCode": "AF", "Continent": "Africa"}, "GW": {"Country": "Guinea-Bissau", "ContinentCode": "AF", "Continent": "Africa"}, "GY": {"Country": "Guyana", "ContinentCode": "SA", "Continent": "South America"}, "HT": {"Country": "Haiti", "ContinentCode": "NA", "Continent": "North America"}, "HM": {"Country": "Heard Island and McDonald Islands", "ContinentCode": "AN", "Continent": "Antartica"}, "VA": {"Country": "Holy See (Vatican City-State)", "ContinentCode": "EU", "Continent": "Europe"}, "HN": {"Country": "Honduras", "ContinentCode": "NA", "Continent": "North America"}, "HK": {"Country": "Hong Kong SAR", "ContinentCode": "AS", "Continent": "Asia"}, "HU": {"Country": "Hungary", "ContinentCode": "EU", "Continent": "Europe"}, "IS": {"Country": "Iceland", "ContinentCode": "EU", "Continent": "Europe"}, "IN": {"Country": "India", "ContinentCode": "AS", "Continent": "Asia"}, "ID": {"Country": "Indonesia", "ContinentCode": "AS", "Continent": "Asia"}, "IQ": {"Country": "Iraq", "ContinentCode": "AS", "Continent": "Asia"}, "IE": {"Country": "Ireland", "ContinentCode": "EU", "Continent": "Europe"}, "IL": {"Country": "Israel", "ContinentCode": "AS", "Continent": "Asia"}, "IT": {"Country": "Italy", "ContinentCode": "EU", "Continent": "Europe"}, "CI": {"Country": "Ivory Coast", "ContinentCode": "AF", "Continent": "Africa"}, "JM": {"Country": "Jamaica", "ContinentCode": "NA", "Continent": "North America"}, "JP": {"Country": "Japan", "ContinentCode": "AS", "Continent": "Asia"}, "JE": {"Country": "Jersey", "ContinentCode": "EU", "Continent": "Europe"}, "JO": {"Country": "Jordan", "ContinentCode": "AS", "Continent": "Asia"}, "KZ": {"Country": "Kazakhstan", "ContinentCode": "AS", "Continent": "Asia"}, "KE": {"Country": "Kenya", "ContinentCode": "AF", "Continent": "Africa"}, "KI": {"Country": "Kiribati", "ContinentCode": "OC", "Continent": "Oceania"}, "KR": {"Country": "Korea, Republic Of", "ContinentCode": "AS", "Continent": "Asia"}, "KW": {"Country": "Kuwait", "ContinentCode": "AS", "Continent": "Asia"}, "KG": {"Country": "Kyrgyzstan", "ContinentCode": "AS", "Continent": "Asia"}, "LA": {"Country": "Laos", "ContinentCode": "AS", "Continent": "Asia"}, "LV": {"Country": "Latvia", "ContinentCode": "EU", "Continent": "Europe"}, "LB": {"Country": "Lebanon", "ContinentCode": "AS", "Continent": "Asia"}, "LS": {"Country": "Lesotho", "ContinentCode": "AF", "Continent": "Africa"}, "LR": {"Country": "Liberia", "ContinentCode": "AF", "Continent": "Africa"}, "LY": {"Country": "Libya", "ContinentCode": "AF", "Continent": "Africa"}, "LI": {"Country": "Liechtenstein", "ContinentCode": "EU", "Continent": "Europe"}, "LT": {"Country": "Lithuania", "ContinentCode": "EU", "Continent": "Europe"}, "LU": {"Country": "Luxembourg", "ContinentCode": "EU", "Continent": "Europe"}, "MO": {"Country": "Macao SAR", "ContinentCode": "AS", "Continent": "Asia"}, "MK": {"Country": "Macedonia, Former Yugoslav Republic of", "ContinentCode": "EU", "Continent": "Europe"}, "MG": {"Country": "Madagascar", "ContinentCode": "AF", "Continent": "Africa"}, "MW": {"Country": "Malawi", "ContinentCode": "AF", "Continent": "Africa"}, "MY": {"Country": "Malaysia", "ContinentCode": "AS", "Continent": "Asia"}, "MV": {"Country": "Maldives", "ContinentCode": "AS", "Continent": "Asia"}, "ML": {"Country": "Mali", "ContinentCode": "AF", "Continent": "Africa"}, "MT": {"Country": "Malta", "ContinentCode": "EU", "Continent": "Europe"}, "MH": {"Country": "Marshall Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "MQ": {"Country": "Martinique", "ContinentCode": "NA", "Continent": "North America"}, "MR": {"Country": "Mauritania", "ContinentCode": "AF", "Continent": "Africa"}, "MU": {"Country": "Mauritius", "ContinentCode": "AF", "Continent": "Africa"}, "YT": {"Country": "Mayotte", "ContinentCode": "AF", "Continent": "Africa"}, "MX": {"Country": "Mexico", "ContinentCode": "NA", "Continent": "North America"}, "FM": {"Country": "Micronesia, Federated States of", "ContinentCode": "OC", "Continent": "Oceania"}, "MD": {"Country": "Moldova", "ContinentCode": "EU", "Continent": "Europe"}, "MC": {"Country": "Monaco", "ContinentCode": "EU", "Continent": "Europe"}, "MN": {"Country": "Mongolia", "ContinentCode": "AS", "Continent": "Asia"}, "ME": {"Country": "Montenegro", "ContinentCode": "EU", "Continent": "Europe"}, "MS": {"Country": "Montserrat", "ContinentCode": "NA", "Continent": "North America"}, "MA": {"Country": "Morocco", "ContinentCode": "AF", "Continent": "Africa"}, "MZ": {"Country": "Mozambique", "ContinentCode": "AF", "Continent": "Africa"}, "MM": {"Country": "Myanmar", "ContinentCode": "AS", "Continent": "Asia"}, "NA": {"Country": "Namibia", "ContinentCode": "AF", "Continent": "Africa"}, "NR": {"Country": "Nauru", "ContinentCode": "OC", "Continent": "Oceania"}, "NP": {"Country": "Nepal", "ContinentCode": "AS", "Continent": "Asia"}, "NL": {"Country": "Netherlands", "ContinentCode": "EU", "Continent": "Europe"}, "AN": {"Country": "Netherlands Antilles", "ContinentCode": "NA", "Continent": "North America"}, "NC": {"Country": "New Caledonia", "ContinentCode": "OC", "Continent": "Oceania"}, "NZ": {"Country": "New Zealand", "ContinentCode": "OC", "Continent": "Oceania"}, "NI": {"Country": "Nicaragua", "ContinentCode": "NA", "Continent": "North America"}, "NE": {"Country": "Niger", "ContinentCode": "AF", "Continent": "Africa"}, "NG": {"Country": "Nigeria", "ContinentCode": "AF", "Continent": "Africa"}, "NU": {"Country": "Niue", "ContinentCode": "OC", "Continent": "Oceania"}, "NF": {"Country": "Norfolk Island", "ContinentCode": "OC", "Continent": "Oceania"}, "MP": {"Country": "Northern Mariana Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "NO": {"Country": "Norway", "ContinentCode": "EU", "Continent": "Europe"}, "OM": {"Country": "Oman", "ContinentCode": "AS", "Continent": "Asia"}, "PK": {"Country": "Pakistan", "ContinentCode": "AS", "Continent": "Asia"}, "PW": {"Country": "Palau", "ContinentCode": "OC", "Continent": "Oceania"}, "PS": {"Country": "Palestine", "ContinentCode": "AS", "Continent": "Asia"}, "PA": {"Country": "Panama", "ContinentCode": "NA", "Continent": "North America"}, "PG": {"Country": "Papua New Guinea", "ContinentCode": "OC", "Continent": "Oceania"}, "PY": {"Country": "Paraguay", "ContinentCode": "SA", "Continent": "South America"}, "PE": {"Country": "Peru", "ContinentCode": "SA", "Continent": "South America"}, "PH": {"Country": "Philippines", "ContinentCode": "AS", "Continent": "Asia"}, "PN": {"Country": "Pitcairn Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "PL": {"Country": "Poland", "ContinentCode": "EU", "Continent": "Europe"}, "PT": {"Country": "Portugal", "ContinentCode": "EU", "Continent": "Europe"}, "PR": {"Country": "Puerto Rico", "ContinentCode": "NA", "Continent": "North America"}, "QA": {"Country": "Qatar", "ContinentCode": "AS", "Continent": "Asia"}, "RE": {"Country": "Reunion", "ContinentCode": "AF", "Continent": "Africa"}, "RO": {"Country": "Romania", "ContinentCode": "EU", "Continent": "Europe"}, "RU": {"Country": "Russian Federation", "ContinentCode": "EU", "Continent": "Europe"}, "RW": {"Country": "Rwanda", "ContinentCode": "AF", "Continent": "Africa"}, "BL": {"Country": "Saint Barthélemy", "ContinentCode": "NA", "Continent": "North America"}, "WS": {"Country": "Samoa", "ContinentCode": "OC", "Continent": "Oceania"}, "SM": {"Country": "San Marino", "ContinentCode": "EU", "Continent": "Europe"}, "ST": {"Country": "Sao Tome and Principe", "ContinentCode": "AF", "Continent": "Africa"}, "SA": {"Country": "Saudi Arabia", "ContinentCode": "AS", "Continent": "Asia"}, "SN": {"Country": "Senegal", "ContinentCode": "AF", "Continent": "Africa"}, "RS": {"Country": "Serbia", "ContinentCode": "EU", "Continent": "Europe"}, "CS": {"Country": "Serbia and Montenegro", "ContinentCode": "EU", "Continent": "Europe"}, "SC": {"Country": "Seychelles", "ContinentCode": "AF", "Continent": "Africa"}, "SL": {"Country": "Sierra Leone", "ContinentCode": "AF", "Continent": "Africa"}, "SG": {"Country": "Singapore", "ContinentCode": "AS", "Continent": "Asia"}, "SK": {"Country": "Slovakia", "ContinentCode": "EU", "Continent": "Europe"}, "SI": {"Country": "Slovenia", "ContinentCode": "EU", "Continent": "Europe"}, "SB": {"Country": "Solomon Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "SO": {"Country": "Somalia", "ContinentCode": "AF", "Continent": "Africa"}, "ZA": {"Country": "South Africa", "ContinentCode": "AF", "Continent": "Africa"}, "GS": {"Country": "South Georgia and the South Sandwich Islands", "ContinentCode": "AN", "Continent": "Antartica"}, "ES": {"Country": "Spain", "ContinentCode": "EU", "Continent": "Europe"}, "LK": {"Country": "Sri Lanka", "ContinentCode": "AS", "Continent": "Asia"}, "SH": {"Country": "St. Helena", "ContinentCode": "AF", "Continent": "Africa"}, "KN": {"Country": "St. Kitts and Nevis", "ContinentCode": "NA", "Continent": "North America"}, "LC": {"Country": "St. Lucia", "ContinentCode": "NA", "Continent": "North America"}, "MF": {"Country": "St. Martin", "ContinentCode": "NA", "Continent": "North America"}, "PM": {"Country": "St. Pierre and Miquelon", "ContinentCode": "NA", "Continent": "North America"}, "VC": {"Country": "St. Vincent and the Grenadines", "ContinentCode": "NA", "Continent": "North America"}, "SR": {"Country": "Suriname", "ContinentCode": "SA", "Continent": "South America"}, "SJ": {"Country": "Svalbard and Jan Mayen", "ContinentCode": "EU", "Continent": "Europe"}, "SZ": {"Country": "Swaziland", "ContinentCode": "AF", "Continent": "Africa"}, "SE": {"Country": "Sweden", "ContinentCode": "EU", "Continent": "Europe"}, "CH": {"Country": "Switzerland", "ContinentCode": "EU", "Continent": "Europe"}, "TW": {"Country": "Taiwan", "ContinentCode": "AS", "Continent": "Asia"}, "TJ": {"Country": "Tajikistan", "ContinentCode": "AS", "Continent": "Asia"}, "TZ": {"Country": "Tanzania", "ContinentCode": "AF", "Continent": "Africa"}, "TH": {"Country": "Thailand", "ContinentCode": "AS", "Continent": "Asia"}, "TG": {"Country": "Togo", "ContinentCode": "AF", "Continent": "Africa"}, "TK": {"Country": "Tokelau", "ContinentCode": "OC", "Continent": "Oceania"}, "TO": {"Country": "Tonga", "ContinentCode": "OC", "Continent": "Oceania"}, "TT": {"Country": "Trinidad and Tobago", "ContinentCode": "NA", "Continent": "North America"}, "TN": {"Country": "Tunisia", "ContinentCode": "AF", "Continent": "Africa"}, "TR": {"Country": "Turkey", "ContinentCode": "EU", "Continent": "Europe"}, "TM": {"Country": "Turkmenistan", "ContinentCode": "AS", "Continent": "Asia"}, "TC": {"Country": "Turks and Caicos Islands", "ContinentCode": "NA", "Continent": "North America"}, "TV": {"Country": "Tuvalu", "ContinentCode": "OC", "Continent": "Oceania"}, "UG": {"Country": "Uganda", "ContinentCode": "AF", "Continent": "Africa"}, "UA": {"Country": "Ukraine", "ContinentCode": "EU", "Continent": "Europe"}, "AE": {"Country": "United Arab Emirates", "ContinentCode": "AS", "Continent": "Asia"}, "GB": {"Country": "United Kingdom", "ContinentCode": "EU", "Continent": "Europe"}, "US": {"Country": "United States", "ContinentCode": "NA", "Continent": "North America"}, "UY": {"Country": "Uruguay", "ContinentCode": "SA", "Continent": "South America"}, "UM": {"Country": "US Minor Outlying Islands", "ContinentCode": "OC", "Continent": "Oceania"}, "VI": {"Country": "US Virgin Islands", "ContinentCode": "NA", "Continent": "North America"}, "UZ": {"Country": "Uzbekistan", "ContinentCode": "AS", "Continent": "Asia"}, "VU": {"Country": "Vanuatu", "ContinentCode": "OC", "Continent": "Oceania"}, "VE": {"Country": "Venezuela", "ContinentCode": "SA", "Continent": "South America"}, "VN": {"Country": "Viet Nam", "ContinentCode": "AS", "Continent": "Asia"}, "WF": {"Country": "Wallis and Futuna", "ContinentCode": "OC", "Continent": "Oceania"}, "EH": {"Country": "Western Sahara", "ContinentCode": "AF", "Continent": "Africa"}, "YE": {"Country": "Yemen", "ContinentCode": "AS", "Continent": "Asia"}, "ZM": {"Country": "Zambia", "ContinentCode": "AF", "Continent": "Africa"}, "ZW": {"Country": "Zimbabwe", "ContinentCode": "AF", "Continent": "Africa"} },
		states: {"AL": "Alabama", "AK": "Alaska", "AS": "American Samoa", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware", "DC": "District Of Columbia", "FM": "Federated States Of Micronesia", "FL": "Florida", "GA": "Georgia", "GU": "Guam", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MH": "Marshall Islands", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota", "MP": "Northern Mariana Islands", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PW": "Palau", "PA": "Pennsylvania", "PR": "Puerto Rico", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VI": "Virgin Islands", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"}
	},
	ajax: {
		token: function() {
			if (typeof $.cookie('access_token') !== 'undefined') return $.cookie('access_token');
			else return $.cookie('access_token',window.location.hash.replace('#access_token=',''));
		},
		file: {
			get: function(data,options) {
				data = {
					path: data.path || '', // string
				}

				if (typeof options !== 'object') options = {};
				if (data.path.indexOf('/') !== 0) data.path = '/'+data.path;
				if (data.path.charAt(data.path.length - 1) === '/') data.path.slice(0, - 1);

				options.url = '/api/v2/admin/sites/current/storage'+data.path;
				options.headers = {Authorization: bcpie.ajax.token()};
				options.method = 'GET';

				return bcpie.utils.ajax(options);
			},
			save: function(data,options) {
				data = {
					path: data.path || '', // string
					content: data.content || '', // file object, string
					version: data.version || 'draft-publish' // 'draft', 'draft-publish'
				}

				if (typeof options !== 'object') options = {};
				if (data.path.indexOf('/') !== 0) data.path = '/'+data.path;
				if (data.path.charAt(data.path.length - 1) === '/') data.path.slice(0, - 1);

				options.url = '/api/v2/admin/sites/current/storage'+data.path+'?version='+data.version;
				options.headers = {Authorization: bcpie.ajax.token()};

				if (typeof data.content === 'string' || typeof data.content.length === 'undefined') {
					options.method = 'PUT';
					options.contentType = 'application/octet-stream';
					if (typeof data.content.upload !== 'undefined' || typeof data.content.type !== 'undefined') {
						options.processData = false;
						options.url.replace('?version='+data.version,'');
						options.data = data.content;
					}else options.data = JSON.stringify(data.content);
				}else {
					options.method = 'POST';
					options.contentType = false;
					options.cache = false;
					options.processData = false;
					options.data = new FormData();
					options.data.append('file', data.content);
				}

				return bcpie.utils.ajax(options);
			},
			delete: function(data,options) {
				data = {
					path: data.path || '' // string
				}

				if (typeof options !== 'object') options = {};
				if (data.path.indexOf('/') !== 0) data.path = '/'+data.path;
				if (data.path.charAt(data.path.length - 1) === '/') data.path.slice(0, - 1);

				options.url = '/api/v2/admin/sites/current/storage'+data.path;
				options.headers = {Authorization: bcpie.ajax.token()};
				options.method = 'DELETE';

				return bcpie.utils.ajax(options);
			},
			uploadStatus: function() {
				if (typeof options !== 'object') options = {};
				options.url = '/api/v2/admin/sites/current/storage?status';
				options.method = 'GET';
				options.headers = {Authorization: bcpie.ajax.token()};

				return bcpie.utils.ajax(options);
			}
		},
		folder: {
			get: function(data,options) {
				data = {
					path: data.path || ''
				}
				if (typeof options !== 'object') options = {};

				if (data.path.charAt(0) === '/') data.path.slice(1, data.path.length - 1);
				if (data.path.charAt(data.path.length - 1) !== '/') data.path = data.path+'/';

				options.url = '/api/v2/admin/sites/current/storage/'+data.path+'?meta';
				options.method = 'GET';
				options.headers = {Authorization: bcpie.ajax.token()};
				return bcpie.utils.ajax(options);
			}
		},
		webapp: {
			item: {
				get :function(data,options) {
					data = {
						webapp: data.webapp || null, // integer, string
						item: data.item || null // integer
					}

					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return errors;

					if (typeof options !== 'object') options = {};
					options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/items/'+data.item;
					options.headers = {Authorization: bcpie.ajax.token()};
					options.method = 'GET';
					return bcpie.utils.ajax(options);
				},
				save: function(data,options) {
					data = {
						content: data.content || null,  // $, {}
						webapp: data.webapp || null, // integer, string
						item: data.item || null // integer
					}

					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return console.log(errors);

					if (typeof options !== 'object') options = {};

					if (bcpie.ajax.token().length > 10) {
						options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/items';
						if (data.item !== null) options.url += '/'+data.item;
						options.headers = {Authorization: bcpie.ajax.token()};

						var fieldTypes = {name:'String', weight:'Number', releaseDate:'DateTime', expiryDate:'String', enabled:'Boolean', slug:'String', description:'String', roleId:'Number', submittedBy:'Number', templateId:'Number', address:'String', city:'String', state:'String', zipCode:'String', country:'String',fields:{}},
							newData = {name:'', releaseDate:moment().subtract(12,'hour').format('YYYY-MM-DD'), expiryDate:'9999-01-01', enabled:true, country:'US', fields:{}},
							allFields = {name:'', weight:0, releaseDate:moment().subtract(12,'hour').format('YYYY-MM-DD'), expiryDate:'9999-01-01', enabled:true, slug:'', description:'', roleId:null, submittedBy:-1, templateId:-1, address:'', city:'', state:'', zipCode:'', country:'',fields:{}},
							field, result, fields;

						options.data = bcpie.utils.serializeObject(data.content);
						options.processData = false;

						if (typeof bcpie.ajax.webapp.item.save[data.webapp] === 'undefined') {
							// Retrieve the custom fields list from the server
							bcpie.ajax.webapp.item.save[data.webapp] = bcpie.ajax.webapp.fields({webapp: data.webapp},{async:false});
						}


						fields = bcpie.ajax.webapp.item.save[data.webapp].responseJSON;
						if (data.item !== null) {
							options.method = 'PUT';
							delete newData.releaseDate;
						}else options.url = options.url.replace('/'+data.item,'');

						// Add custom fields to newData object
						for (var i=0; i<fields.items.length; i++) {
							if (typeof options.data[fields.items[i].name] !== 'undefined') {
								newData.fields[fields.items[i].name] = '';
								fieldTypes.fields[fields.items[i].name] = fields.items[i].type;
							}
						}

						// Fill the data object with form values
						for (var key in options.data) {
							if (typeof allFields[key] !== 'undefined') {
								if (options.data[key] !== 'undefined') {
									newData[key] = options.data[key];
									if (key === 'country' && newData[key] === ' ' ) newData[key] = '';
									if (key === 'state' && newData[key] === ' ' ) newData[key] = '';
									if (fieldTypes[key] === 'Number') {
										newData[key] = bcpie.utils.validation.number(key,newData[key]);
										if (newData[key] === NaN) delete data[key];
									}else if (fieldTypes[key] === 'Boolean') {
										newData[key] = bcpie.utils.validation.boolean(key,newData[key]);
									}else if (fieldTypes[key] === 'DateTime') {
										newData[key] = bcpie.utils.validation.dateTime(key,newData[key]);
									}
								}
							}
							else if (typeof newData.fields[key] !== 'undefined') {
								if (options.data[key] !== 'undefined') {
									newData.fields[key] = options.data[key];
									if (fieldTypes.fields[key] === 'Number' || fieldTypes.fields[key] === 'DataSource') {
										newData.fields[key] = bcpie.utils.validation.number(key,newData.fields[key]);
										if (newData.fields[key] === NaN) delete newData.fields[key];
									}else if (fieldTypes.fields[key] === 'Boolean') {
										newData.fields[key] = bcpie.utils.validation.boolean(key,newData.fields[key]);
										if (newData.fields[key] === null) delete newData.fields[key];
									}else if (fieldTypes.fields[key] === 'DateTime') {
										newData.fields[key] = bcpie.utils.validation.dateTime(key,newData.fields[key]);
										if (newData.fields[key] === null) delete newData.fields[key];
									}
								}else delete newData.fields[key];
							}
						}

						options.data = JSON.stringify(newData);
					}else {
						if (data.item === null) options.url = '/CustomContentProcess.aspx?CCID='+data.webapp+'&OTYPE=1';
						else options.url = '/CustomContentProcess.aspx?A=EditSave&CCID='+data.webapp+'&OID='+data.item+'&OTYPE=35';

						if (body.find('[name=Amount]').length > 0) options.url = bcpie.globals.secureDomain + options.url;
						if (data.content instanceof $) {
							if (data.content.is('form') || data.content.is('input,select,textarea')) options.data = data.content.serialize();
							else options.data = data.content.find('input,select,textarea').serialize();
						}else if (bcpie.utils.isElement(data.content)) {
							data.content = $(data.content);
							if (data.content.is('form') || data.content.is('input,select,textarea')) options.data = data.content.serialize();
							else options.data = data.content.find('input,select,textarea').serialize();
						}else if (typeof data.content === 'object' && data.content.constructor.toString().indexOf('Array') == -1) options.data = $.param(data.content);
						else return 'Content may not be in the correct form.';

						options.contentType = 'application/x-www-form-urlencoded';
					}
					return bcpie.utils.ajax(options);
				},
				delete: function(data,options) {
					data = {
						webapp: data.webapp || null, // integer, string
						item: data.item || null // integer
					}

					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return errors;

					if (typeof options !== 'object') options = {};

					if (bcpie.ajax.token().length > 10) {
						options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/items/'+data.item;
						options.headers = {Authorization: bcpie.ajax.token()};
						options.method = 'DELETE';
					}else {
						options.url = '/CustomContentProcess.aspx?CCID='+data.webapp+'&OID='+data.item+'&A=Delete';
						options.contentType = false;
					}
					return bcpie.utils.ajax(options);
				},
				categories: function(data,options) {
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get', 'save', delete
						webapp: data.webapp || null, // string
						item: data.item || null, // integer
						content: data.content || null  // $, {}
					}
					// Catch data errors
					var errors = bcpie.ajax.webapp.errors(data);
					if (errors.length > 0) return errors;

					if (typeof options !== 'object') options = {};

					options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/items/'+data.item+'/categories';
					options.headers = {'Authorization': bcpie.ajax.token()};

					if (data.mode === 'get') options.method = 'GET';
					else if (data.mode === 'save') {
						options.method = 'PUT';
						options.data = JSON.stringify(data.content);
						options.processData = false;
					}
					return bcpie.utils.ajax(options);
				}
			},
			detail: function(data,options) {
				data = {
					webapp: data.webapp || null
				}
				// Catch data errors
				var errors = bcpie.ajax.webapp.errors(data);
				if (errors.length > 0) return errors;

				if (typeof options !== 'object') options = {};

				options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp;
				options.headers = {'Authorization': bcpie.ajax.token()};
				options.method = 'GET';
				return bcpie.utils.ajax(options);
			},
			fields: function(data,options) {
				data = {
					webapp: data.webapp || null // string
				}
				// Catch data errors
				var errors = bcpie.ajax.webapp.errors(data);
				if (errors.length > 0) return errors;

				if (typeof options !== 'object') options = {};

				options.url = '/api/v2/admin/sites/current/webapps/'+data.webapp+'/fields';
				options.headers = {'Authorization': bcpie.ajax.token()};
				options.method = 'GET';
				return bcpie.utils.ajax(options);
			},
			search: function(data,options) {
				data = {
					webapp: data.webapp || null,
					formID: data.formID || null,
					responsePageID: data.responsePageID || null,
					content: data.content || null
				}
				// Catch data errors
				var errors = bcpie.ajax.webapp.errors(data);
				if (errors.length > 0) return errors;

				if (typeof options !== 'object') options = {};

				if (data.responsePageID !== null) data.responsePageID = '&PageID='+data.responsePageID;
				else data.responsePageID = '';
				options.url = '/Default.aspx?CCID='+data.webapp+'&FID='+data.formID+'&ExcludeBoolFalse=True'+data.responsePageID;
				options.data = $.param(data.content);
				options.contentType = false;
				var response = $(bcpie.utils.ajax(options).responseText).find('.webappsearchresults');
				return (response.children().length > 0) ? response.children() : response.html();
			},
			errors: function(data) {
				data.errors = [];
				if (typeof data.webapp !== 'undefined') {
					if (data.webapp === null) data.errors.push('"webapp" parameter cannot be null.');
					else if (data.webapp.toString().match(/\D/g) === null && bcpie.ajax.token().length > 10) data.errors.push('For API use, the "webapp" parameter should be the Web App name, not the ID.');
					else if (data.webapp.toString().match(/\D/g) !== null && bcpie.ajax.token().length < 10) data.errors.push('For non-API use, the "webapp" parameter should be the Web App ID, not the name.');
				}
				if (typeof data.item !== 'undefined') {
					if (data.item === null) {
						if (data.mode === 'get' || data.mode === 'delete' || (data.mode === 'save' && bcpie.ajax.token().length < 10)) data.errors.push('"item" parameter cannot be null.');
					}else if (data.item.toString().match(/\D/g) !== null) data.errors.push('"item" parameter must be an integer.');
				}
				if (typeof data.formID !== 'undefined') {
					if (data.formID.toString().match(/\D/g) !== null) data.errors.push('"formID" parameter must be an integer.');
				}
				if (data.mode === 'get' && bcpie.ajax.token().length < 10) data.errors.push('"get" mode is for API use only.');
				return data.errors;
			}
		},
		crm: {
			customers: {
				get: function(data,options) {
					data = {
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
						content: data.content || null
					}
					if (typeof options !== 'object') options = {};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers';
					if (data.customerID !== null) options.url += '/'+customerID;
					options.method = 'GET';
					if (data.filters !== null) options.url += bcpie.utils.filters(data.filters);
					return bcpie.utils.ajax(options);
				},
				save: function(data,options) {
					data = {
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
						content: data.content || null
					}
					if (typeof options !== 'object') options = {};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers';
					if (data.customerID !== null) options.url += '/'+customerID;
					if (bcpie.ajax.token().length > 10) {
						options.data = JSON.stringify(data.content);
						options.processData = false;
						if (data.customerID !== null) options.method = 'PUT';
						else options.method = 'POST';
					}else {
						options.url = '/MemberProcess.aspx';
						options.data = $.param(data.content);
						options.contentType = false;
					}
					return bcpie.utils.ajax(options);
				},
				delete: function(data,options) {
					data = {
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
						content: data.content || null
					}
					if (typeof options !== 'object') options = {};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers';
					if (data.customerID !== null) options.url += '/'+customerID;
					options.method = 'DELETE';
					return bcpie.utils.ajax(options);
				},
				secureZones: function(data,options) {
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get','subscribe',unsubscribe
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
						zones: data.zones || null // object
					}
					if (typeof options !== 'object') options = {};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers/'+data.customerID+'/securezones';

					if (data.mode === 'get') options.method = 'GET';
					else if (data.mode === 'subscribe') {
						options.method = 'POST';
						options.data = JSON.stringify(data);
						options.processData = false;
					}else if (data.mode === 'unsubscribe') {
						options.method = 'DELETE';
						options.url += '&items='+bcpie.utils.jsonify(data.zones);
					}
					return bcpie.utils.ajax(options);
				},
				orders: function(data,options) {
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get'
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
					}
					if (typeof options !== 'object') options = {};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers/'+data.customerID+'/orders'+bcpie.ajax.filters(data.filters);
					options.method = 'GET';
					return bcpie.utils.ajax(options);
				},
				addresses: function(data,options) {
					data = {
						mode: data.mode.toLowerCase() || 'get', // 'get'
						customerID: data.customerID || null, // integer
						filters: data.filters || null, // object
					}
					if (typeof options !== 'object') options = {};
					options.headers = {'Authorization': bcpie.ajax.token()};
					options.url = '/webresources/api/v3/sites/current/customers/'+data.customerID+'/addresses'+bcpie.ajax.filters(filters);
					options.method = 'GET';
					return bcpie.utils.ajax(options);
				}
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
		encode: function(str) {
			return encodeURIComponent(str).replace(/'/g,"%27").replace(/"/g,"%22");
		},
		decode: function(str) {
			return decodeURIComponent(str.replace(/\+/g,  " "));
		},
		guid: function() {
			function s4() {
				return Math.floor((1+Math.random()) * 0x10000).toString(16).substring(1);
			}
			return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4();
		},
		isElement: function(o){
			return (
				typeof HTMLElement === 'object' ? o instanceof HTMLElement : //DOM2
					o && typeof o === 'object' && o !== null && o.nodeType === 1 && typeof o.nodeName==='string'
			);
		},
		serializeObject: function(object) {
			var o = {};
			if (object instanceof jQuery) {
				var a = (object.is('form')) ? object.serializeArray() : $('<div/>').append(object.clone(true)).find('input,select,textarea').serializeArray();
			}else if ($.isArray(object) && typeof object[0].name !== 'undefined' && typeof object[0].value !== 'undefined') {
				var a = object;
			}else if ($.isPlainObject(object) && typeof object.name !== 'undefined' && typeof object.value !== 'undefined') {
				var a = [object];
			}else {
				console.log('Malformed object passed to bcpie.utils.serializeObject method.');
				var a = [];
			}
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
		},
		classObject: function(classes) {
			return {
				names: classes,
				selector: '.'+classes.replace(/ /g,'.')
			}
		},
		xml2json: function(xml) {
			var obj = {};

			if (xml.nodeType == 1) { // element
				// do attributes
				if (xml.attributes.length > 0) {
				obj['@attributes'] = {};
					for (var j = 0; j < xml.attributes.length; j++) {
						var attribute = xml.attributes.item(j);
						obj['@attributes'][attribute.nodeName] = attribute.nodeValue;
					}
				}
			} else if (xml.nodeType == 3) { // text
				obj = xml.nodeValue;
			}

			// do children
			if (xml.hasChildNodes()) {
				for(var i = 0; i < xml.childNodes.length; i++) {
					var item = xml.childNodes.item(i);
					var nodeName = item.nodeName;
					if (typeof(obj[nodeName]) == 'undefined') {
						obj[nodeName] = bcpie.utils.xml2json(item);
					} else {
						if (typeof(obj[nodeName].push) == 'undefined') {
							var old = obj[nodeName];
							obj[nodeName] = [];
							obj[nodeName].push(old);
						}
						obj[nodeName].push(bcpie.utils.xml2json(item));
					}
				}
			}
			return obj;
		},
		isJson: function(str) {
			try {
				JSON.parse(str);
			} catch (e) {
				return false;
			}
			return true;
		},
		makeSlug: function(string) {
			var output = '',
				valid = '-0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

			string = string.replace(/ /g, '-');

			for (var i = 0; i < string.length; i++) {
				if (valid.indexOf(string.charAt(i)) != -1) output += string.charAt(i);
			}
			return output.toLowerCase();
		},
		executeCallback: function(selector, callback, data, textStatus, xhr){
			if (typeof callback === 'function') {
				function parameter(selector, callback, data, textStatus, xhr){
					var deferred = $.Deferred();
					if (typeof data === 'undefined') deferred.resolve(callback(selector));
					else if (typeof textStatus === 'undefined') deferred.resolve(callback(selector, data));
					else if (typeof xhr === 'undefined') deferred.resolve(callback(selector, data, textStatus));
					else deferred.resolve(callback(selector, data, textStatus, xhr));

					return deferred.promise();
				}

				return $.when(parameter(selector, callback, data, textStatus, xhr));
			}
		},
		filters: function(filters) {
			var response = '?limit=';
			response += filters.limit || 500;
			response += '&skip=';
			response += filters.skip || 0;
			if (typeof filters.order !== 'undefined') response += '&order='+bcpie.utils.encode(filters.order);
			if ($.isArray(filters.fields)) response += '&fields='+bcpie.utils.encode(filters.fields.toString());
			if (typeof filters.where === 'object') response += '&where='+bcpie.utils.encode(JSON.stringify(filters.where));
			return response;
		},
		ajax: function(options) {
			var settings = options || {};
			settings.url = options.url || '';
			settings.method = options.type || options.method || 'POST';
			settings.contentType = (options.contentType !== false) ? options.contentType || 'application/json' : false;
			if (typeof settings.data === 'undefined' && typeof settings.dataType !== 'undefined') delete settings.dataType;
			else if (typeof settings.data !== 'undefined' && typeof settings.dataType === 'undefined' && bcpie.utils.isJson(settings.data)) settings.dataType = 'application/json';
			return $.ajax(settings);
		},
		validation: {
			number: function(fieldName,value) {
				if (value === '') {
					return null;
				}else if (Number(value) === NaN) {
					console.log('The value of "'+fieldName+'" is not a number.');
					return NaN;
				}else return Number(value);
			},
			boolean: function(fieldName,value) {
				if (value.toLowerCase() === 'true' || value === '1') return true;
				else if (value.toLowerCase() === 'false' || value === '0') return false;
				else return null;
			},
			dateTime: function(fieldName,value) {
				if (value.trim() === '') return null;
				else if (value.match(/([0-9]{4})-((0[1-9])|(1[0-2]))-((0[1-9])|([1-2][0-9])|(3[0-1]))T(([0-1][0-9])|(2[0-4])):([0-5][0-9]):([0-5][0-9])/)) return value;
				else {
					console.log('The value of "'+fieldName+'" is an invalid dateTime format.');
					return 'Invalid Date';
				}
			}
		}
	},
	extensions: {
		settings: function(selector,options,settings) {
			if (typeof settings.name === 'string' && settings.name.toLowerCase() !== 'engine' && settings.name.toLowerCase() !== 'settings') {
				if (typeof settings.defaults === 'undefined') settings.defaults = {};
				selector.data('bcpie-'+settings.name.toLowerCase()+'-settings', $.extend({}, settings.defaults, options, bcpie.globals));
				bcpie.active.tricks[settings.name] = settings.version;
				return selector.data('bcpie-'+settings.name.toLowerCase()+'-settings');
			}
		},
		engine: function() {
			var tricks = bcpie.extensions.tricks,trick,instances,instance,arr=[],str="",options={},module = [],functions = {},defaults = {};
			for (trick in tricks) {
				arr=[];str="";options={};module = [];functions = {};defaults = {};
				instances = $(doc).find('[data-bcpie-'+trick.toLowerCase()+']');
				for (var a = 0; a<instances.length; a++) {
					options = {};instance = $(instances[a]);
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
bcpie.globals.currentDomain = (win.location.href.indexOf(bcpie.globals.primaryDomain) > -1) ? bcpie.globals.primaryDomain : bcpie.globals.secureDomain;
// Initialize tricks
$(function() {
	bcpie.extensions.engine();
});