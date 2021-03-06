<header id="pageheader" role="banner">
<div class="right"><a href="{{home}}">Profile</a></div>
	<h1>Help</h1>
</header>
<main id="pagecontent" role="main">
	<div class="row">
		<div class="medium-12 columns">
			<dl class="accordion" data-accordion>
				<dd class="accordion-navigation">
					<a href="#panel1">Developer Setup</a>
					<div id="panel1" class="content">
						<ol>
							<li>When you save your profile, the app saves a file in the following path of your directory:
								<pre><code>/_system/apps/bcpie-bcpie/public/profile.json</code></pre>
							</li>
							<li>We recommend placing the following snippet at the top of your page templates:
								<pre><code>&#123;module_json, json="/_system/apps/bcpie-bcpie/public/profile.json" collection="profile" template=""&#125;</code></pre>
							</li>
							<li>Now you can add your profile data to your pages with a simple Liquid syntax. Your profile data is inside a collection called "profile". You can access your data like this:
								<ul>
									<li>&#123;&#123;profile.name&#125;&#125; (renders the company name)</li>
									<li>&#123;&#123;profile.brand&#125;&#125;</li>
									<li>&#123;&#123;profile.contact.firstname&#125;&#125;</li>
								</ul>
							</li>
							<li>Here is the entire json output of the profile collection (if you have saved any data, it will show up here):
								<pre><code>{{profile | json}}</code></pre>
							</li>
							<li>Please note: You will need to place the snippet (#2) on every overall module layout where you would like to use it. You don't need to add it to layouts that are rendered with tag syntax ({tag_blahblah}) if you have added it to its parent module layout (&#123;module_blahblah&#125;).</li>
						</ol>

					</div>
				</dd>
				<dd class="accordion-navigation">
					<a href="#panel3">Delete</a>
					<div id="panel3" class="content">
						<ol>
							<li>Replace the Liquid markup instances for this app with static text on any page where you added it.</li>
						</ol>
					</div>
				</dd>
			</dl>
		</div>
	</div>
</main>