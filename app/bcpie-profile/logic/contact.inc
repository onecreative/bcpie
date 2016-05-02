<fieldset data-object="contact">
	<legend>Contact</legend>
	<label>First Name</label>
	<input type="text" name="firstname" placeholder="First Name">
	<label>Last Name</label>
	<input type="text" name="lastname" placeholder="Last Name">
	<label>Position</label>
	<input type="text" name="position" placeholder="Position">
	<label>Phone</label>
	<input type="tel" name="phone" placeholder="Phone">
	<label>Email</label>
	<input type="email" name="email" placeholder="Email">
	{% include "/_System/Apps/bcpie-profile/includes/social.inc" %}
</fieldset>