/*
The MIT License (MIT)

Copyright (c) 2017 Corbin Davenport

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

chrome.runtime.onInstalled.addListener(function() {
	if (localStorage.getItem("version") != chrome.runtime.getManifest().version) {
		chrome.tabs.create({'url': chrome.extension.getURL('welcome.html')});
		localStorage["version"] = chrome.runtime.getManifest().version;
	}
	// Save operating system info to storage to avoid calling getPlatformInfo every time
	chrome.runtime.getPlatformInfo(function(info) {
		localStorage["platform"] = info.os;
		// Windows: win
		// Chrome OS: cros
	});
});

// Keep track of downloads that NoPlugin has already sent notifications for
var downloadsAlreadyNotified = [];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.method == "getPlatform") { // Send system info to content script
		sendResponse(localStorage["platform"]);
	} else if (request.method == "saveVideo") { // Download and open videos that can't be played in HTML5 player
		var videoID;
		var myNotificationID;
		chrome.downloads.download({
			url: request.key,
		}, function(downloadId) {
			videoID = downloadId;
		});
		chrome.downloads.onChanged.addListener(function(obj) {
				if (obj.hasOwnProperty("state") && obj.state.current === "complete") {
						chrome.downloads.search({id: videoID}, function(items) {
								var filename = items[0].url.split('/').pop(); // Get name of file
								if ($.inArray(filename,downloadsAlreadyNotified) === -1) { // Don't make multiple notifications for the same file
									console.log("[NoPlugin] Notification for " + filename + " triggered, MIME is " + items[0].mime);
									downloadsAlreadyNotified.push(filename);
									// Trim filename to fit in notification
									if (filename.length > 20) {
										filename = filename.substring(0, 20) + "..."
									}
									if ((navigator.userAgent.indexOf("OPR") !== -1) || (navigator.userAgent.indexOf("Firefox") !== -1)) {
										// Opera and Firefox do not support notifications with buttons
										chrome.notifications.create("", {
											type: "basic",
											title: "NoPlugin",
											message: filename + " has finished downloading. If you cannot open the file, download VLC Media Player.",
											iconUrl: "img/icon128.png"
										}, function(id) {
											myNotificationID = id;
											if(chrome.runtime.lastError) {
												console.error(chrome.runtime.lastError.message);
											}
										}); 
									} else {
										chrome.notifications.create("", {
											type: "basic",
											requireInteraction: true,
											title: "NoPlugin",
											message: filename + " has finished downloading. If you cannot open the file, download VLC Media Player.",
											iconUrl: "img/icon128.png",
											buttons: [{
													title: "Open file on your computer",
													iconUrl: "/img/notification-file.png"
											},{
													title: "Get VLC Media Player",
													iconUrl: "/img/notification-vlc.png"
											}]
										}, function(id) {
											myNotificationID = id;
											if(chrome.runtime.lastError) {
												console.error(chrome.runtime.lastError.message);
											}
										});
										chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
												if (notifId === myNotificationID) {
														if (btnIdx === 0) {
																// Open downloaded media
																chrome.downloads.open(videoID);
														} else {
															// Download VLC for user's operating system
															if (localStorage["platform"] === "mac") {
																// Mac OS X download
																chrome.tabs.create({ url: "http://www.videolan.org/vlc/download-macosx.html" });
															} else if (localStorage["platform"] === "win") {
																// Windows download
																chrome.tabs.create({ url: "http://www.videolan.org/vlc/download-windows.html" });
															} else if (localStorage["platform"] === "cros") {
																// Chrome OS download
																chrome.tabs.create({ url: "https://chrome.google.com/webstore/detail/vlc/obpdeolnggmbekmklghapmfpnfhpcndf?hl=en" });
																// Replace with market://details?id=org.videolan.vlc for Chromebooks with the Play Store
															} else {
																// Other downloads
																chrome.tabs.create({ url: "http://www.videolan.org/vlc/#download" });
															}
														}
												}
										});
									}
								}
						});
				}
		});
	} else {
		sendResponse({});
	}
});
