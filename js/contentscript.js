/*
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
*/

// How NoPlugin works
// 1 - The reloadDOM() function runs when the page is loaded or changes, and looks for plugin objects.
// 2 - Plugin objects and embeds are passed to the replaceObject() and replaceEmbed() functions respectively, which parse information from the objects/embeds including size, ID, CSS styles, etc
// 3- Both replaceObject() and replaceEmbed() pass the data to injectPlayer(), which replaces the plugin HTML with either an HTML5 player if the media is supported or a prompt to download it

function findURL(url){
	var img = document.createElement('img');
	img.src = url; // Set string url
	url = img.src; // Get qualified url
	img.src = null; // No server request
	return url;
}

var helpbar = 0;

function injectHelp() {
	// Show warning for NoPlugin
	if ($(".NoPlugin-popup").length) {
		// The popup was already created by another instance, so don't do it again
	} else {
		// Try to get existing margin
		if (($("body").css("marginTop")) && (helpbar === 0)) {
			console.log($("body").css("marginTop"));
			margin = $("body").css("marginTop").replace("px", "");
			margin = parseInt(margin) + 37;
			console.log("new margin is " + margin);
		} else {
			margin = 37;
		}
		$("body").append('<!-- Begin NoPlugin popup --><style>body {margin-top: ' + margin + 'px !important;}</style><div class="noplugin-popup"><span class="noplugin-message">NoPlugin loaded plugin content on this page.</span><a href="https://github.com/corbindavenport/noplugin/wiki/Report-a-page-broken" target="_blank">Not working?</a></div><!-- End NoPlugin popup -->');
		helpbar = 1;
	}
}

