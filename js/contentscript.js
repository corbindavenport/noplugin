/*
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
*/

// How NoPlugin works
// 1 - The reloadDOM() function runs when the page is loaded or changes, and looks for plugin objects.
// 2 - Plugin objects and embeds are passed to the replaceObject() and replaceEmbed() functions respectively, which parse information from the objects/embeds including size, ID, CSS styles, etc
// 3- Both replaceObject() and replaceEmbed() pass the data to injectPlayer(), which replaces the plugin HTML with either an HTML5 player if the media is supported or a prompt to download it

function findURL(url) {
  var img = document.createElement('img');
  img.src = url; // Set string url
  url = img.src; // Get qualified url
  img.src = null; // No server request
  return url;
}

var helpbar = 0;

function injectHelp() {
  // Show warning for NoPlugin
  if ($(".noplugin-popup").length) {
    // The popup was already created by another instance, so don't do it again
  } else {
    // Try to get existing margin
    if (($("body").css("marginTop")) && (helpbar === 0)) {
      margin = $("body").css("marginTop").replace("px", "");
      margin = parseInt(margin) + 36;
    } else {
      margin = 36;
    }
    // Inject toolbar
    $("body").prepend('<!-- Begin NoPlugin popup --><style>body {margin-top: ' + margin + 'px !important;}</style><div class="noplugin-popup"><span class="noplugin-popup-message">NoPlugin has loaded plugin content on this page.</span><button type="button" id="noplugin-broken-button" aria-label="NoPlugin not working?">Not working?</button></div><!-- End NoPlugin popup -->');
    // Add event listener for button
    $(document).on('click', '#noplugin-broken-button', function () {
      // TODO: Fix error
      chrome.tabs.create({ url: "https://github.com/corbindavenport/noplugin/wiki/Report-a-page-broken" });
    });
    helpbar = 1;
  }
}

// Opens a media stream with a local application
function openStream(url, type) {
  // Determine the user's operating system
  chrome.runtime.sendMessage({ method: "getPlatform", key: "os" }, function (response) {
    // The user shouldn't need VLC Media Player for MMS streams if they are running Windows, becausee they should already have Windows Media Player
    if ((response === "win") && url.includes('mms://')) {
      alert("Choose Windows Media Player (or another video player capable of opening " + type + " streams) on the next pop-up.")
      window.open(url, '_self');
      // Directly opening the stream might not work on Chrome OS, so the user has to copy and paste it manually into VLC Media Player
    } else if (response === "cros") {
      if (confirm("Do you have VLC Media Player installed?\n\nPress 'OK' for Yes, or 'Cancel' for No.")) {
        prompt("NoPlugin cannot automatically open this stream in VLC, due to limitations with Chrome OS.\n\nYou have to open VLC, select 'Stream' from the side menu, and paste this:", url)
      } else {
        // Help the user install VLC Media Player
        if (confirm('Would you like to download VLC Media Player? It might be able to play this stream.')) {
          if (confirm("Last question - does your Chromebook have the Google Play Store? Press 'OK' for Yes, or 'Cancel' for No.")) {
            window.open("market://details?id=org.videolan.vlc", "_blank");
          } else {
            window.open("https://chrome.google.com/webstore/detail/vlc/obpdeolnggmbekmklghapmfpnfhpcndf?hl=en", "_blank");
          }
        }
      }
      // For other operating systems, the user can open the stream with whatever they have installed, or NoPlugin can offer to download VLC for them
    } else {
      if (confirm("Do you have VLC Media Player (or another video player capable of opening " + type + " streams) installed?\n\nPress 'OK' for Yes, or 'Cancel' for No.")) {
        alert('Choose your video player on the next pop-up.');
        window.open(url, '_self');
      } else {
        if (confirm('Would you like to download VLC Media Player? It might be able to play this stream.')) {
          // Download VLC for user's operating system
          if (response === "win") {
            // Mac OS X download
            window.open("http://www.videolan.org/vlc/download-windows.html", "_blank");
          } else if (response === "mac") {
            // Mac OS X download
            window.open("http://www.videolan.org/vlc/download-macosx.html", "_blank");
          } else {
            // Other downloads
            window.open("http://www.videolan.org/vlc/#download", "_blank");
          }
        }
      }
    }
  });
}

