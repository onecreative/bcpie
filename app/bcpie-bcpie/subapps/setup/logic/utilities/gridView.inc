{% comment -%}
	{% assign _utilityPackages = packages.frameworks -%}
	{% assign _utilitySingular = 'framework' -%}
	{% assign _utilityFolder = 'frameworks' -%}
	{% include '{{appRoot}}/logic/utilities/gridView.inc' -%}
{% endcomment -%}
{% comment -%}Grid View{% endcomment -%}
<div class="column">
	<figure data-type="{{_utilityFolder}}" data-id="new" class="mui-enter scale-in-up bounce-in">
		<img src="{{appRoot}}images/new-{{_utilitySingular}}.svg" alt="Add your own" width="225px">
		<figcaption>Upload your own<br><small></small></figcaption>
	</figure>
</div>
{% for package in _utilityPackages.items -%}
	{% if _utilityPackages.active contains package.id -%}{% assign isActive = true -%}
	{% else -%}{% assign isActive = false -%}
	{% endif -%}
	{% assign figureClass = '' -%}
	{% capture requirements -%}
		{% if package.requires[0] -%}
			{% for requirement in package.requires -%}
				{% if packages[requirement.type].indexes[requirement.id] -%}
					{% assign badgeClass = 'success fi-check-thin' -%}
					{% assign figureClass = '' -%}
				{% else -%}
					{% assign badgeClass = 'alert fi-x-thin' -%}
					{% assign figureClass = 'inactive' -%}
				{% endif -%}
				<icon class="badge {{badgeClass}}"></icon> {{requirement.id}}{% unless forloop.last -%}<br>{% endunless -%}
			{% endfor -%}
		{% else -%}N/A
		{% endif -%}
	{% endcapture -%}
	<div class="column">
		<figure data-type="{{_utilityFolder}}" data-id="{{package.id}}" class="{{figureClass}} mui-enter scale-in-up bounce-in{% if isActive == true -%} active{% endif -%}">
			<icon class="info badge fi-info" data-toggle="dropdown-{{package.id}}"></icon>
			<img src="{{appRoot}}{% if package.image == '' -%}images/no-image.svg{% elsif package.image == nil or package.image == null or package.image == '' -%}images/no-{{_utilitySingular}}-image.svg{% else -%}packages/{{_utilityFolder}}/{{package.id}}/images/{{package.image}}{% endif -%}" alt="{{package.name}}" width="225px" height="186px">
			<figcaption>{{package.name}}<small class="fi-circle-check"></small></figcaption>
		</figure>
		<div class="dropdown-pane" id="dropdown-{{package.id}}" data-dropdown data-hover="true" data-hover-pane="true">
			<dl>
				<dt>Version</dt><dd>{{package.packageVersion}}</dd>
				<dt>Description</dt><dd>{{package.description}}</dd>
				<dt>Docs</dt><dd><a href="{{package.docs}}" target="_blank">{{package.docs}}</a></dd>
				<dt>Requires</dt>
				<dd>{{requirements}}</dd>
			</dl>
		</div>
	</div>
{% endfor -%}