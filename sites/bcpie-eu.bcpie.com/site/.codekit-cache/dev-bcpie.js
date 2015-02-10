var doc = document, body = $(doc.body), win = window,
bcpie = {
	modules: {
		functionName: function() {
			// some code
		}
	},
	formatting: {
		tel: function() {
			var input = body.find('[name=HomePhone],[name=WorkPhone],[type=tel]');
			input.mobilePhoneNumber({
				allowPhoneWithoutPrefix: '+1'
			});
			$(input).on('blur',function(){
				$(this).trigger('change');
			});
		},
		ssn: function () {
			var input = body.find('.ssn');
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
	foundation: {
		topbar: function() {
			var selector = body.find('.top-bar'),li = selector.find('li'),item,itemID;
			if (selector.length > 0) {
				for (var i=0; i<li.length; i++) {
					item = $(li[i]);
					itemID = item.id;
					item.has('ul').addClass('has-dropdown').children('ul').addClass('dropdown').removeClass('right left');
					if (item.hasClass('is-button')) {
						item.removeAttr('id').children('a').addClass('button').attr('data-reveal-id',itemID);
					}
					if (item.hasClass('is-secondary')) {
						item.children('a').addClass('secondary');
					}
				}
				selector.find('li').children('ul').removeClass('top-bar-ul');
			}
		}
	},
	fixes: {
		functionName: function() {
			// some code
		}
	},
	tweaks: {
		functionName: function() {
			// some code
		}
	}
};
// bcpie.foundation.topbar();
bcpie.formatting.tel();
bcpie.formatting.ssn();