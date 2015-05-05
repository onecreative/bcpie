<header id="pageheader" role="banner">
	<div class="row">
		<div class="small-6 columns">
			<div class="left"><a href="{{path}}index.html?page=help">Help</a></div>
		</div>
	</div>
</header>
<main id="pagecontent" role="main">
	<div class="row">
		<div class="small-6 end columns">
			<form>
				<label>Company</label>
				<input type="text" name="name" placeholder="Company" value="{{profile.name}}">
				<label>Brand</label>
				<input type="text" name="brand" placeholder="Brand" value="{{profile.brand}}">
				<label>Slogan</label>
				<input type="text" name="slogan" placeholder="Slogan" value="{{profile.slogan}}">
				<fieldset data-object="address">
					<legend>Address</legend>
					<label>Location Name</label>
					<input type="text" name="name" placeholder="Location Name" value="{{profile.address.name}}">
					<label>Address</label>
					<input type="text" name="line1" placeholder="Address" value="{{profile.address.line1}}">
					<label>Line 2</label>
					<input type="text" name="line2" placeholder="Line 2" value="{{profile.address.line2}}">
					<label>Line 3</label>
					<input type="text" name="line3" placeholder="Line 3" value="{{profile.address.line3}}">
					<label>City</label>
					<input type="text" name="city" placeholder="City" value="{{profile.address.city}}">
					<label>State</label>
					<input type="text" name="state" placeholder="State" value="{{profile.address.state}}">
					<label>Zip Code</label>
					<input type="text" name="zipcode" placeholder="Zip Code" value="{{profile.address.zipcode}}">
					<label>Country</label>
					<input type="text" name="country" placeholder="Country" value="{{profile.address.country}}">
				</fieldset>
				<fieldset data-object="social">
					<legend>Social</legend>
					<label>Facebook</label>
					<input type="text" name="facebook" placeholder="Facebook" value="{{profile.social.facebook}}">
					<label>LinkedIn</label>
					<input type="text" name="linkedin" placeholder="LinkedIn" value="{{profile.social.linkedin}}">
					<label>Google+</label>
					<input type="text" name="googleplus" placeholder="Google+" value="{{profile.social.googleplus}}">
					<label>Twitter</label>
					<input type="text" name="twitter" placeholder="Twitter" value="{{profile.social.twitter}}">
				</fieldset>
				<fieldset data-object="contact">
					<legend>Contact</legend>
					<label>First Name</label>
					<input type="text" name="firstname" placeholder="First Name" value="{{profile.contact.firstname}}">
					<label>Last Name</label>
					<input type="text" name="lastname" placeholder="Last Name" value="{{profile.contact.lastname}}">
					<label>Position</label>
					<input type="text" name="position" placeholder="Position" value="{{profile.contact.position}}">
					<label>Phone</label>
					<input type="tel" name="phone" placeholder="Phone" value="{{profile.contact.phone}}">
					<label>Email</label>
					<input type="email" name="email" placeholder="Email" value="{{profile.contact.email}}">
					<label>Facebook</label>
					<input type="text" name="facebook" placeholder="Facebook" value="{{profile.contact.facebook}}">
					<label>LinkedIn</label>
					<input type="text" name="linkedin" placeholder="LinkedIn" value="{{profile.contact.linkedin}}">
					<label>Google+</label>
					<input type="text" name="googleplus" placeholder="Google+" value="{{profile.contact.googleplus}}">
					<label>Twitter</label>
					<input type="text" name="twitter" placeholder="Twitter" value="{{profile.contact.twitter}}">
				</fieldset>
				<input type="submit" value="Save" class="button">
			</form>
		</div>
	</div>
</main>