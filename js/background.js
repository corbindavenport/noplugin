// Function for generating UUID for analytics
// Source: https://stackoverflow.com/a/2117523
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

// Welcome page
chrome.storage.local.get(function (data) {
  // Show welcome page on new version
  if (data.version) {
    if (!(data.version === chrome.runtime.getManifest().version)) {
      chrome.tabs.create({ 'url': chrome.extension.getURL('welcome.html') })
      chrome.storage.local.set({
        version: chrome.runtime.getManifest().version
      })
    }
  } else {
    chrome.tabs.create({ 'url': chrome.extension.getURL('welcome.html') })
    chrome.storage.local.set({
      version: chrome.runtime.getManifest().version
    })
  }
  // Generate UUID for analytics
  if (!data.uuid) {
    var uuid = uuidv4()
    chrome.storage.local.set({
      uuid: uuid
    })
  }
})

// Keep track of downloads that NoPlugin has already sent notifications for
var downloadsAlreadyNotified = []

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == 'getPlatform') { // Send system info to content script
    chrome.runtime.getPlatformInfo(function (info) {
      sendResponse(info.os)
    })
  } else if (request.method == 'saveVideo') { // Download and open videos that can"t be played in HTML5 player
    var videoID
    var myNotificationID
    chrome.downloads.download({
      url: request.key,
    }, function (downloadId) {
      videoID = downloadId
    })
    chrome.downloads.onChanged.addListener(function (obj) {
      if (obj.hasOwnProperty('state') && obj.state.current === 'complete') {
        chrome.downloads.search({ id: videoID }, function (items) {
          var filename = items[0].url.split('/').pop() // Get name of file
          if (!downloadsAlreadyNotified.includes(filename)) { // Don"t send multiple notifications for the same file
            console.log('[NoPlugin] Notification for ' + filename + ' triggered, MIME is ' + items[0].mime)
            downloadsAlreadyNotified.push(filename)
            // Trim filename to fit in notification
            if (filename.length > 20) {
              filename = filename.substring(0, 20) + '...'
            }
            if (navigator.userAgent.includes('OPR')) {
              // Opera doesn"t support notification buttons, but it does support opening the download by clicking on the notification
              chrome.notifications.create('', {
                type: 'basic',
                title: 'NoPlugin',
                message: filename + ' has finished downloading. Click here to open it.',
                iconUrl: 'img/icon128.png'
              }, function (id) {
                myNotificationID = id
                if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError.message)
                }
              })
              chrome.notifications.onClicked.addListener(function (notifId, btnIdx) {
                if (notifId === myNotificationID) {
                  chrome.downloads.open(videoID)
                }
              })
            } else if (navigator.userAgent.includes('Firefox')) {
              // Firefox doesn"t support notification buttons or opening a download from the notification
              browser.notifications.create('', {
                type: 'basic',
                title: 'NoPlugin',
                message: filename + ' has finished downloading. If you cannot open the file, download VLC Media Player.',
              }, function (id) {
                myNotificationID = id
                if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError.message)
                }
              })
            } else {
              // Chrome supports notification buttons and opening a download from the notification
              chrome.notifications.create('', {
                type: 'basic',
                requireInteraction: true,
                title: 'NoPlugin',
                message: filename + ' has finished downloading. If you cannot open the file, download VLC Media Player.',
                iconUrl: 'img/icon128.png',
                buttons: [{
                  title: 'Open file'
                }, {
                  title: 'Download VLC'
                }]
              }, function (id) {
                myNotificationID = id
                if (chrome.runtime.lastError) {
                  console.error(chrome.runtime.lastError.message)
                }
              })
              chrome.notifications.onButtonClicked.addListener(function (notifId, btnIdx) {
                if (notifId === myNotificationID) {
                  // Open downloaded media
                  if (btnIdx === 0) {
                    chrome.downloads.open(videoID)
                  } else {
                    // Download VLC for user's operating system
                    chrome.runtime.getPlatformInfo(function (info) {
                      if (info.os === 'mac') {
                        // Mac OS X download
                        chrome.tabs.create({ url: 'http://www.videolan.org/vlc/download-macosx.html' })
                      } else if (info.os === 'win') {
                        // Windows download
                        chrome.tabs.create({ url: 'http://www.videolan.org/vlc/download-windows.html' })
                      } else if (info.os === 'cros') {
                        // Chrome OS download
                        chrome.tabs.create({ url: 'market://details?id=org.videolan.vlc' })
                      } else {
                        // Other downloads
                        chrome.tabs.create({ url: 'http://www.videolan.org/vlc/#download' })
                      }
                    })
                  }
                }
              })
            }
          }
        })
      }
    })
  } else {
    sendResponse({})
  }
})