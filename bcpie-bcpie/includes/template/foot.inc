<script data-isloggedin="{module_isloggedin}">
	{module_pageaddress collection="pageaddress" template=""}{% assign pageaddress = pageaddress.pageurl | replace: 'http://','' | replace: 'https://','' | replace: globals.site.host,'' %}
	var globals = {{globals|json}};
		globals.pageName = '{module_pagename}';
		globals.pageAddress = '{{pageaddress}}';
		globals.primaryDomain = '{% if '{module_sitehost}' contains 'worldsecuresystems.com' %}https://{% else %}http://{% endif %}{module_sitehost}';
		globals.secureDomain = '{module_secureurl}';
</script>
<script src="/_system/apps/bcpie-evan/scripts/min/footScripts.min.js"></script>
<script src="/_system/apps/bcpie-evan/scripts/readyScripts.js"></script>