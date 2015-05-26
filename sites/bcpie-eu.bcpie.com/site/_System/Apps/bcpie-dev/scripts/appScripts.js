var doc = document, body = $(doc.body), win = window;

$(function() {
	var appScripts = {
		formCleaner: function() {
			var settings = body.find('#settings').find('input,select'),
				dropoff = body.find('[name="RawFormElements"]'),
				pickup = body.find('[name="ProcessedFormElements"]'),
				label,control,checkbox;

			function showInlineLabel(){
				if(settings.filter('[name="Markup"]').val() !== 'None' && settings.filter('[name="Labels"]').is(':checked')){
					body.find('.inline-labels-group').removeClass('hide');
				}else body.find('.inline-labels-group').addClass('hide').find('[name="InlineLabels"]').prop('checked', false);
			}
			function looks_like_html(source) {
				var trimmed = source.replace(/^[ \t\n\r]+/, '');
				var comment_mark = '<' + '!-' + '-';
				return (trimmed && (trimmed.substring(0, 1) === '<' && trimmed.substring(0, 4) !== comment_mark));
			}
			function indentForm(source){
				var output ="", opts = {
					"indent_size": "1",
					"indent_char": "	",
					"max_preserve_newlines": "1",
					"preserve_newlines": false,
					"keep_array_indentation": false,
					"break_chained_methods": false,
					"indent_scripts": "normal",
					"brace_style": "collapse",
					"space_before_conditional": true,
					"unescape_strings": false,
					"jslint_happy": false,
					"end_with_newline": false,
					"wrap_line_length": "0"
				};
				if (looks_like_html(source)) output = html_beautify(source, opts);
				else output = js_beautify(source, opts);
				return output;
			}
			function cleanForm() {
				var form = ($(dropoff.val()).is('form')) ? $(dropoff.val()).clone() : $(dropoff.val()).find('form').clone();
				form = form.filter('form');

				if(form.length > 0) {
					//basic clean
					form.removeAttr('name class id').find('input,select,textarea,option,label').removeAttr('class id maxlength autocomplete selected checked cols rows onkeydown onkeyup style onfocus readonly');
					form.find('[for="SZUsername"]').attr('for','Username');
					form.find('[for="SZPassword"]').attr('for','Password');
					form.find('[for="CLFullName"]').attr('for','FullName');
					form.find('[for="CLEmailAddress"]').attr('for','EmailAddress');
					form.find('span,br').remove();
					form.find('div').children().unwrap();
					form.find('table').children().unwrap();
					form.find('tbody').children().unwrap();
					form.find('tr').children().unwrap();
					form.find('td').children().unwrap();
					form.find('[name*="Email"]').prop('type','email');
					form.find('[name*="Phone"],[name*="Fax"]').prop('type','tel');
					form.find('[name*="DOB"],[name*="Anniversary"]').prop('type','date');
					form.find('script').removeAttr('type');
					form.attr('action',form.attr('action').replace(/https:\/\/.*?\//g, '{module_secureurl}/').replace(/http:\/\/.*?\//g, "/"));
					if (form.find('[name="PaymentMethodType"]').length === 1) form.find('[name="PaymentMethodType"]').attr('type','hidden').removeAttr('style');
					form.find('label').filter(function() {
						return $(this).text().indexOf('Payment Method') > -1;
					}).attr('for','PaymentMethodType');
					form.find('[name="Amount"]').prop('readonly',true);

					//frameworks
					if (settings.filter('[name="Markup"]').val() === 'Foundation') {
						form.find('[type=submit]').addClass('button');

						if (settings.filter('[name="InlineLabels"]').is(':checked')) {
							for (var i=0; i<form.find('label').length; i++) {
								label = $(form.find('label')[i]);
								control = form.find('[name="'+label.attr('for')+'"]');
								if (typeof label.attr('for') === 'string' && control.length > 0) {
									label.after(control);
									label.add(control).wrapAll('<div class="row"></div>');
									label.addClass('inline right').wrap('<div class="medium-3 columns"></div>');
									control.wrapAll('<div class="medium-9 columns"></div>');
								}
							}
						}
					}else if (settings.filter('[name="Markup"]').val() === 'Bootstrap2') {
						form.find('[type=submit]').addClass('btn');
						for (var i=0; i<form.find('label').length; i++) {
							label = $(form.find('label')[i]);
							control = form.find('[name="'+label.attr('for')+'"]');
							if (typeof label.attr('for') === 'string' && control.length > 0) {
								if (control.is('[type=checkbox]')) label.addClass('checkbox');
								else if (control.is('[type=radio]')) label.addClass('radio');
								if (settings.filter('[name="InlineLabels"]').is(':checked')) {
									form.addClass('form-horizontal');
									label.after(control);
									label.add(control).wrapAll('<div class="control-group"></div>');
									label.addClass('control-label');
									control.wrap('<div class="controls"></div>');
								}
							}
						}
					}else if (settings.filter('[name="Markup"]').val() === 'Bootstrap3') {
						form.find('[type=submit]').addClass('btn btn-default');
						for (var i=0; i<form.find('label').length; i++) {
							label = $(form.find('label')[i]);
							control = form.find('[name="'+label.attr('for')+'"]');
							if (typeof label.attr('for') === 'string' && control.length > 0) {
								if (control.is('[type=checkbox]')) label.wrap('<div class="checkbox"></div>');
								else if (control.is('[type=radio]')) label.wrap('<div class="radio"></div>');
								label.after(control);
								label.add(control).wrapAll('<div class="form-group"></div>');
								control.addClass('form-control');
								if (settings.filter('[name="InlineLabels"]').is(':checked')) {
									form.addClass('form-horizontal');
									label.addClass('col-md-3 control-label');
									control.wrap('<div class="col-md-9"></div>');

								}
							}
						}
					}
					//placeholders
					if (settings.filter('[name="Placeholders"]').is(':checked')) {
						for (var i=0; i<form.find('label').length; i++) {
							form.find('[name="'+$(form.find('label')[i]).attr('for')+'"]').prop('placeholder',$.trim($(form.find('label')[i]).text()));
						}
					}
					//labels
					if (!settings.filter('[name="Labels"]').is(':checked')) {
						form.find('label').remove();
					}
					//FormMagic
					if (settings.filter('[name="FormMagic"]').is(':checked')) {
						form.attr('data-bcpie-formmagic','true').removeAttr('onsubmit').find('script').remove();
						form.find('[name*="Country"]').attr('data-bcpie-utility','getList:countries;').find('option').not('[value=" "]').remove();
						form.find('[name=CardExpiryYear]').empty().append('<option value=" ">YYYY</option><option data-bcpie-date="ref:now;"></option><option data-bcpie-date="ref:now; add:years:1"></option><option data-bcpie-date="ref:now; add:years:2"></option><option data-bcpie-date="ref:now; add:years:3"></option><option data-bcpie-date="ref:now; add:years:4"></option><option data-bcpie-date="ref:now; add:years:5"></option><option data-bcpie-date="ref:now; add:years:6"></option><option data-bcpie-date="ref:now; add:years:7"></option><option data-bcpie-date="ref:now; add:years:8"></option>');
						form.find('[type=date]').attr('data-bcpie-date','format:DD-MMM-YYYY; event:change;');
					}

					//convert to string for remaining work
					form = $('<div />').append(form).html().replace(/\s{2,}/g, " ").replace(/\s</g,'<').replace('Required','').replace(/>\s{1,}</g, "><").replace(/•/g, '').replace(/\&nbsp\;/g, '').replace(/> </g, '><').replace(/\*/g, '');

					/*format it on this line*/
					pickup.text(indentForm(form));
				}
			}

			showInlineLabel();
			cleanForm();

			dropoff.on('keyup', function() {
				cleanForm();
			});
			settings.on('change', function() {
				showInlineLabel();
				cleanForm();
			});
			pickup.on('click', function() {
				$(this).select();
			});
		}
	};
	appScripts.formCleaner();
});