<div id="tricks">
	<section class="gridview">
		<div class="row small-up-1 medium-up-4 large-up-5 align-top">
			{% assign _utilityPackages = packages.tricks -%}
			{% assign _utilitySingular = 'trick' -%}
			{% assign _utilityFolder = 'tricks' -%}
			{% include '{{appRoot}}logic/utilities/gridView.inc' -%}
		</div>
	</section>
</div>