function injectPlayer(object, id, url, width, height, cssclass, cssstyles, name) {
	// Replace embed with HTML5 video player
	var oldembed = $(object).prop('outerHTML').toString();
	if ((url.endsWith('.mp4')) || (url.endsWith('.mp3')) || (url.endsWith('.m4a')) || (url.endsWith('.wav'))) {
		$(object).replaceWith('<div name="' + name + '" class="noplugin + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="noplugin-content">This page is trying to load plugin content here. You can try to load the content with NoPlugin, but it might not work.<br /><br /><button type="button" title="' + url + '">Show content</button></div></div><video class="nopluginvideo" id="video' + id + '" controls name="' + name + '" class="noplugin + ' + cssclass + '" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><source src="' + url + '"><!-- Original embed code: ' + oldembed + ' --></video>');
		$("video[id$='video" + id + "']").css("display", "none");
		$(document).on('click', 'button[title="' + url + '"]', function(){
			$("video[id$='video" + id + "']").css("display", "block");
			$("div[id$='alert" + id + "']").attr('style','display:none !important');
		});
	} else {
		$(object).replaceWith('<div name="' + name + '" class="noplugin + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="noplugin-content">This page is trying to load plugin content here. Click to open it in your media player.<br /><br /><button type="button" title="' + url + '">Open content</button><br /><br /><a href="https://github.com/corbindavenport/noplugin/wiki/Why-cant-NoPlugin-play-a-video%3F" target="_blank">More info</a></div><!-- Original embed code: ' + oldembed + ' --></div>');
		$(document).on('click', 'button[title="' + url + '"]', function(){
			// Pass URL to background.js for browser to download and open video
			chrome.runtime.sendMessage({method: "saveVideo", key: url}, function(response) {
				$('button[title="' + url + '"]').prop("disabled",true);
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
	var url = findURL(object.attr("src"));
	// Find attributes of object
	if (object.is("[width]")) {
		var width = $(object).attr("width");
	} else {
		var width = object.width();
	}
	if (object.is("[height]")) {
		var height = $(object).attr("height");
	} else {
		var height = object.height();
	}
	if (object.is("[class]")) {
		var cssclass = $(object).attr("class");
	} else {
		var cssclass = "";
	}
	if (object.is("[style]")) {
		var cssstyles = $(object).attr("style");
	} else {
		var cssstyles = "";
	}
	if (object.is("[name]")) {
		var name = $(object).attr("name");
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
		var url = findURL($(object).attr("data"));
	} else if (object.find("param[name$='src']").length) {
		var url = findURL($(object).find("param[name$='src']").val());
	} else {
		return;
	}
	// Find attributes of object
	if (object.is("[width]")) {
		var width = $(object).attr("width");
	} else {
		var width = object.width();
	}
	if (object.is("[height]")) {
		var height = $(object).attr("height");
	} else {
		var height = object.height();
	}
	if (object.is("[class]")) {
		var cssclass = $(object).attr("class");
	} else {
		var cssclass = "";
	}
	if (object.is("[style]")) {
		var cssstyles = $(object).attr("style");
	} else {
		var cssstyles = "";
	}
	if (object.is("[name]")) {
		var name = $(object).attr("name");
	} else {
		var name = "";
	}
	injectPlayer(object, id, url, width, height, cssclass, cssstyles, name);
	injectHelp();
}

function reloadDOM() {
	// This function goes through every <object> and <embed> on the page and replaces it with a NoPlugin object. For browsers that support plugins, it checks if the original plugin is installed, and if available, uses that instead.
	// MIME types from www.freeformatter.com/mime-types-list.html

	// QuickTime Player
	$("object[type='video/quicktime'],object[codebase='http://www.apple.com/qtactivex/qtplugin.cab'],object[classid='clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B']").each(function() {
		if ($.inArray('QuickTime', navigator.plugins) > -1) {
			console.log("[NoPlugin] QuickTime plugin detected, will not replace embed.");
		} else {
			replaceObject($(this));
		}
	});
	$("embed[type='video/quicktime'],embed[src$='.mov'],embed[src$='.qt']").each(function() {
		if ($.inArray('QuickTime', navigator.plugins) > -1) {
			console.log("[NoPlugin] QuickTime plugin detected, will not replace embed.");
		} else {
			replaceEmbed($(this));
		}
	});
	// RealPlayer
	$("object[type='application/vnd.rn-realmedia'],object[type='audio/x-pn-realaudio'],object[type='audio/x-pn-realaudio-plugin'],object[classid='clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA']").each(function() {
		if ($.inArray('Real', navigator.plugins) > -1) {
			console.log("[NoPlugin] RealPlayer plugin detected, will not replace embed.");
		} else {
			replaceObject($(this));
		}
	});
	$("embed[type='application/vnd.rn-realmedia'],embed[type='audio/x-pn-realaudio'],embed[type='audio/x-pn-realaudio-plugin'],embed[classid='clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA'],embed[src$='.ram'],embed[src$='.rmp'],embed[src$='.rm']").each(function() {
		if ($.inArray('Real', navigator.plugins) > -1) {
			console.log("[NoPlugin] RealPlayer plugin detected, will not replace embed.");
		} else {
			replaceEmbed($(this));
		}
	});
	// Windows Media Player
	$("object[type='video/x-ms-wm'],object[type='audio/x-ms-wma'],object[type='audio/x-ms-wmv'],object[type='application/x-mplayer2'],object[classid='clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95'],object[codebase^='http://activex.microsoft.com/activex/controls/mplayer'],object[pluginspage^='http://www.microsoft.com']").each(function() {
		if ($.inArray('Windows Media Player', navigator.plugins) > -1) {
			console.log("[NoPlugin] Windows Media Player plugin detected, will not replace embed.");
		} else {
			replaceObject($(this));
		}
	});
	$("embed[type='video/x-ms-wm'],embed[type='audio/x-ms-wma'],embed[type='audio/x-ms-wmv'],embed[type='application/x-mplayer2'],embed[classid='clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95'],embed[pluginspage^='http://www.microsoft.com'],embed[src$='.wm'],embed[src$='.wma'],embed[src$='.wmv']").each(function() {
		if ($.inArray('Windows Media Player', navigator.plugins) > -1) {
			console.log("[NoPlugin] Windows Media Player plugin detected, will not replace embed.");
		} else {
			replaceEmbed($(this));
		}
	});
}

// Initialize tooltips for initial page load
$( document ).ready(function() {
	reloadDOM();
});

// Initialize tooltips every time DOM is modified
var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		console.log("[NoPlugin] DOM change detected, looking for embeds again");
		reloadDOM();
	});
});

var observerConfig = {
	attributes: true,
	childList: true,
	characterData: true
};

observer.observe(document, observerConfig);