/*
 * "CoreFile". An awesome trick for BC Pie.
 * http://bcpie.com
 * Copyright 2015, ONE Creative
 * Free to use in BC Pie
*/

bcpie.extensions.tricks.CoreFile = function(selector,options) {
	var settings = bcpie.extensions.settings(selector,options,{
		name: 'CoreFile',
		version: '2015.11.03',
		defaults: {
			file: null,
			location: null, // foot, head, ready
			folder: null,
			minify: true // true, false
		}
	});

	function endsWith(str, suffix) {
		return str.indexOf(suffix, str.length - suffix.length) !== -1;
	}
	function createItemsMap(items) {
		var map = {};
		for (var i = 0; i < items.files.length; i++) {
			map[items.files[i].filename] = i;
		}
		return map;
	}
	function sortDependencies(itemsMap,items) {
		var order = [],dependSort;
		for (key in itemsMap) {
			file = items.files[itemsMap[key]];
			if (order.length === 0 || file.requires.length === 0) order.unshift(file.filename);
			else {
				dependSort = [];
				for (var i = 0; i < file.requires.length; i++) {
					for (var e = 0; e < order.length; e++) {
						if (order[e] === file.requires[i]) {
							dependSort.push(e);
							break;
						}
					}
				}
				dependSort.sort(function(a, b){return b-a});
				if (dependSort[0] === order.length) order.push(file.filename);
				else order.splice(dependSort[0]+1, 0, file.filename);
			}
		}
		return order;
	}
	function updateJSONfromTable(itemsMap,items,filename,rows) {
		for (var i = 0; i < rows.length; i++) {
			items.files[itemsMap[$(rows[i]).data('filename')]].status = $(rows[i]).find('.enable').find('a').text();
		}
		return bcpie.ajax.file.save({
			path: '/_system/apps/bcpie-bcpie/apps/updates/framework/'+filename+'.json',
			content: items
		})
	}
	function getFileContent(itemsMap,correctOrder,items,type,location) {
		var newContents = '',item;
		type = type.split('.').pop();

		for (var i = 0; i < correctOrder.length; i++) {
			item = items.files[itemsMap[correctOrder[i]]];
			if (endsWith(correctOrder[i], '.'+type) && item.location === location) {
				bcpie.ajax.file.get({path:'/_system/apps/bcpie-bcpie/apps/updates/framework/files/'+item.filename},{async:false}).done(function(data){
					newContents = newContents.concat(data);
				});
			}
		}
		return newContents;
	}

	bcpie.ajax.file.get({path:'/_system/apps/bcpie-bcpie/apps/updates/framework/core.json'}).done(function(data,status,xhr) {
		var rows = selector.closest('table').find('tbody').find('.filerow'),
			items = JSON.parse(data),
			itemsMap = createItemsMap(items),
			correctOrder = sortDependencies(itemsMap,items),
			mini,
			url;

		selector.on('click', function(event) {
			event.preventDefault();
			thisButton = $(this);
			updateJSONfromTable(itemsMap,items,'core',rows);
			type = settings.file.split('.').pop();
			content = getFileContent(itemsMap,correctOrder,items,type,settings.location);

			if (settings.minify === true) {
				if (type === 'css') {
					$.ajax({
						url: '//cssminifier.com/raw?input='+bcpie.utils.encode(content),
						type: 'POST',
						async: false
					}).done(function(data,status,xhr) {
						console.log(data);
						content = data;
					}).fail(function(xhr,status) {
						console.log(xhr);
						console.log(status);
					});
				}else if (type === 'js') {
					ast = UglifyJS.parse(content);
					ast.figure_out_scope();
					compressor = UglifyJS.Compressor();
					ast = ast.transform(compressor);
					content = ast.print_to_string();
				}
			}
			bcpie.ajax.file.save({
				path: '/'+settings.folder+'/'+settings.file,
				content: content
			}).always(function(xhr) {
				if (xhr === '' || xhr.status.toString().indexOf('20') > -1) {
					alertify.success(settings.file+' Created');
				}
			});
		});
	});
};