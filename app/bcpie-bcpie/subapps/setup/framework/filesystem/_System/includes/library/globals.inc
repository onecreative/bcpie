{% comment %}Page Address{% endcomment %}
{module_pageaddress collection="pageaddress" template=""}
{% assign pageaddress = pageaddress.pageurl | replace: 'http://','' | replace: 'https://','' | replace: globals.site.host,'' -%}

{% comment %}Profile{% endcomment %}
{module_json, json="/_system/apps/bcpie-bcpie/apps/profile/shared/profile.json" collection="profile" template=""}

{% comment %}Nav{% endcomment %}
{% assign siteNav = 0 %}

{% comment %}Subscribe{% endcomment %}
{% assign subscribeList = 0 %}

{% comment %}Authorization Page{% endcomment %}
{% assign authPage = '/account/auth' %}