function injectPlayer(object, id, url, width, height, cssclass, cssstyles, name) {
  if (url == null) {
    $(object).replaceWith('<div name="' + name + '" class="noplugin + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="noplugin-content">This page is trying to load plugin content here, but NoPlugin could not detect the URL.');
  } else if (url.includes('mms://')) {
    // Detect MMS links and open them in a local media player
    $(object).replaceWith('<div name="' + name + '" class="noplugin + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="noplugin-content">This page is trying to load a Windows Media Player stream here. Click to open it in your media player.<br /><br /><button type="button" title="' + url + '">Open video stream</button></div></div><video class="nopluginvideo" id="video' + id + '" controls name="' + name + '" class="noplugin + ' + cssclass + '" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><source src="' + url + '"></video>');
    $("video[id$='video" + id + "']").css("display", "none");
    $(document).on('click', 'button[title="' + url + '"]', function () {
      openStream(url, "MMS");
    });
  } else if (url.includes('rtsp://')) {
    // Detect RTSP links and open them in a local media player
    $(object).replaceWith('<div name="' + name + '" class="noplugin + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="noplugin-content">This page is trying to load an RTSP stream here. Click to open it in your media player.<br /><br /><button type="button" title="' + url + '">Open video stream</button></div></div><video class="nopluginvideo" id="video' + id + '" controls name="' + name + '" class="noplugin + ' + cssclass + '" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><source src="' + url + '"></video>');
    $("video[id$='video" + id + "']").css("display", "none");
    $(document).on('click', 'button[title="' + url + '"]', function () {
      openStream(url, "RTSP");
    });
  } else if (url.endsWith('.mp4')) {
    // Play supported video files in browser
    $(object).replaceWith('<div name="' + name + '" class="noplugin + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="noplugin-content">This page is trying to load plugin content here. NoPlugin is able to play this media in the browser.<br /><br /><button type="button" title="' + url + '">Show content</button></div></div><video class="nopluginvideo" id="video' + id + '" controls name="' + name + '" class="noplugin + ' + cssclass + '" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><source src="' + url + '"></video>');
    $("video[id$='video" + id + "']").css("display", "none");
    $(document).on('click', 'button[title="' + url + '"]', function () {
      $("video[id$='video" + id + "']").css("display", "block");
      $("div[id$='alert" + id + "']").attr('style', 'display:none !important');
      $("video[id$='video" + id + "']").get(0).play();
    });
    // Play supported audio files in browser
    // Most plugin audio embeds have a small width, so some buttons on the HTML5 player are removed to make the seek bar as large as possible
  } else if ((url.endsWith('.mp3')) || (url.endsWith('.m4a')) || (url.endsWith('.wav'))) {
    $(object).replaceWith('<div><audio controlsList="nofullscreen nodownload" class="nopluginaudio" id="audio' + id + '" controls name="' + name + '" class="noplugin + ' + cssclass + '" style="' + cssstyles + ' width:' + width + 'px !important;"><source src="' + url + '"></audio></div>');
    // Open unsupported files in media player
  } else {
    $(object).replaceWith('<div name="' + name + '" class="noplugin + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="noplugin-content">This page is trying to load plugin content here. Click to open it in your media player.<br /><br /><button type="button" title="' + url + '">Download content</button><br /><br /><a href="https://github.com/corbindavenport/noplugin/wiki/Why-cant-NoPlugin-play-a-video%3F" target="_blank">More info</a></div></div>');
    $(document).on('click', 'button[title="' + url + '"]', function () {
      // Pass URL to background.js for browser to download and open video
      chrome.runtime.sendMessage({ method: "saveVideo", key: url }, function (response) {
        $('button[title="' + url + '"]').prop("disabled", true);
        $('button[title="' + url + '"]').html("Downloading media...");
      })
    });
  }
  console.log("[NoPlugin] Replaced plugin embed for " + url);
}

function replaceEmbed(object) {
  // Create ID for player
  var id = String(Math.floor((Math.random() * 1000000) + 1));
  // Find video source of object
  if (object.attr("qtsrc")) {
    var url = findURL(DOMPurify.sanitize(object.attr("qtsrc"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }));
  } else if (object.attr("href")) {
    var url = findURL(DOMPurify.sanitize(object.attr("href"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }));
  } else if (object.attr("src")) {
    var url = findURL(DOMPurify.sanitize(object.attr("src"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }));
  } else {
    var url = null;
  }
  // Find attributes of object
  if (object.is("[width]")) {
    var width = DOMPurify.sanitize($(object).attr("width"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true });
  } else {
    var width = object.width();
  }
  if (object.is("[height]")) {
    var height = DOMPurify.sanitize($(object).attr("height"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true });
  } else {
    var height = object.height();
  }
  if (object.is("[class]")) {
    var cssclass = DOMPurify.sanitize($(object).attr("class"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true });
  } else {
    var cssclass = "";
  }
  if (object.is("[style]")) {
    var cssstyles = DOMPurify.sanitize($(object).attr("style"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }) + ";";
  } else {
    var cssstyles = "";
  }
  if (object.is("[name]")) {
    var name = DOMPurify.sanitize($(object).attr("name"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true });
  } else {
    var name = "";
  }
  injectPlayer(object, id, url, width, height, cssclass, cssstyles, name);
  injectHelp();
}

