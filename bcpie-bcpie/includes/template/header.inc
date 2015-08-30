{% assign pages = globals.get.page | split: '/' %}
{% assign firstPage = pages | first %}
{% assign lastPage = pages | last %}
<ul class="iconbar">
	<li class="{% unless globals.get.page %}active {% endunless %}dashboard-tab"><a href="{{path}}" class="fi-dashboard iconic-md">Dashboard</a></li>
	<li class="{% if firstPage == 'courses' %}active {% endif %}courses-tab"><a href="{{path}}?page=courses" class="fi-book iconic-md">Courses</a></li>
	<li class="{% if firstPage == 'tags' %}active {% endif %}tags-tab"><a href="{{path}}?page=tags" class="fi-bookmark iconic-md">Tags</a></li>
	<li class="{% if firstPage == 'profiles' %}active {% endif %}profiles-tab"><a href="{{path}}?page=profiles" class="fi-person-genderless iconic-md">Profiles</a></li>
	<li class="{% if firstPage == 'roles' %}active {% endif %}roles-tab"><a href="{{path}}?page=roles" class="fi-connections iconic-md">Roles</a></li>
	<li class="{% if firstPage == 'financial' %}active {% endif %}financial-tab"><a href="{{path}}?page=financial" class="fi-calculator iconic-md">Financial</a></li>
	<li class="{% if firstPage == 'settings' %}active {% endif %}settings-tab"><a href="{{path}}?page=settings" class="fi-cog iconic-md">Settings</a></li>
</ul>

{% if globals.get.page %}
	{% if lastPage == 'tag' %}
		{module_webapps id="EVAN-Tags" filter="item" itemid="{{globals.get.itemid}}" collection="tag" template=""}
		{% assign tag = tag.items[0] %}
	{% elsif lastPage == 'course' %}
		{module_webapps id="EVAN-Courses" filter="item" itemid="{{globals.get.itemid}}" collection="course" template=""}
		{% assign course = course.items[0] %}
	{% elsif lastPage == 'classroom' %}
		{module_webapps id="EVAN-Classrooms" filter="item" itemid="{{globals.get.itemid}}" collection="classrooms" template=""}
		{% assign classroom = classrooms.items[0] %}
		{module_webapps id="EVAN-Courses" filter="item" itemid="{{classroom.course_id}}" collection="course" template=""}
		{% assign course = course.items[0] %}
	{% elsif lastPage == 'session' %}
		{module_webapps id="EVAN-Sessions" filter="item" itemid="{{globals.get.itemid}}" collection="session" template=""}
		{% assign session = session.items[0] %}
		{module_webapps id="EVAN-Classrooms" filter="item" itemid="{{session.classroom_id}}" collection="classrooms" template=""}
		{% assign classroom = classrooms.items[0] %}
		{module_webapps id="EVAN-Courses" filter="item" itemid="{{classroom.course_id}}" collection="course" template=""}
		{% assign course = course.items[0] %}
	{% elsif lastPage == 'profile' %}
		{module_webapps id="EVAN-Profiles" filter="item" itemid="{{globals.get.itemid}}" collection="profile" template=""}
		{% assign profile = profile.items[0] %}
	{% elsif lastPage == 'role' %}
		{module_webapps id="EVAN-Roles" filter="item" itemid="{{globals.get.itemid}}" collection="role" template=""}
		{% assign role = role.items[0] %}
	{% elsif lastPage == 'contributor' %}
		{module_webapps id="EVAN-Contributors" filter="item" itemid="{{globals.get.itemid}}" collection="contributor" template=""}
		{% assign contributor = contributor.items[0] %}
		{module_webapps id="EVAN-Roles" filter="item" itemid="{{contributor.role_id}}" collection="role" template=""}
		{% assign role = role.items[0] %}
		{module_webapps id="EVAN-Profiles" filter="item" itemid="{{contributor.profile_id}}" collection="profile" template=""}
		{% assign profile = profile.items[0] %}
	{% endif %}

	{% unless pages.size == 1 %}
		<ul class="breadcrumbs">
			{% for page in pages %}
				{% if forloop.first %}
					{% assign breadcrumb = '?page=' | append: page %}
				{% else %}
					{% assign breadcrumb = breadcrumb | append: '/' | append: page %}
				{% endif %}
				{% if page == 'tag' %}
					{% assign crumbName = tag.name %}
					{% assign crumbURL = breadcrumb | append: '&itemid=' | append: tag.itemid %}
				{% elsif page == 'course' %}
					{% assign crumbName = course.name %}
					{% assign crumbURL = breadcrumb | append: '&itemid=' | append: course.itemid %}
				{% elsif page == 'classroom' %}
					{% assign crumbName = classroom.name %}
					{% assign crumbURL = breadcrumb | append: '&itemid=' | append: classroom.itemid %}
				{% elsif page == 'session' %}
					{% assign crumbName = session.name %}
					{% assign crumbURL = breadcrumb | append: '&itemid=' | append: session.itemid %}
				{% elsif page == 'profile' %}
					{% assign crumbName = profile.name %}
					{% assign crumbURL = breadcrumb | append: '&itemid=' | append: profile.itemid %}
				{% elsif page == 'role' %}
					{% assign crumbName = role.name %}
					{% assign crumbURL = breadcrumb | append: '&itemid=' | append: role.itemid %}
				{% elsif page == 'contributor' %}
					{% assign crumbName = contributor.profile | strip_html %}
					{% assign crumbURL = breadcrumb | append: '&itemid=' | append: contributor.itemid %}
				{% else %}
					{% assign crumbName = page %}
					{% assign crumbURL = breadcrumb %}
				{% endif %}
				<li><a href="{{path}}{{crumbURL}}"{% if forloop.last and classroom.name == nil and contributor.name == nil and profile.name == nil %} data-bcpie-sameas="copy:name; scope:#detail1; event:keyup"{% endif %}>{{crumbName}}</a></li>
			{% endfor %}
		</ul>
	{% endunless %}
{% endif %}