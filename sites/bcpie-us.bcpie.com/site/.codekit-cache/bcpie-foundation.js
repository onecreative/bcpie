bcpie.foundation = {
	topbar: function() {
		var topbar = body.find('.top-bar');
		if (topbar.length > 0) {
			topbar.find('.has-dropdown').filter(function(){
				return $(this).children('.dropdown').length === 0;
			}).removeClass('has-dropdown');
		}
	}
};

bcpie.foundation.topbar();