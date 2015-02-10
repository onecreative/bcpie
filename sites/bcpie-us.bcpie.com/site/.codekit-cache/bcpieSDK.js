var doc = document,
	body = $(doc.body),
	win = window;

$.fn.serializeObject = function() {
	var o = {};
	var a = this.serializeArray();
	$.each(a, function() {
		if (o[this.name] !== undefined) {
			if (!o[this.name].push) o[this.name] = [o[this.name]];
			o[this.name].push(this.value || '');
		}
		else o[this.name] = this.value || '';
	});
	return o;
};

var bcpie = {
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
						headers: {Authorization: bc.api.token()},
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
					headers: {Authorization: bc.api.token()},
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
					headers: {Authorization: bc.api.token()}
				});
			}
		},
		webapp : {
			item: {
				get: function(webapp,item) {
					return $.ajax({
							url: '/api/v2/admin/sites/current/webapps/'+webapp+'/items/'+item,
							headers: {'Authorization': bc.api.token()},
							contentType: 'application/json',
							async: false
						}).responseJSON;
				},
				place: function(scope,webapp,item,callback) {
					var data = bc.api.webapp.item.get(webapp,item),field,element;
					bc.api.data.place(scope,data);
					bc.api.data.place(scope,data.fields);
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
						headers: {'Authorization': bc.api.token()}
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
							headers: {'Authorization': bc.api.token()},
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
						headers: {'Authorization': bc.api.token()}
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
			if (bc.utils._jsonify_brace.test(str) === false) str = '{'+str+'}';

			// Retrieve token and convert to JSON
			return str.replace(bc.utils._jsonify_token, function (a) {
				a = $.trim(a);
				// Keep some special strings as they are
				if ('' === a || 'true' === a || 'false' === a || 'null' === a || (!isNaN(parseFloat(a)) && isFinite(a))) return a;
				// For string literal: 1. remove quotes at the top end; 2. escape double quotes in the middle; 3. wrap token with double quotes
				else return '"'+ a.replace(bc.utils._jsonify_quote, '$1').replace(bc.utils._jsonify_escap, '\\$1')+ '"';
			});
		},
		guid: function() {
			function s4() {
				return Math.floor((1+Math.random()) * 0x10000).toString(16).substring(1);
			}
			return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4();
		},
		tel: function() {
			var input = body.find('[type=tel]');
			for (var i=0; i<input.length; i++) {
				$(input[i]).mobilePhoneNumber({
					allowPhoneWithoutPrefix: '+1'
				});
				$(input).on('blur',function(){
					$(this).trigger('change');
				});
			}
		},
		ssn: function () {
			var input = body.find('.ssn');
			if (input.length > 0) {
				input.on('keyup', function () {
					var val = $(this).val().replace(/\D/g, '');
					var newVal = '';
					if (val.length > 4)
						$(this).val(val);

					if ((val.length > 3) && (val.length < 6)) {
						newVal += val.substr(0, 3) + '-';
						val = val.substr(3);
					}
					if (val.length > 5) {
						newVal += val.substr(0, 3) + '-';
						newVal += val.substr(3, 2) + '-';
						val = val.substr(5);
					}
					newVal += val;
					$(this).val(newVal.substr(0, 11));
				});
			}
		},
		theme: function() {
			if (typeof body.data('bcpie') !== 'undefined' && body.data('bcpie') == 'theme') {
				$('link').filter(function(){
					return $(this).attr('href').toLowerCase().indexOf('.css') > -1;
				}).not(function(){
					return $(this).attr('href').toLowerCase().indexOf('modulestylesheets.css') > -1 || $(this).attr('href').toLowerCase().indexOf('theme.css') > -1;
				}).remove();
			}
		}
	},
};
bcpie.utils.tel();
bcpie.utils.ssn();
bcpie.utils.theme();