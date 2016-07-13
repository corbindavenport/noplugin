/*
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
*/

chrome.runtime.onInstalled.addListener(function(details) {
	if (localStorage.getItem("version") != chrome.runtime.getManifest().version) {
		chrome.tabs.create({'url': chrome.extension.getURL('welcome.html')});
		localStorage["version"] = chrome.runtime.getManifest().version;
	}
});

// Download and open videos that can't be played in HTML5 player

var downloadsAlreadyNotified = [];

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.method == "saveVideo") {
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
									if (navigator.userAgent.indexOf("OPR") !== -1) {
										// Opera doesn't support notifications with buttons
										chrome.notifications.create("", {
											type: "basic",
											requireInteraction: true,
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
															if (navigator.platform.indexOf('Mac') > -1) {
																// Mac OS X download
																chrome.tabs.create({ url: "http://www.videolan.org/vlc/download-macosx.html" });
															} else if (navigator.platform.indexOf('Win') > -1) {
																// Windows download
																chrome.tabs.create({ url: "http://www.videolan.org/vlc/download-windows.html" });
															} else if (navigator.platform.indexOf('CrOS') > -1) {
																// Chrome OS download
																chrome.tabs.create({ url: "https://chrome.google.com/webstore/detail/vlc/obpdeolnggmbekmklghapmfpnfhpcndf?hl=en" });
															}else {
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
