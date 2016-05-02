/* The code for this app */
$(function () {
	var appScripts = {
		alertSettings: function() {
			 alertify.set('notifier','position', 'top-right');
		},
		saveData: function() {
			var form = body.find('form'),
				data = {};

			form.on('submit', function(event) {
				event.preventDefault();

				groups = bcpie.utils.closestChildren(form,'[name],[data-object]', true);
				data = bcpie.utils.serializeObject(groups.filter('[name]'));
				data = groupLoop(data,groups.filter('[data-object]'));
				bcpie.ajax.file.save({
					path: '_system/apps/bcpie-profile/scripts/profile.json',
					content: data
				});
				bcpie.ajax.file.save({
					path: '_system/apps/bcpie-profile/public/profile.json',
					content: data
				});
				alertify.success('Save Successful');

				function groupLoop(object,groups) {
					var subgroups;
					for (var i=0; i<groups.length; i++) {
						group = $(groups[i]);
						if (group.data('object') !== '') {
							subgroups = bcpie.utils.closestChildren(group,'[name],[data-object]', true);
							object[group.data('object')] = bcpie.utils.serializeObject(subgroups.filter('[name]'));
							if (subgroups.filter('[data-object]').length > 0) {
								if (typeof object[group.data('object')] === 'undefined') object[group.data('object')] = {};
								object[group.data('object')] = groupLoop(object[group.data('object')],subgroups.filter('[data-object]'));
							}
						}
					}
					return object;
				}
			});


		}
	};
	// Call functions here
	appScripts.alertSettings();
	appScripts.saveData();
});