/*
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
*/

function findURL(url){
	var img = document.createElement('img');
	img.src = url; // Set string url
	url = img.src; // Get qualified url
	img.src = null; // No server request
	return url;
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
	// Replace embed with HTML5 video player
	var oldembed = String($(object).html());
	if ((url.endsWith('.mp4')) || (url.endsWith('.mp3')) || (url.endsWith('.m4a')) || (url.endsWith('.wav'))) {
		$(object).replaceWith('<div name="' + name + '" class="quickchrome + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="quickchromelogo"></div>This page is trying to load a QuickTime video here. You can try to load the content with QuickChrome, but it might not work.<br /><br /><button type="button" id="button' + id + '">Show content</button></div><video class="quickchromevideo" id="video' + id + '" controls width="' + width + '" height="' + height + '"><source src="' + url + '"><!-- Original embed code: ' + oldembed + ' --></video>');
		$("video[id$='video" + id + "']").css("display", "none");
	} else {
		$(object).replaceWith('<div name="' + name + '" class="quickchrome + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="quickchromelogo"></div>This page is trying to load a QuickTime video here. You can only download this and play it on your computer.<br /><br /><a href="' + url + '" download >Download content</a><a href="https://github.com/corbindavenport/quickchrome/wiki/Why-cant-QuickChrome-play-a-video%3F" target="_blank">More info</a></div><!-- Original embed code: ' + oldembed + ' -->');
	}
	console.log("[QuickChrome] Replaced QuickTime embed for " + url);
	$(document).on('click', "#button" + id, function() {
		$("video[id$='video" + id + "']").css("display", "block");
		$("div[id$='alert" + id + "']").css("display", "none");
	});
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
	// Replace object with HTML5 video player
	var oldembed = String($(object).html());
	if ((url.endsWith('.mp4')) || (url.endsWith('.mp3')) || (url.endsWith('.m4a')) || (url.endsWith('.wav'))) {
		$(object).replaceWith('<div name="' + name + '" class="quickchrome + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="quickchromelogo"></div>This page is trying to load a QuickTime video here. You can try to load the content with QuickChrome, but it might not work.<br /><br /><button type="button" id="button' + id + '">Show content</button></div><video class="quickchromevideo" id="video' + id + '" controls width="' + width + '" height="' + height + '"><source src="' + url + '"><!-- Original embed code: ' + oldembed + ' --></video>');
		$("video[id$='video" + id + "']").css("display", "none");
	} else {
		$(object).replaceWith('<div name="' + name + '" class="quickchrome + ' + cssclass + '" id="alert' + id + '" align="center" style="' + cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;"><div class="quickchromelogo"></div>This page is trying to load a QuickTime video here. You can only download this and play it on your computer.<br /><br /><a href="' + url + '" download >Download content</a><a href="https://github.com/corbindavenport/quickchrome/wiki/Why-cant-QuickChrome-play-a-video%3F" target="_blank">More info</a></div><!-- Original embed code: ' + oldembed + ' -->');
	}
	console.log("[QuickChrome] Replaced QuickTime embed for " + url);
	$(document).on('click', "#button" + id, function() {
		$("video[id$='video" + id + "']").css("display", "block");
		$("div[id$='alert" + id + "']").css("display", "none");
	});
}

function reloadDOM() {
	$("object[type='video/quicktime']").each(function() {
		replaceObject($(this));
	});
	$("object[codebase='http://www.apple.com/qtactivex/qtplugin.cab']").each(function() {
		replaceObject($(this));
	});
	$("object[classid='clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B']").each(function() {
		replaceObject($(this));
	});
	$("embed[type='video/quicktime']").each(function() {
		replaceEmbed($(this));
	});
	$("embed[src$='.mov']").each(function() {
		replaceEmbed($(this));
	});
}

// Initialize tooltips for initial page load
$( document ).ready(function() {
	reloadDOM();
});

// Initialize tooltips every time DOM is modified
var observer = new MutationObserver(function(mutations) {
	mutations.forEach(function(mutation) {
		console.log("[QuickChrome] DOM change detected, looking for embeds again");
		reloadDOM();
	});
});

var observerConfig = {
	attributes: true,
	childList: true,
	characterData: true
};

var targetNode = document.body;
observer.observe(targetNode, observerConfig);
