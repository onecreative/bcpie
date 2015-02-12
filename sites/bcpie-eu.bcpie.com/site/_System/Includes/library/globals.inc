{% comment %}Page Address{% endcomment %}
{module_pageaddress collection="pageaddress" template=""}
{% assign pageaddress = pageaddress.pageurl | replace: 'http://','' | replace: 'https://','' | replace: globals.site.host,'' | replace: '{module_secureurl}','' %}
{% comment %}Profile{% endcomment %}
{module_json, json="/_system/shared/bcpie-profile/profile.json" collection="profile" template=""}