{% comment -%}Page Address{% endcomment -%}
{module_pageaddress collection="pageaddress" template=""}
{% assign pageaddress = pageaddress.pageurl | replace: 'http://','' | replace: 'https://','' | replace: globals.site.host,'' | replace: '{module_secureurl}','' -%}

{% comment -%}Default URL{% endcomment -%}
{module_defaulturl collection="defaulturl" template=""}
{% assign primaryDomain = defaulturl.defaulturl -%}
{% if primaryDomain == 'http://' -%}
	{% assign primaryDomain = primaryDomain | append: '{module_sitehost}' -%}
{% endif -%}
{% assign primaryDomainNoProtocol = primaryDomain | split: '//' | last -%}

{% comment -%}Login Redirect{% endcomment -%}
{% capture loginRedirect -%}&amp;PageID={% if pageaddress contains '/ZoneProcess.aspx' -%}{{globals.get.pageid}}{% else -%}{{pageaddress | url_param_escape}}{% endif -%}{% endcapture -%}

{% comment -%}Page Name{% endcomment -%}
{module_pagename collection="pagename" template=""}
{% assign pagename = pagename.name | escape -%}

<script data-isloggedin="{module_isloggedin}">
	var globals = {{globals|json}};
		globals.pageName = '{{pagename}}';
		globals.pageAddress = '{{pageaddress}}';
		globals.primaryDomain = '{% if '{module_sitehost}' contains 'worldsecuresystems.com' -%}https://{% else -%}http://{% endif -%}{module_sitehost}';
		globals.secureDomain = '{module_secureurl}';
</script>