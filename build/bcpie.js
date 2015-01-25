var doc = document,body = $(doc.body),win = window,bcpie={};
bcpie = {
	versions: {
		bcpieSDK: '2015.01.25'
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
				for (key in data) {
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
						for (key in formData) {
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
		}
	},
	trick: function(trick) {
		var obj,str,userDefined,arr,defaults,settings;
		obj = $(doc).find('[data-bcpie-'+trick.toLowerCase()+']');
		if (obj.length > 0){
			for (var a = 0; a<obj.length; a++) {
				userDefined = {},obj.cur = $(obj[a]);
				str = obj.cur.data('bcpie-'+trick.toLowerCase());
				if ($.type(str) === 'string' && str.indexOf(':') > -1) {
					if (str.indexOf(';') > -1) {
						str = str.split(';');
						for (var e=0;e<str.length;e++){
							arr = str[e].split(':');
							userDefined[$.trim(arr[0])] = GetOptionValue($.trim(arr.slice(1).join(':')));
						}
					}else {
						arr = str.split(':');
						userDefined[$.trim(arr[0])] = GetOptionValue($.trim(arr.slice(1).join(':')));
					}
				}
				defaults = {}; // Reset defaults before each instance of a trick is called.
				functions[trick](obj.cur,settings);
			}
		}
		function GetOptionValue(valstr){
			switch(valstr.toLowerCase()){
				case 'true': return true;
				case 'false': return false;
				default: return valstr;
			}
		}
	}
};
function theme(selector,settings) {
	defaults = {};
	selector.data(bc.settingsAttr, $.extend({}, defaults, settings));
	var settings = selector.data(bc.settingsAttr);

	$('link').filter(function(){
		return $(this).attr('href').toLowerCase().indexOf('.css') > -1;
	}).not(function(){
		return $(this).attr('href').toLowerCase().indexOf('modulestylesheets.css') > -1 || $(this).attr('href').toLowerCase().indexOf('theme.css') > -1;
	}).remove();
}
bcpie.versions.theme = '2015.01.25';
bcpie.trick('theme');