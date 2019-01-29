chrome.runtime.onInstalled.addListener(function () {
  if (localStorage.getItem("version") != chrome.runtime.getManifest().version) {
    chrome.tabs.create({ 'url': chrome.extension.getURL('welcome.html') });
    localStorage["version"] = chrome.runtime.getManifest().version;
  }
  // Save operating system info to storage to avoid calling getPlatformInfo every time
  chrome.runtime.getPlatformInfo(function (info) {
    localStorage["platform"] = info.os;
    // Windows: win
    // Chrome OS: cros
  });
});

// Keep track of downloads that NoPlugin has already sent notifications for
var downloadsAlreadyNotified = [];

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == "getPlatform") { // Send system info to content script
    sendResponse(localStorage["platform"]);
  } else if (request.method == "saveVideo") { // Download and open videos that can't be played in HTML5 player
    var videoID;
    var myNotificationID;
    chrome.downloads.download({
      url: request.key,
    }, function (downloadId) {
      videoID = downloadId;
    });
    chrome.downloads.onChanged.addListener(function (obj) {
      if (obj.hasOwnProperty("state") && obj.state.current === "complete") {
        chrome.downloads.search({ id: videoID }, function (items) {
          var filename = items[0].url.split('/').pop(); // Get name of file
          if ($.inArray(filename, downloadsAlreadyNotified) === -1) { // Don't make multiple notifications for the same file
            console.log("[NoPlugin] Notification for " + filename + " triggered, MIME is " + items[0].mime);
            downloadsAlreadyNotified.push(filename);
            // Trim filename to fit in notification
            if (filename.length > 20) {
              filename = filename.substring(0, 20) + "..."
            }
            if (navigator.userAgent.includes("OPR")) {
              // Opera doesn't support notification buttons, but it does support opening the download by clicking on the notification
              chrome.notifications.create("", {
                type: "basic",
                title: "NoPlugin",
                message: filename + " has finished downloading. Click here to open it.",
                iconUrl: "img/icon128.png"
              }, function (id) {
                myNotificationID = id;
                if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError.message);
                }
              });
              chrome.notifications.onClicked.addListener(function (notifId, btnIdx) {
                if (notifId === myNotificationID) {
                  chrome.downloads.open(videoID);
                }
              });
            } else if (navigator.userAgent.includes("Firefox")) {
              // Firefox doesn't support notification buttons or opening a download from the notification
              browser.notifications.create("", {
                type: "basic",
                title: "NoPlugin",
                message: filename + " has finished downloading. If you cannot open the file, download VLC Media Player.",
              }, function (id) {
                myNotificationID = id;
                if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError.message);
                }
              });
            } else {
              // Chrome supports notification buttons and opening a download from the notification
              chrome.notifications.create("", {
                type: "basic",
                requireInteraction: true,
                title: "NoPlugin",
                message: filename + " has finished downloading. If you cannot open the file, download VLC Media Player.",
                iconUrl: "img/icon128.png",
                buttons: [{
                  title: "Open file"
                }, {
                  title: "Download VLC"
                }]
              }, function (id) {
                myNotificationID = id;
                if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError.message);
                }
              });
              chrome.notifications.onButtonClicked.addListener(function (notifId, btnIdx) {
                if (notifId === myNotificationID) {
                  // Open downloaded media
                  if (btnIdx === 0) {
                    if (localStorage["platform"] === "cros") {
                      // Check if the file can be played in Chrome OS' media player
                      var supported = (filename.includes(".mp4") || filename.includes(".m4a") || filename.includes(".mp3") || filename.includes(".ogv") || filename.includes(".ogm") || filename.includes(".ogg") || filename.includes(".oga") || filename.includes(".webm") || filename.includes(".wav"));
                      // Alert the user if Chrome OS can't play the file
                      if (!(supported)) {
                        alert("Chrome OS may not be able to play this file. If you have problems, open VLC Media Player and select the file from your Downloads folder.\n\nYou can download VLC from the 'Get VLC Media Player' button on the download notification.")
                      }
                    }
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
                      if (confirm("Does your Chromebook have the Google Play Store? Press 'OK' for Yes, or 'Cancel' for No.")) {
                        chrome.tabs.create({ url: "market://details?id=org.videolan.vlc" });
                      } else {
                        chrome.tabs.create({ url: "https://chrome.google.com/webstore/detail/vlc/obpdeolnggmbekmklghapmfpnfhpcndf?hl=en" });
                      }
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