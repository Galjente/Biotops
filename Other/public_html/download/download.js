$(document).ready(function() {
var uagent = navigator.userAgent.toLowerCase();
function detect() {
        var uagent = navigator.userAgent.toLowerCase();
        var mobile = false;
        var device;
        var search_strings = ["iphone", "ipod", "ipad", "series60", "symbian", "android", "windows ce", "windows7phone", "w7p", "blackberry", "palm"];
        for (i in search_strings) {
            if (uagent.search(search_strings[i]) > -1) {
             mobile = true;
             device = search_strings[i];
            }
        }
        return device;
    }
    
    if (detect() == "android") {
    window.location = "https://play.google.com/store/apps/"}
      else if (detect() == "iphone" || detect() == "ipad") {
    window.location = "https://www.apple.com/lae/ios/app-store";
    }  
});