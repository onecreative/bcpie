<div class="row">
	<div class="medium-7 medium-push-5 columns">
		<form data-bcpie-formmagic="validateMode:inline; useAjax:true;" method="post" action="/CampaignProcess.aspx?ListID=53810&amp;OPTIN=true&amp;PageID=/responses/subscribe.tpl">
			<label>Stay current with {{profile.name}}</label>
			<div class="row collapse">
				<div class="medium-4 columns"><input placeholder="Full Name" type="text" name="FullName" /></div>
				<div class="medium-4 columns"><input placeholder="name@domain.com" type="email" name="EmailAddress" /></div>
				<div class="medium-4 columns"><input class="button postfix" type="submit" value="Sign up!" /></div>
			</div>
		</form>
	</div>
	<div class="medium-5 medium-pull-7 columns">
		<div class="footerlinks">
			<ul class="inline-list">
				<li>&copy;<span data-bcpie-date="ref:now; format:YYYY"></span> {{profile.name}}.&nbsp;<a href="/privacy">Read our Privacy Policy</a></li>
			</ul>
		</div>
	</div>
</div>