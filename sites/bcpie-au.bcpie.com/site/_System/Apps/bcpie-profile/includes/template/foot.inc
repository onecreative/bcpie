<script>
	var globals = {{globals|json}};
		globals.pageName = '{module_pagename}';
		globals.pageAddress = '{{pageaddress}}';
		globals.primaryDomain = 'http://{module_sitehost}';
		globals.secureDomain = '{module_secureurl}';
	var profile = {{profile|json}};
</script>
<script src="/_System/apps/bcpie-profile/scripts/min/appFoot.min.js"></script>
<script src="/_System/apps/bcpie-profile/scripts/appScripts.js"></script>