function replaceObject(object) {
  // Create ID for player
  var id = String(Math.floor((Math.random() * 1000000) + 1));
  // Find video source of object
  if (object.is("[data]")) {
    var url = findURL(DOMPurify.sanitize($(object).attr("data"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }));
  } else if (object.find("param[name$='href'],param[name$='HREF']").length) {
    var url = findURL(DOMPurify.sanitize($(object).find("param[name$='href'],param[name$='HREF']").val(), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }));
  } else if (object.find("param[name$='src'],param[name$='SRC']").length) {
    var url = findURL(DOMPurify.sanitize($(object).find("param[name$='src'],param[name$='SRC']").val(), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }));
  } else if (object.find("embed").length && object.find("embed")[0].hasAttribute("src")) {
    var url = findURL(DOMPurify.sanitize($(object).find("embed").attr("src"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }));
  } else {
    var url = null;
  }
  // Find attributes of object
  if (object.is("[width]")) {
    var width = DOMPurify.sanitize($(object).attr("width"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true });
  } else {
    var width = object.width();
  }
  if (object.is("[height]")) {
    var height = DOMPurify.sanitize($(object).attr("height"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true });
  } else {
    var height = object.height();
  }
  if (object.is("[class]")) {
    var cssclass = DOMPurify.sanitize($(object).attr("class"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true });
  } else {
    var cssclass = "";
  }
  if (object.is("[style]")) {
    var cssstyles = DOMPurify.sanitize($(object).attr("style"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }) + ";";
  } else {
    var cssstyles = "";
  }
  if (object.is("[name]")) {
    var name = DOMPurify.sanitize($(object).attr("name"), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true });
  } else {
    var name = "";
  }
  injectPlayer(object, id, url, width, height, cssclass, cssstyles, name);
  injectHelp();
}

function replaceFrame(frame) {
  var url = DOMPurify.sanitize($(frame).attr("src"));
  // Replace old YouTube embeds
  if (url.includes("youtube.com/v/")) {
    var regex = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    var youtubeID = url.match(regex)[1];
    $(frame).attr("src", "https://www.youtube.com/embed/" + youtubeID);
    console.log("[NoPlugin] Replaced plugin embed for " + url);
  }
  injectHelp();
}

// This function goes through every <object> and <embed> on the page and replaces it with a NoPlugin object. For browsers that support plugins, it checks if the original plugin is installed, and if available, uses that instead.
// MIME types from www.freeformatter.com/mime-types-list.html
function reloadDOM() {
  var objectList = [
    /* QuickTime */
    "object[type='video/quicktime']",
    "object[codebase='http://www.apple.com/qtactivex/qtplugin.cab']",
    "object[classid='clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B']",
    "object[data$='.mov']",
    "object[data$='.qt']",
    /* RealPlayer */
    "object[type='application/vnd.rn-realmedia']",
    "object[type='audio/x-pn-realaudio']",
    "object[type='audio/x-pn-realaudio-plugin']",
    "object[classid='clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA']",
    /* Windows Media Player */
    "object[type='video/x-ms-wm']",
    "object[type='audio/x-ms-wma']",
    "object[type='audio/x-ms-wmv']",
    "object[type='application/x-mplayer2']",
    "object[classid='clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95']",
    "object[codebase^='http://activex.microsoft.com/activex/controls/mplayer']",
    "object[pluginspage^='http://www.microsoft.com']",
    /* VLC Plugin */
    "object[type='application/x-vlc-plugin']",
    "object[pluginspage='http://www.videolan.org']",
    "object[classid='clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921']",
    "object[codebase='http://download.videolan.org/pub/videolan/vlc/last/win32/axvlc.cab']"
  ];
  var embedList = [
    /* QuickTime */
    "embed[type='video/quicktime']",
    "embed[src$='.mov']",
    "embed[src$='.qt']",
    /* RealPlayer */
    "embed[type='application/vnd.rn-realmedia']",
    "embed[type='audio/x-pn-realaudio']",
    "embed[type='audio/x-pn-realaudio-plugin']",
    "embed[classid='clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA']",
    "embed[src$='.ram']",
    "embed[src$='.rmp']",
    "embed[src$='.rm']",
    /* Windows Media Player */
    "embed[type='video/x-ms-wm']",
    "embed[type='audio/x-ms-wma']",
    "embed[type='audio/x-ms-wmv']",
    "embed[type='application/x-mplayer2']",
    "embed[classid='clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95']",
    "embed[pluginspage^='http://www.microsoft.com']",
    "embed[src$='.wm']",
    "embed[src$='.wma']",
    "embed[src$='.wmv']",
    /* VLC Plugin */
    "embed[type='application/x-vlc-plugin']",
    "embed[pluginspage='http://www.videolan.org']"
  ];
  var frameList = [
    /* YouTube */
    "iframe[src*='youtube.com/v/']"
  ]
  // Replace objects
  var objects = objectList.toString()
  document.querySelectorAll(objects).forEach(function (item) {
    replaceObject($(item));
  });
  // Replace embeds
  var embeds = embedList.toString()
  document.querySelectorAll(embeds).forEach(function (item) {
    replaceEmbed($(item));
  });
  // Replace frames
  var frames = frameList.toString()
  document.querySelectorAll(frames).forEach(function (item) {
    replaceFrame($(item));
  });
}

// Initialize tooltips for initial page load
$(document).ready(function () {
  console.log("[NoPlugin] Searching for plugin objects...");
  reloadDOM();
});