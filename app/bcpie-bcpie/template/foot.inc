{module_pageaddress collection="pageaddress" template=""}{% assign pageaddress = pageaddress.pageurl | split: globals.site.host | last -%}
{module_pagename collection="pagename" template=""}{% assign pagename = pagename.name | escape -%}
{module_defaulturl collection="defaulturl" template=""}
<script data-isloggedin="{module_isloggedin}">
	var globals = {{globals|json}};
		globals.pageName = '{{pagename}}';
		globals.pageAddress = '{{pageaddress}}';
		globals.primaryDomain = '{{defaulturl.defaulturl}}';
		globals.secureDomain = '{module_secureurl}';
</script>
<script src="{{root}}scripts/min/footScripts.min.js?24"></script>
<script src="{{appRoot}}scripts/readyScripts.js?279"></script>