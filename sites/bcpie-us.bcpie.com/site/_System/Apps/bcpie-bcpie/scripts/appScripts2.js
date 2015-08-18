var doc = document,
    html = $('html'),
    body = $(doc.body),
    win = window,
    bcmodules = body.find('#bcmodules'),
    appPath = '_System/apps/bcpie-bcpie/',
    settingsPath = appPath + 'scripts/settings.json',
    oauthTokenAPI = "https://framework-bcpie.rhcloud.com/api/git-token",
    frameworkName ='', frameworkUserName='', frameworkRepository='';


$(function() {

    var appScripts = {
        ui:{
            showLoading: function(){
                body.find("#pagecontainer").addClass('hide');
                html.addClass('loading');
            },
            hideLoading: function(){
                body.find("#pagecontainer").removeClass('hide');
                html.removeClass('loading');
            }
        },
        updateBCPie: function() {
            var pagecontent = body.find("#pagecontent"),
                app = $.parseJSON(bc.api.file.get(settingsPath)),
                folderContainer = body.find('#folderContainer'),
                frameworkSelect = body.find('[name="frameworks"]'),
                folderSelectRadio = body.find('[name="folderSelect"]'),
                foldersListContainer = body.find('#foldersListContainer'),
                registry, loadingTimeout, repoStructure;

            function initializeFrameworksAvailable() {
                $.ajax({
                    type: "GET",
                    url: oauthTokenAPI,
                    success: function(data) {
                        $.setGithubSetOAuthToken(data.token);
                        $.getGithubFileByFilePath(app.registry.username, app.registry.repo, app.registry.filename, function(contents) {
                            registry = JSON.parse(contents);
                            var selectHtml = "";
                            console.log(registry);

                            frameworkName = registry.repos[0].name;
                            frameworkUserName =  registry.repos[0].username;
                            frameworkRepository = registry.repos[0].repository;
                            bindFrameworkSelectEvent();
                            appScripts.checkAppUpdate(app.registry.currentVersion, app.registry.lastVersion);
                            
                        });
                        appScripts.ui.hideLoading();
                    }
                });
            }

            function bindFrameworkSelectEvent() {
                    appScripts.ui.showLoading();
                        var repo = frameworkRepository,
                            username = frameworkUserName;
                        $.getGithubFileByFilePath(username, repo, "repo2.json", function(contents) {
                            console.log(contents);
                            repoStructure = JSON.parse(contents);
                            //load repos files and folders
                            treeData = [];      
                            treeData = parseTreeData(repoStructure);
                            loadDynaTree(treeData);
                            folderContainer.removeClass('hide');
                            appScripts.ui.hideLoading();
                        });
            }

            function parseTreeData(repoStructure){
                for (var key in repoStructure.structure) {
                    var layoutArr = repoStructure.structure[key];
                    for(var i=0 ; i<layoutArr.length; i++) {
                        var firstChildObj = {
                            'title'        : layoutArr[i].name,
                            'isFolder'     : ((layoutArr[i].type == "folder") ? true : false),
                            'key'          : key + '/' + layoutArr[i].name
                        };
                        firstChildObj.children = [];
                        var subFolder = layoutArr[i]['files'];
                        if(layoutArr[i].hasOwnProperty('files')){
                            for(var j=0; j<subFolder.length; j++) {
                                var secondChildObj = {
                                    'title'        : subFolder[j].name,
                                    'key'          : key + '/' + layoutArr[i].name + '/' +subFolder[j].name,
                                    'isFolder'     : ((subFolder[j].type == "folder") ? true : false),
                                }
                                
                                if(subFolder[j].type == "folder") {
                                    secondChildObj.children = [];
                                    var subSubFolder = subFolder[j]['files'];
                                    for(var k=0; k<subSubFolder.length; k++) {
                                        var thirdChildObj = {
                                            'title'    : subSubFolder[k].name,
                                            'key'    : key + '/' + layoutArr[i].name + '/' +subFolder[j].name + '/' +subSubFolder[k].name
                                        }
                                        secondChildObj.children.push(thirdChildObj);
                                    }
                                }
                                firstChildObj.children.push(secondChildObj);
                            }
                        }
                        treeData.push(firstChildObj);
                    }
                }
                return treeData;
            }

            function loadDynaTree(treeData){
                var dynatreeInit = true;
                var appUpdateData  = $.grep(treeData,function(e){
                    return e.key.indexOf('bcpieLayoutsApp/') > -1;
                });

                try{ body.find("#updateTree").dynatree("getTree"); } catch(e){ dynatreeInit = false; }
                if(!dynatreeInit){
                    //Initialize app update tree
                    body.find("#updateTree").dynatree({
                        checkbox: true,
                        selectMode: 3,
                        children: appUpdateData,
                        onSelect: function(select, node) {
                            // Get a list of all selected nodes, and convert to a key array:
                            var selKeys = $.map(node.tree.getSelectedNodes(), function(node) {
                                return node.data.key;
                            });
                            $("#echoSelection3").text(selKeys.join(", "));
                            // Get a list of all selected TOP nodes
                            var selRootNodes = node.tree.getSelectedNodes(true);
                            // ... and convert to a key array:
                            var selRootKeys = $.map(selRootNodes, function(node) {
                                return node.data.key;
                            });
                            $("#echoSelectionRootKeys3").text(selRootKeys.join(", "));
                            $("#echoSelectionRoots3").text(selRootNodes.join(", "));
                        },
                        onDblClick: function(node, event) {
                            node.toggleSelect();
                        },
                        onKeydown: function(node, event) {
                            if (event.which == 32) {
                                node.toggleSelect();
                                return false;
                            }
                        },
                        cookieId: "dynatree-Cb3",
                        idPrefix: "dynatree-Cb3-"
                    });
                    $('#updateTree').dynatree("getRoot").visit(function(node) {
                        node.select(true);
                    });

                } else{
                    var root = body.find("#updateTree").dynatree("getRoot");
                    root.removeChildren();
                    root.addChild(treeData);
                }
            }

            function bindRadioCheckEvent() {
                folderSelectRadio.on('change', function() {
                    if ($(this).val() === "1") {
                        console.log('select all');
                        foldersListContainer.find('ul li input').prop('checked', true);
                    } else {
                        console.log('un select all');
                        foldersListContainer.find('ul li input').prop('checked', false);
                    }
                });
            }

            function populateFolders() {
                var folderHtml = "";
                for (i = 0; i < app.folders.length; i++) {
                    var folder = app.folders[i];
                    folderHtml = folderHtml + '<h4>' + folder.rootfolder + '</h4>';
                    folderHtml = folderHtml + '<ul class="small-block-grid-2 medium-block-grid-3 large-block-grid-4">';
                    for (j = 0; j < folder.subfolders.length; j++) {
                        var dateObj = new Date(folder.subfolders[j].lastUpdated),
                            dateString = dateObj.getDate() + '/' + (dateObj.getMonth() + 1) + '/' + dateObj.getFullYear();
                        folderHtml = folderHtml + '<li><input type="checkbox" name="folders" value="' + folder.rootfolder + '/' + folder.subfolders[j].name + '" data-rootfolder="' + i + '"  data-subfolder="' + j + '"/><span data-tooltip aria-haspopup="true" class="has-tip" data-options="show_on:large" title="' + "Last Updated on " + dateObj + '">' + folder.subfolders[j].name + '</span></li>';

                    }

                    folderHtml = folderHtml + '<li><input type="checkbox" name="folders" value="Layouts/Test" data-rootfolder="0" data-subfolder="17">';
                    folderHtml = folderHtml + '<span data-tooltip="" aria-haspopup="true" class="has-tip" data-options="show_on:large" title="Last Updated on Wed Feb 25 2015 17:01:06 GMT+0530 (India Standard Time)">WebApps</span>';
                    folderHtml = folderHtml + '<ul ><li><input type="checkbox" name="folders" value="Layouts/Test/1"/>1</li>';
                    folderHtml = folderHtml + '<li><input type="checkbox" name="folders" value="Layouts/Test/2"/>2</li>';
                    folderHtml = folderHtml + '<ul>';
                    folderHtml = folderHtml + '</li>';

                    folderHtml = folderHtml + '</ul>';
                }
                foldersListContainer.append(folderHtml);
            }

            initializeFrameworksAvailable();
            bindRadioCheckEvent();

        },
        appUpdate : function(gitCurr, gitPrev){
            $('input[name="btnUpdateApp"]').on('click',function(){
                $('#divUpdate').addClass('hide');
                appScripts.ui.showLoading();
                var app = $.parseJSON(bc.api.file.get(settingsPath)),
                    checkedFiles = [];
                    checkedFiles = $.map($("#updateTree").dynatree("getSelectedNodes"), function(node) { if(!node.childList){ return node.data.key } });
                
                var count = 0;
                var update = function(count) {
                    var filePath = checkedFiles[count].replace("bcpieLayoutsApp/","");
                    filePath = "bcpieLayoutsApp/_System/Apps/bcpie-layouts/" + filePath;
                    var targetFilePath = filePath;
                    targetFilePath = targetFilePath.replace('bcpieLayoutsApp/','');
                    targetFilePath = targetFilePath.replace('bcpie-layouts','bcpie-bcpie');

                    $.getGithubFileByFilePath(frameworkUserName, frameworkRepository, filePath, function(fileContents) {
                        bc.api.file.save(targetFilePath, fileContents).done(function() {
                            window.clearTimeout();
                            $.sticky("<b>App Updated Successfully</b>", {
                                closeImage: "/_system/apps/bcpie-bcpie/images/close.png"
                            });
                        });
                    }); 

                      count++;
                     if(count <  checkedFiles.length){
                        update(count);   
                     }
                     else{
                       appScripts.ui.hideLoading(); 
                     } 
                }
                update(count);

                setTimeout(function() {
                    app.registry.currentVersion = gitCurr;
                    app.registry.lastVersion = gitPrev;
                    bc.api.file.save(settingsPath, JSON.stringify(app));
                    appScripts.ui.hideLoading();
                }, 3000);
            });
        }, //appUpdate

        checkAppUpdate: function(currVersion, prevVersion){
            var currentVersion = currVersion;
             var settingsFile = "bcpieLayoutsApp/_System/Apps/bcpie-layouts/scripts/settings.json";
             $.getGithubFileByFilePath(frameworkUserName, frameworkRepository, settingsFile, function(fileContents) {
                var data =JSON.parse(fileContents)
                var gitCurrent = data.registry.currentVersion;
                var gitPrevious = data.registry.lastVersion;
                if(currentVersion != gitCurrent){
                    appScripts.appUpdate(gitCurrent,gitPrevious);
                    $('#divUpdate').removeClass('hide');
                } 
            }); 
        }
    };   
    appScripts.updateBCPie();
});
