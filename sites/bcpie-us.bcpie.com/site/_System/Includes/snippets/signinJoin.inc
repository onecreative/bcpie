<div class="row">
	<div class="medium-6 columns">
		<fieldset>
			<legend>Sign In</legend>
			<form data-bcpie-formmagic="validateMode:inline;" method="post" action="{module_secureurl}/ZoneProcess.aspx?ZoneID=51&Referrer={module_siteUrl,true,true}&OID={module_oid}&OTYPE={module_otype}&amp;PageID={% if pageaddress == '/signin' %}/account/profile{% else %}{{pageaddress}}{% endif %}">
				<label>Email</label>
				<input placeholder="Email" type="text" name="Username" class="required" />
				<label>Password</label>
				<input placeholder="Password" type="password" name="Password" class="required" />
				<label><input type="checkbox" name="RememberMe" />&nbsp;Remember Me</label>
				<input type="submit" value="Log in" class="button" />&nbsp;<a href="/_System/SystemPages/PasswordRetrieveRequest">Lost password?</a>
			</form>
		</fieldset>
	</div>
	<div class="medium-6 columns">
		<fieldset>
			<legend>Join</legend>
			<form data-bcpie-formmagic="validateMode:inline;" method="post" enctype="multipart/form-data" action="{module_secureurl}/FormProcessv2.aspx?WebFormID=310361&OID={module_oid}&OTYPE={module_otype}&EID={module_eid}&CID={module_cid}&CC={module_urlcountrycode}&Referrer={module_siteurl,true,true}&amp;PageID={% if pageaddress == '/signin' %}/account/profile{% else %}{{pageaddress}}{% endif %}">
				<label>First Name</label>
				<input placeholder="First Name" type="text" name="FirstName" class="required" />
				<label>Last Name</label>
				<input placeholder="Last Name" type="text" name="LastName" class="required" />
				<label>Email</label>
				<input placeholder="Email" type="email" name="EmailAddress" class="required" />
				<input type="hidden" type="text" name="Username" data-bcpie-sameas="copy:EmailAddress" />
				<label>Password</label>
				<input placeholder="Password" type="password" name="Password" class="required" />
				<label>Confirm Password</label>
				<input placeholder="Confirm Password" type="password" name="PasswordConfirm" class="required" />
				{module_ccsecurity}
				<input type="submit" value="Create" class="button" />
			</form>
		</fieldset>
	</div>
</div>