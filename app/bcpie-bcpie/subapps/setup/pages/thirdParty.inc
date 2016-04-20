<div id="thirdParty">
	<section class="gridview">
		<div class="row small-up-1 medium-up-4 large-up-5 align-top">
			{% assign _utilityPackages = packages.thirdParty -%}
			{% assign _utilitySingular = 'thirdParty' -%}
			{% assign _utilityFolder = 'thirdParty' -%}
			{% include '{{appRoot}}logic/utilities/gridView.inc' -%}
		</div>
	</section>
</div>