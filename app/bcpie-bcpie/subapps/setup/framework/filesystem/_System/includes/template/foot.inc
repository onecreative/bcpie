<script data-isloggedin="{module_isloggedin}">
	{module_pagename collection="pagename" template=""}{% assign pagename = pagename.name | escape -%}
	var globals = {{globals|json}};
		globals.pageName = '{{pagename}}';
		globals.pageAddress = '{{pageaddress}}';
		globals.primaryDomain = '{% if '{module_sitehost}' contains 'worldsecuresystems.com' %}https://{% else %}http://{% endif %}{module_sitehost}';
		globals.secureDomain = '{module_secureurl}';
</script>
<script src="/scripts/min/footScripts.min.js"></script>
<script src="/scripts/readyScripts.js"></script>