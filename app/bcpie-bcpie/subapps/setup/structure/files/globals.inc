{module_pageaddress collection="pageaddress" template=""}{% assign pageaddress = pageaddress.pageurl | split: globals.site.host | last -%}
{module_pagename collection="pagename" template=""}{% assign pagename = pagename.name | escape -%}
{% assign primaryDomain = '{module_defaulturl}' -%}{% if primaryDomain == 'https://' or primaryDomain == 'http://' -%}{% assign primaryDomain = '{module_sitehost}' -%}{% endif -%}
{module_json, json="/_system/apps/bcpie-profile/public/profile.json" collection="profile" template=""}
<script data-isloggedin="{module_isloggedin}">
	var globals = {{globals | json}};
		globals.pageName = {{pagename | json}};
		globals.pageAddress = {{pageaddress | json}};
		globals.primaryDomain = {{primaryDomain | prepend: 'http://' | json}};
		globals.secureDomain = '{module_secureurl}';
</script>
