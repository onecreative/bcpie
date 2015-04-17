;(function ($) {
  var githubCacheFilePath = [];
  var githubCacheSha = [];

  var githubOauthToken = "";

  var fnSuccess =
    function (data, startLineNum, endLineNum, callback) {
      if (data.data.content && data.data.encoding === "base64") {
        var contentArray = 
          window
            .atob(data.data.content.replace(/\n/g, ""))
            .split("\n");

        endLineNum = endLineNum || contentArray.length;

        callback(contentArray.slice(startLineNum - 1, endLineNum).join("\n"));
      }
    };

    $.setGithubSetOAuthToken = function(oauth_token){
        githubOauthToken = oauth_token;
    }

    $.getGithubFolderInfo =
    function(user, repo, folder, callback) {
        $.ajax({
          type: "GET"
          ,url: "https://api.github.com/repos/" + user + "/" + repo + "/contents/"+ folder + getOauthString()
          ,dataType: "jsonp"
          ,success: function(data){
            callback(data.data);
          }
        });      
    };

  $.getGithubFileByFilePath =
    function(user, repo, filePath, callback, startLineNum, endLineNum, beforeSendCallback) {
      if(githubCacheFilePath[filePath]){
          $.getGithubFile(user, repo, githubCacheFilePath[filePath], callback, startLineNum, endLineNum)
      }else{
        $.ajax({
          type: "GET"
          ,url: "https://api.github.com/repos/" + user + "/" + repo + "/contents/"+filePath + getOauthString()
          ,dataType: "jsonp"
          ,beforeSend : beforeSendCallback
          ,success: function(data){
            githubCacheFilePath[filePath] = data.data.sha;
            $.getGithubFile(user, repo, githubCacheFilePath[filePath], callback, startLineNum, endLineNum)
          }
        });
      }
    };

  $.getGithubFile =
    function(user, repo, sha, callback, startLineNum, endLineNum) {
      if(githubCacheSha[sha]){
        fnSuccess(githubCacheSha[sha], +startLineNum || 1, +endLineNum || 0, callback);
      }else{
        $.ajax({
          type: "GET"
          ,url: "https://api.github.com/repos/" + user + "/" + repo + "/git/blobs/" + sha + getOauthString()
          ,dataType: "jsonp"
          ,success: function(data) {
            githubCacheSha[sha] = data
            fnSuccess(githubCacheSha[sha], +startLineNum || 1, +endLineNum || 0, callback);
          }
        });
      }
    };

    function getOauthString(){
      var oauthString = "";
      if(githubOauthToken !== ""){
        oauthString = "?access_token=" + githubOauthToken;
      }
      return oauthString;
    }
}(jQuery));
// Sticky v1.0 by Daniel Raftery
(function($){$.sticky=function(note,options,callback){return $.fn.sticky(note,options,callback)};$.fn.sticky=function(note,options,callback){var position="top-right";var settings={speed:"fast",duplicates:true,autoclose:5000, closeImage: "close.png"};if(!note){note=this.html()}if(options){$.extend(settings,options)}var display=true;var duplicate="no";var uniqID=Math.floor(Math.random()*99999);$(".sticky-note").each(function(){if($(this).html()==note&&$(this).is(":visible")){duplicate="yes";if(!settings.duplicates){display=false}}if($(this).attr("id")==uniqID){uniqID=Math.floor(Math.random()*9999999)}});if(!$("body").find(".sticky-queue").html()){$("body").append('<div class="sticky-queue '+position+'"></div>')}if(display){$(".sticky-queue").prepend('<div class="sticky border-'+position+'" id="'+uniqID+'"></div>');$("#"+uniqID).append('<img src="' + settings.closeImage + '" class="sticky-close" rel="'+uniqID+'" title="Close" />');$("#"+uniqID).append('<div class="sticky-note" rel="'+uniqID+'">'+note+"</div>");var height=$("#"+uniqID).height();$("#"+uniqID).css("height",height);$("#"+uniqID).slideDown(settings.speed);display=true}$(".sticky").ready(function(){if(settings.autoclose){$("#"+uniqID).delay(settings.autoclose).fadeOut(settings.speed)}});$(".sticky-close").click(function(){$("#"+$(this).attr("rel")).dequeue().fadeOut(settings.speed)});var response={id:uniqID,duplicate:duplicate,displayed:display,position:position};if(callback){callback(response)}else{return(response)}}})(jQuery);