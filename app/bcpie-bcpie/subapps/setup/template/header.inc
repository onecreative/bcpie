<nav id="primary">
	<ul class="row">
		{% assign pages = 'Frameworks:fi-monitor:fi-iphone,Layouts:fi-flow-two-up,Themes:fi-palette,Tricks:fi-magic-wand,Fonts:fi-text,Third Party:fi-puzzle-piece,empty,Installed:fi-tag,Updates:fi-arrow-thick-bottom-fill' | split: ',' -%}
		{% for page in pages -%}
			{% if page == 'empty' -%}
				<li class="columns"></li>
			{% else -%}
				{% assign pageSplit = page | split: ':' -%}
				{% assign pageDowncased = pageSplit | first | downcase | remove: ' ' -%}
				<li class="shrink columns{% if globals.get.page == pageDowncased -%} active{% elsif globals.get.page == nil and pageDowncased == 'frameworks' -%} active{% endif -%}"><a href="{{navPath}}{{pageDowncased}}" class="{{pageDowncased}}"><icon class="{{pageSplit[1]}}">{% if pageSplit[2] -%}<icon class="{{pageSplit[2]}}"></icon>{% endif -%}</icon><span>{{pageSplit[0]}}</span></a></li>
			{% endif -%}
		{% endfor -%}
	</ul>
</nav>