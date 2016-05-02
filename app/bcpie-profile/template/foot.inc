<script data-isloggedin="{module_isloggedin}">
	{module_pageaddress collection="pageaddress" template=""}{% assign pageaddress = pageaddress | replace: 'http://','' | replace: 'https://','' | replace: globals.site.host,'' -%}
	{module_pagename collection="pagename" template=""}{% assign pagename = pagename.name | escape -%}
	{module_defaulturl collection="defaulturl" template=""}
	var globals = {{globals|json}};
		globals.pageName = '{{pagename}}';
		globals.pageAddress = '{{pageaddress}}';
		globals.primaryDomain = '{{defaulturl.defaulturl}}';
		globals.secureDomain = '{module_secureurl}';
</script>
<script src="{{appRoot}}scripts/min/footScripts.min.js"></script>
<script src="{{appRoot}}scripts/readyScripts.js"></script>