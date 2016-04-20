{% assign fileRows = '' -%}
{% capture fileRows -%}
	{{fileRows}}
	{% for item in core.files -%}
		<tr id="item{{forloop.index0}}" class="filerow" data-filename="{{item.filename}}" data-bcpie-trigger="trigger:.enable a; scope:#item{{forloop.index0}}; toggle:true; offClass:disabled;{% if item.status == 'enabled' %} state:on;{% endif %}"><td>{{item.type}}</td><td><a href="{{item.docs}}" target="blank">{{item.name}}</a></td><td>{{item.version}}</td><td>{{item.filename}}</td><td>{{item.location}}</td><td class="enable"><a href="javascript:void(0)" data-bcpie-trigger="toggle:true; offValue:disabled; onValue:enabled;{% if item.status == 'enabled' %} state:on;{% endif %}">{{item.status}}</a></td><td><i>{{item.requires | join: ', '}}</i></td></tr>
	{% endfor -%}
{% endcapture -%}