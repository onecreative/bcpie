<!DOCTYPE html>
<!--[if IE 9]><html class="lt-ie10" lang="en" > <![endif]-->
<html class="no-js" lang="en">
	<head>
		{% assign root = '/_system/apps/bcpie-bcpie/' -%}
		{% assign navPath = root | append: 'subapps/' | append: folder | append: '.html?page=' -%}
		{% assign appRoot = root | append: 'subapps/' | append: folder | append: '/' -%}
		{% assign pagesPath = appRoot | append: 'pages/' -%}
		{% assign logicPath = appRoot | append: 'logic/' -%}
		{% include '{{logicPath}}globals.inc' -%}
		{% include '{{logicPath}}{{globals.get.page | default: "frameworks"}}.inc' -%}
		{% include '{{root}}template/head.inc' %}
	</head>
	<body>
		<header id="pageheader" role="banner">
			{% include '{{appRoot}}template/header.inc' %}
		</header>
		<section id="pagecontent">
			<div class="row">
				<div class="small-12 columns">
					<main role="main">
						{% if globals.get.page %}{% include '{{pagesPath}}{{globals.get.page}}.inc' %}{% else %}{% include '{{pagesPath}}{{startpage | default: "home"}}.inc' %}{% endif %}
					</main>
				</div>
			</div>
		</section>
		<footer id="pagefooter" role="contentinfo">
			<div class="row">
				<div class="small-12 columns">
					{% include '{{appRoot}}template/footer.inc' %}
				</div>
			</div>
		</footer>
		{% include '{{root}}template/foot.inc' %}
	</body>
</html>