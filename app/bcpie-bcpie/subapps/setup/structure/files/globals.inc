{module_pageaddress collection="pageaddress" template=""}{% assign pageaddress = pageaddress.pageurl | split: globals.site.host | last -%}
{module_pagename collection="pagename" template=""}{% assign pagename = pagename.name | escape -%}
{module_defaulturl collection="defaulturl" template=""}
{module_json, json="/_system/apps/bcpie-profile/public/profile.json" collection="profile" template=""}
<script data-isloggedin="{module_isloggedin}">
	var globals = {{globals|json}};
		globals.pageName = '{{pagename}}';
		globals.pageAddress = '{{pageaddress}}';
		globals.primaryDomain = '{{defaulturl.defaulturl}}';
		globals.secureDomain = '{module_secureurl}';
</script>