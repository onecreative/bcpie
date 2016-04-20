<div id="frameworks">
	<section class="gridview">
		<div class="row small-up-1 medium-up-4 large-up-5 align-top">
			{% assign _utilityPackages = packages.frameworks -%}
			{% assign _utilitySingular = 'framework' -%}
			{% assign _utilityFolder = 'frameworks' -%}
			{% include '{{appRoot}}logic/utilities/gridView.inc' -%}
		</div>
	</section>
</div>