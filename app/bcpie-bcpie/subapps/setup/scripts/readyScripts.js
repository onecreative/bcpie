/*
 *
 * readyScripts.js is the place to put all calls that require the DOM to be ready first.
 * When a script begins with $(function) it is the same as $(document).ready(function).
 *
 * Because this self-invoking function begins with $(function), all scripts inside it
 * will automatically inherit that feature. Most site scripts will live in here.
 *
 * readyScripts.js should be placed just before the closing body tag in the document.
 *
 */

$(function() {
	var doc = document,body = $(doc.body),win = window,
	resourcePath = '/_system/apps/bcpie-bcpie/subapps/setup/packages/',
	structurePath = '/_system/apps/bcpie-bcpie/subapps/setup/structure/'
	readyScripts = {
		ui: {
			gridView: {
				load: function() {
					var figures = body.find('.gridview').find('figure');
					for (var i = 0; i < figures.length; i++) {
						MotionUI.animateIn(figures[i], 'scale-in-up');
					}
				},
				click: function() {
					var figures = body.find('.gridview').find('figure'),
						figureButtons = figures.not('.inactive').children('img'),
						fileInput = $('<input type="file" directory mozdirectory webkitdirectory multiple>'),
						packageJSON = readyScripts.utils.getPackageJSON(),
						uploadObject,
						thisFigure,folder,files,reader,data,message,activePackage,title,requirementsList,requiredItem,packageType;

					figureButtons.on('click', function(event) {
						event.preventDefault();
						thisFigure = $(this).closest('figure');
						
						if (thisFigure.is('[data-id="new"]')) fileInput.click();
						else {
							thisType = thisFigure.data('type');
							thisPackage = packageJSON[thisType].items[packageJSON[thisType].indexes[thisFigure.data('id')]];
							requirementsList = '';
							packageChangeArray = [];

							if (thisFigure.is('.active')) {
								for (var i = 0; i < thisPackage.requiredBy.length; i++) {
									packageType = packageJSON[thisPackage.requiredBy[i].type];
									if (packageType.active.indexOf(thisPackage.requiredBy[i].id) > -1) {
										requiredItem = packageType.items[packageType.indexes[thisPackage.requiredBy[i].id]];
										requirementsList += '<li>'+requiredItem.name+'</li>';
										packageChangeArray.push({
											indexNum: packageType.active.indexOf(thisPackage.requiredBy[i].id),
											packageType: packageType
										});
									}
								}
								if (requirementsList === '') requirementsList = '<li>None</li>';
								alertify.confirm().set({
									title: 'Deactivate '+thisPackage.name+'?',
									message: '<p><strong>'+thisPackage.name+'</strong>, and all active packages which depend on it, will immediately be deactivated.</p><p><strong>Active Dependents:</strong></p><ul>'+requirementsList+'</ul>',
									reverseButtons: true,
									closable: false,
									closableByDimmer: false,
									maximizable: false,
									pinnable: false,
									labels: {'ok':'Do It!', 'cancel':'Uh, never mind.'},
									onok: function() {
										thisFigure.removeClass('active');
										if (packageJSON[thisType].active.indexOf(thisPackage.id) > -1) packageJSON[thisType].active.splice(packageJSON[thisType].active.indexOf(thisPackage.id),1);
										for (var i = 0; i < packageChangeArray.length; i++) {
											packageChangeArray[i].packageType.active.splice(packageChangeArray[i].indexNum,1);
										}
										readyScripts.utils.updatePackageJSON(packageJSON);
										readyScripts.utils.install();
										alertify.success(thisPackage.name+' deactivated.');
									}
								}).show();
							}else {
								for (var i = 0; i < thisPackage.requires.length; i++) {
									packageType = packageJSON[thisPackage.requires[i].type];
									if (packageType.active.indexOf(thisPackage.requires[i].id) === -1) {
										requiredItem = packageType.items[packageType.indexes[thisPackage.requires[i].id]];
										requirementsList += '<li>'+requiredItem.name+'</li>';
										packageChangeArray.push({
											id: thisPackage.requires[i].id,
											packageType: packageType
										});
									}
								}
								if (requirementsList === '') requirementsList = '<li>None</li>';
								alertify.confirm().set({
									title: 'Activate '+thisPackage.name,
									message: '<p><strong>'+thisPackage.name+'</strong>, and all packages it requires, will immediately be activated.</p><p><strong>Inactive Dependencies:</strong></p><ul>'+requirementsList+'</ul>',
									reverseButtons: true,
									closable: false,
									closableByDimmer: false,
									maximizable: false,
									pinnable: false,
									labels: {'ok':'Do It!', 'cancel':'Uh, never mind.'},
									onok: function() {
										if (thisType === 'frameworks' || thisType === 'themes') {
											figures.removeClass('active');
											packageJSON[thisType].active = [];
										}
										thisFigure.addClass('active');
										if (packageJSON[thisType].active.indexOf(thisPackage.id) === -1) packageJSON[thisType].active.push(thisFigure.data('id'));
										for (var i = 0; i < packageChangeArray.length; i++) {
											packageChangeArray[i].packageType.active.push(packageChangeArray[i].id);
										}
										readyScripts.utils.updatePackageJSON(packageJSON);
										readyScripts.utils.install();
										alertify.success(thisPackage.name+' has been activated.');
									}
								}).show();
							}
						}					
					});

					fileInput.on('change', function(evt) {
						failed = false;
						uploadObject = {manifest:{},assets:[],vendor:{}},
						files = this.files;
						var asyncCount = 0;
						var readyIn = 2;
						var index;
						for (var i = 0; i < files.length; i++) {
							if (files[i].type !== '' || files[i].name.indexOf('.eot') > -1 || files[i].name.indexOf('.ttf') > -1 || files[i].name.indexOf('.woff2') > -1 || files[i].name.indexOf('.otf') > -1) {
								if (files[i].webkitRelativePath.indexOf('/vendor/') > -1) {
									folder = files[i].webkitRelativePath.split('/')[2];
									if (typeof uploadObject.vendor[folder] === 'undefined') uploadObject.vendor[folder] = {};
									if (typeof uploadObject.vendor[folder].assets === 'undefined') uploadObject.vendor[folder].assets = [];
									if (files[i].name === 'manifest.json') {
										asyncCount ++;
										reader = new FileReader();
										reader.onload = function(file) {
											data = file.target.result;
											if (!bcpie.utils.isJson(data)) data = bcpie.utils.jsonify(data);
											if (!bcpie.utils.isJson(data)) {
												alertify.alert('Vendor manifest.json is malformed. Please fix it and try again.');
												failed = true;
											}else {
												data = JSON.parse(data);
												uploadObject.vendor[data.id].manifest = data;
											}
											asyncCount --;
											if (asyncCount === 0) {
												readyIn --;
												body.trigger('fileloop:finished');
											}
										};
										reader.readAsText(files[i]);
									}else uploadObject.vendor[folder].assets.push(files[i]);
								}else if (files[i].webkitRelativePath.split('/').pop() === 'manifest.json') {
									asyncCount ++;
									reader = new FileReader();
									reader.onload = function(file) {
										data = file.target.result;
										if (!bcpie.utils.isJson(data)) data = bcpie.utils.jsonify(data);
										if (!bcpie.utils.isJson(data)) {
											alertify.alert('manifest.json is malformed. Please fix it and try again.');
											failed = true;
										}else {
											uploadObject.manifest = JSON.parse(data);
										}
										asyncCount --;
										if (asyncCount === 0) {
											readyIn --;
											body.trigger('fileloop:finished');
										}
									};
									reader.readAsText(files[i]);
								}else {
									uploadObject.assets.push(files[i]);
								}
							}
						}
						readyIn --;
						body.trigger('fileloop:finished');
						body.on('fileloop:finished', function() {
							if (readyIn === 0) {
								body.off('fileloop:finished');
								fileInput.val('');
								if (failed === false) {
									// Add vendor files
									for (key in uploadObject.vendor) {
										readyScripts.utils.addVendor(packageJSON,uploadObject.vendor[key]);
									}
									// Add main files
									packageJSON = readyScripts.utils.uploadAssets(packageJSON,uploadObject);
									if (packageJSON !== 'failed') {
										readyScripts.utils.updatePackageJSON(packageJSON);
										win.location.reload();
									}
								}
							}
						});
					});
				}
			},
			alertify: function() {
				alertify.set('notifier','position', 'top-right');
			}
		},
		utils: {
			updatePackageJSON: function(data) {
				return bcpie.ajax.file.save({path:resourcePath+'packages.json',content:data},{async:false});
			},
			getPackageJSON: function() {
				packageJSON = JSON.parse(bcpie.ajax.file.get({path:resourcePath+'packages.json'},{async:false}).responseText);
				if (packageJSON.code == 104002) {
					packageJSON = {
						frameworks: {active: [],indexes: {},items: []},
						thirdParty: {active: [],indexes: {},items: []},
						layouts: {active: [],indexes: {},items: []},
						themes: {active: [],indexes: {},items: []},
						tricks: {active: [],indexes: {},items: []},
						fonts: {active: [],indexes: {},items: []}
					};
				}
				return packageJSON;
			},
			install: function(packageJSON) {
				if (typeof packageJSON === 'undefined') packageJSON = readyScripts.utils.getPackageJSON();
				var installPaths = {
						scripts: {
							head: '/scripts/headScripts.js',
							foot: '/scripts/footScripts.js'
						},
						styles: '/StyleSheets/ModuleStyleSheets.css',
						fonts: '/fonts/',
						images: '/images/'
					},
					activePackages = [],
					installOrder = [],
					dependSort,
					installContent = {
						scripts: {
							head: '',
							foot: ''
						},
						styles: '',
						fonts: [],
						images: []
					},
					packagePath,
					data,
					asset,
					requiredIndex,
					noDepends = [];

				// Collect active packages
				for (key in packageJSON) {
					for (var i = 0; i < packageJSON[key].active.length; i++) {
						activePackages.push(packageJSON[key].items[packageJSON[key].indexes[packageJSON[key].active[i]]]);
					}
				}
				// Put them in order
				for (var i = 0; i < activePackages.length; i++) {
					if (installOrder.length === 0) installOrder.push(activePackages[i]);
					else if (activePackages[i].requires.length === 0) noDepends.push(activePackages[i]);
					else {
						dependSort = 0;
						for (var e = 0; e < activePackages[i].requires.length; e++) {
							for (var f = 0; f < installOrder.length; f++) {
								requiredIndex = installOrder.length - 1 - f;
								if (activePackages[i].requires[e].id === installOrder[requiredIndex].id && requiredIndex > dependSort) {
									dependSort = requiredIndex;
									break;
								}
							}
						}
						if (dependSort === installOrder.length - 1) installOrder.push(activePackages[i]);
						else installOrder.splice(dependSort+1, 0, activePackages[i]);
					}
				}
				installOrder = noDepends.concat(installOrder);
				// Gather Content
				for (var i = 0; i < installOrder.length; i++) {
					packagePath = resourcePath+installOrder[i].type+'/'+installOrder[i].id+'/';
					for (var e = 0; e < installOrder[i].assets.length; e++) {
						asset = installOrder[i].assets[e];
						if (asset.type === 'scripts' || asset.type === 'styles') {
							data = bcpie.ajax.file.get({path:packagePath+asset.type+'/'+asset.filename},{async:false}).responseText + ';';
							if (typeof asset.location !== 'undefined') installContent[asset.type][asset.location] += data;
							else installContent[asset.type] += data;
						}else if (asset.type === 'fonts') {
							data = bcpie.ajax.file.get({path:packagePath+asset.type+'/'+asset.filename},{async:false});
							 installContent[asset.type].push(data);
						}
					}
				}
				// Install
				var settings = {minify:false};
				if (settings.minify === true) {
					if (installContent.styles.length > 0) {
						// $.ajax({
						// 	url: '//cssminifier.com/raw?input='+bcpie.utils.encode(installContent.styles),
						// 	type: 'POST',
						// 	async: false
						// }).done(function(data,status,xhr) {
						// 	console.log(data);
						// 	installContent.styles = data;
						// }).fail(function(xhr,status) {
						// 	console.log(xhr);
						// 	console.log(status);
						// });
					}
					if (installContent.scripts.head.length > 0) {
						ast = UglifyJS.parse(installContent.scripts.head);
						ast.figure_out_scope();
						compressor = UglifyJS.Compressor();
						ast = ast.transform(compressor);
						installContent.scripts.head = ast.print_to_string();
					}
					if (installContent.scripts.foot.length > 0) {
						ast = UglifyJS.parse(installContent.scripts.foot);
						ast.figure_out_scope();
						compressor = UglifyJS.Compressor();
						ast = ast.transform(compressor);
						installContent.scripts.foot = ast.print_to_string();
					}
				}
				bcpie.ajax.file.save({
					path: installPaths.styles,
					content: installContent.styles
				});
				bcpie.ajax.file.save({
					path: installPaths.scripts.head,
					content: installContent.scripts.head
				});
				bcpie.ajax.file.save({
					path: installPaths.scripts.foot,
					content: installContent.scripts.foot
				});
				for (var i = 0; i < installContent.fonts.length; i++) {
					bcpie.ajax.file.save({
						path: installPaths.fonts+installContent.fonts[i].getResponseHeader('Content-Disposition').split('filename=')[1],
						content: installContent.fonts[i].responseText
					});
				}
				for (var i = 0; i < installContent.images.length; i++) {
					bcpie.ajax.file.save({
						path: installPaths.images+installContent.images[i].getResponseHeader('Content-Disposition').split('filename=')[1],
						content: installContent.images[i].responseText
					});
				}
			},
			uploadAssets: function(packageJSON,uploadObject) {
				var updated = false;
				uploadObject.missing = [];
				uploadObject.imageIndex = -1;
				for (var i = 0; i < uploadObject.manifest.assets.length; i++) {
					uploadObject.manifest.assets[i].index = -1;
					for (var e = 0; e < uploadObject.assets.length; e++) {
						if (uploadObject.assets[e].name === uploadObject.manifest.assets[i].filename) uploadObject.manifest.assets[i].index = e;
						else if (uploadObject.imageIndex === -1 && uploadObject.assets[e].name === uploadObject.manifest.image) uploadObject.imageIndex = e;
					}
					if (uploadObject.manifest.assets[i].index === -1) uploadObject.missing.push(uploadObject.manifest.assets[i].filename);
				}
				if (uploadObject.imageIndex === -1 && uploadObject.manifest.image !== null && uploadObject.manifest.image !== '') uploadObject.missing.push(uploadObject.manifest.image);
				if (uploadObject.missing.length > 0) failed = true;
				if (failed === true) {
					var missingAssets = '';
					for (var i = 0; i < uploadObject.missing.length; i++) {
						missingAssets += '<li>'+uploadObject.missing[i]+'</li>';
					}
					missingAssets = '<ul>'+missingAssets+'</ul>';
					alertify.alert('Your '+uploadObject.name+' package is missing the following assets:',missingAssets);
					return 'failed';
				}else {
					bcpie.ajax.folder.delete({path:resourcePath+uploadObject.manifest.type+'/'+uploadObject.manifest.id}).always(function(){
						// bcpie.ajax.file.save({path:resourcePath+uploadObject.manifest.type+'/'+uploadObject.manifest.id+'/manifest.json',content:JSON.stringify(uploadObject.manifest)});
						if (uploadObject.manifest.image !== null && uploadObject.manifest.image !== '') bcpie.ajax.file.save({path:resourcePath+uploadObject.manifest.type+'/'+uploadObject.manifest.id+'/images/'+uploadObject.manifest.image,content:uploadObject.assets[uploadObject.imageIndex]});
						for (var i = 0; i < uploadObject.manifest.assets.length; i++) {
							index = uploadObject.manifest.assets[i].index;
							bcpie.ajax.file.save({path:resourcePath+uploadObject.manifest.type+'/'+uploadObject.manifest.id+'/'+uploadObject.manifest.assets[i].type+'/'+uploadObject.manifest.assets[i].filename,content:uploadObject.assets[index]},{async:false});
						}
					});
					for (var i = 0; i < packageJSON[uploadObject.manifest.type].items.length; i++) {
						if (packageJSON[uploadObject.manifest.type].items[i].id === uploadObject.manifest.id) {
							packageJSON[uploadObject.manifest.type].items[i] = uploadObject.manifest;
							updated = true;
							break;
						}
					}
					if (updated === false) {
						packageJSON[uploadObject.manifest.type].items.push(uploadObject.manifest);
						packageJSON[uploadObject.manifest.type].indexes[uploadObject.manifest.id] = packageJSON[uploadObject.manifest.type].items.length -1;
					}

					packageJSON = readyScripts.utils.requiredBy(packageJSON);

					if (updated === true) alertify.success(uploadObject.manifest.name+' has been updated successfully. Refreshing...');
					else alertify.success(uploadObject.manifest.name+' has been added successfully. Refreshing...');

					return packageJSON;
				}
			},
			addVendor: function(packageJSON,uploadObject) {
				if (typeof packageJSON[uploadObject.manifest.type].indexes[uploadObject.manifest.id] !== 'undefined') {
					currentVersion = packageJSON[uploadObject.manifest.type].items[packageJSON[uploadObject.manifest.type].indexes[uploadObject.manifest.id]].packageVersion;
					uploadVersion = uploadObject.manifest.packageVersion;
					if (uploadVersion < currentVersion) {
						alertify.confirm().set({
							title: 'This package includes an older version of '+uploadObject.manifest.name,
							message: 'Usually it\'s better to keep the newer version of a package. Would you like to downgrade anyway?',
							reverseButtons: true,
							closable: false,
							closableByDimmer: false,
							maximizable: false,
							pinnable: false,
							labels: {'ok':'Downgrade '+uploadObject.manifest.name, 'cancel':'Skip'},
							onok: function() {
								readyScripts.utils.uploadAssets(packageJSON,uploadObject);
							}
						}).show();
					}else readyScripts.utils.uploadAssets(packageJSON,uploadObject);
				}else {
					packageJSON[uploadObject.manifest.type].items.push(uploadObject.manifest);
					packageJSON[uploadObject.manifest.type].indexes[uploadObject.manifest.id] = packageJSON[uploadObject.manifest.type].items.length -1;
					readyScripts.utils.uploadAssets(packageJSON,uploadObject);
				}
			},
			requiredBy: function(packageJSON) {
				var requiredBy = {},exists,requiredItem,thisItem;

				for (key in packageJSON) {
					for (var i = 0; i < packageJSON[key].items.length; i++) {
						packageJSON[key].items[i].requiredBy = [];
						for (var e = 0; e < packageJSON[key].items[i].requires.length; e++) {
							thisItem = packageJSON[key].items[i];
							requiredItem = thisItem.requires[e];
							if (typeof requiredBy[requiredItem.id] === 'undefined') {
								requiredBy[requiredItem.id] = {}
								requiredBy[requiredItem.id].type = requiredItem.type;
								requiredBy[requiredItem.id].items = [];
							}
							exists = false;
							for (var f = 0; f < requiredBy[requiredItem.id].items.length; f++) {
								if (requiredBy[requiredItem.id].items[f].id === thisItem.id) {
									exists = true;
									break;
								}
							}
							if (exists === false) requiredBy[requiredItem.id].items.push({
								id: thisItem.id,
								type: thisItem.type,
								packageVersion: thisItem.packageVersion
							});
						}
					}
				}
				for (key in requiredBy) {
					if (typeof packageJSON[requiredBy[key].type].items[packageJSON[requiredBy[key].type].indexes[key]] !== 'undefined') packageJSON[requiredBy[key].type].items[packageJSON[requiredBy[key].type].indexes[key]].requiredBy = requiredBy[key].items;
				}
				return packageJSON;
			}
		},
		thirdParty: {
			functionName: function() {

			}
		},
		frameworks: {
			functionName: function() {
				
			}
		},
		installed: {
			functionName: function() {

			}
		},
		layouts: {
			functionName: function() {

			}
		},
		themes: {
			functionName: function() {

			}
		},
		tricks: {
			functionName: function() {

			}
		},
		updates: {
			functionName: function() {

			}
		},
		setup: function() {
			if (bcpie.globals.hash.indexOf('#access_token') === 0) {
				bcpie.ajax.file.get({path: '/_system/includes/template/foot.inc'}).fail(function() {
					bcpie.ajax.file.get({path: structurePath+'files/foot.inc'}).done(function(data) {
						bcpie.ajax.file.save({path:'/_system/includes/template/foot.inc',content: data});
					})
				});
				bcpie.ajax.file.get({path: '/_system/includes/template/head.inc'}).fail(function() {
					bcpie.ajax.file.get({path: structurePath+'files/head.inc'}).done(function(data) {
						bcpie.ajax.file.save({path:'/_system/includes/template/head.inc',content: data});
					})
				});
				bcpie.ajax.file.get({path: '/_system/includes/template/header.inc'}).fail(function() {
					bcpie.ajax.file.save({path:'/_system/includes/template/header.inc'});
				});
				bcpie.ajax.file.get({path: '/_system/includes/template/footer.inc'}).fail(function() {
					bcpie.ajax.file.save({path:'/_system/includes/template/footer.inc'});
				});
				bcpie.ajax.file.get({path: '/_system/includes/template/globals.inc'}).fail(function() {
					bcpie.ajax.file.get({path: structurePath+'files/globals.inc'}).done(function(data) {
						bcpie.ajax.file.save({path:'/_system/includes/template/globals.inc',content: data});
					})
				});
				bcpie.ajax.file.get({path: '/scripts/readyScripts.js'}).fail(function() {
					bcpie.ajax.file.get({path: structurePath+'files/readyScripts.js'}).done(function(data) {
						bcpie.ajax.file.save({path:'/scripts/readyScripts.js',content: data});
					})
				});
				bcpie.ajax.file.get({path: '/StyleSheets/site.css'}).fail(function() {
					bcpie.ajax.file.save({path:'/StyleSheets/site.css'});
				});
				bcpie.ajax.file.get({path: '/Templates/1Col.html'}).fail(function() {
					bcpie.ajax.file.get({path: structurePath+'files/1Col.html'}).done(function(data) {
						bcpie.ajax.template.save({
							content: {
								name: '1Col',
								displayFileName: '1Col.html',
								printerView: true,
								default: true,
								desktopContent: data
							}
						});
						
					})
				});
				bcpie.ajax.file.get({path: '/Templates/2Col.html'}).fail(function() {
					bcpie.ajax.file.get({path: structurePath+'files/2Col.html'}).done(function(data) {
						bcpie.ajax.template.save({
							content: {
								name: '2Col',
								displayFileName: '2Col.html',
								desktopContent: data
							}
						});
					})
				});
				bcpie.ajax.file.get({path: '/Templates/1Col-No-Title.html'}).fail(function() {
					bcpie.ajax.file.get({path: structurePath+'files/1Col-No-Title.html'}).done(function(data) {
						bcpie.ajax.template.save({
							content: {
								name: '1Col-No-Title',
								displayFileName: '1Col-No-Title.html',
								desktopContent: data
							}
						});
					})
				});
				bcpie.ajax.file.get({path: '/Templates/1Col-No-Grid.html'}).fail(function() {
					bcpie.ajax.file.get({path: structurePath+'files/1Col-No-Grid.html'}).done(function(data) {
						bcpie.ajax.template.save({
							content: {
								name: '1Col-No-Grid',
								displayFileName: '1Col-No-Grid.html',
								desktopContent: data
							}
						});
					})
				});
				bcpie.ajax.file.get({path: '/Templates/2Col-No-Title.html'}).fail(function() {
					bcpie.ajax.file.get({path: structurePath+'files/2Col-No-Title.html'}).done(function(data) {
						bcpie.ajax.template.save({
							content: {
								name: '2Col-No-Title',
								displayFileName: '2Col-No-Title.html',
								desktopContent: data
							}
						});
					})
				});
				bcpie.ajax.file.get({path: '/_system/includes/library/'}).fail(function() {
					bcpie.ajax.file.save({path:'/_system/includes/library/'});
				});
				bcpie.ajax.file.get({path: '/fonts/'}).fail(function() {
					bcpie.ajax.file.save({path:'/fonts/'});
				});
				bcpie.ajax.file.get({path: '/images/general/'}).fail(function() {
					bcpie.ajax.file.save({path:'/images/general/'});
				});
			}
		}
	};
	readyScripts.setup();
	readyScripts.ui.alertify();
	readyScripts.ui.gridView.load();
	readyScripts.ui.gridView.click();
});