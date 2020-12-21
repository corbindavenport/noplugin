// Function for generating UUID for analytics
// Source: https://stackoverflow.com/a/2117523
function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

// Function for downloading VLC Media Player
function downloadVLC(platform) {
  if (platform === 'mac') {
    // macOS download
    chrome.tabs.create({ url: 'http://www.videolan.org/vlc/download-macosx.html' })
  } else if (platform === 'win') {
    // Windows download
    chrome.tabs.create({ url: 'http://www.videolan.org/vlc/download-windows.html' })
  } else if (platform === 'cros') {
    // Chrome OS download
    chrome.tabs.create({ url: 'market://details?id=org.videolan.vlc' })
  } else {
    // Other downloads
    chrome.tabs.create({ url: 'http://www.videolan.org/vlc/#download' })
  }
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

// Create context menu for compatibility mode
chrome.contextMenus.create({
  title: 'Toggle NoPlugin Compatibility Mode',
  contexts: ['page'],
  documentUrlPatterns: ['http://*/*', 'https://*/*'],
  id: 'toggle-compat-mode'
})
chrome.contextMenus.onClicked.addListener(function (itemData) {
  if (itemData.menuItemId == 'toggle-compat-mode') {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      var obj = new URL(tabs[0].url)
      if (obj.searchParams.has('noplugin_compat')) {
        obj.searchParams.delete('noplugin_compat')
      } else {
        obj.searchParams.append('noplugin_compat', 'true')
      }
      chrome.tabs.update(tabs[0].id, {url: obj.toString()})
    })
  }
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.method == 'getPlatform') {
    chrome.runtime.getPlatformInfo(function (info) {
      sendResponse(info[request.key])
    })
  } else if (request.method = 'downloadProjector') {
    // Set the URL
    var download = ''
    if (request.key === 'linux') {
      download = 'https://web.archive.org/web/20201122011204id_/https://fpdownload.macromedia.com/pub/flashplayer/updaters/32/flash_player_sa_linux.x86_64.tar.gz'
    } else if (request.key === 'mac') {
      download = 'https://web.archive.org/web/20201122011204id_/https://fpdownload.macromedia.com/pub/flashplayer/updaters/32/flashplayer_32_sa.dmg'
    } else if (request.key === 'windows') {
      download = 'https://web.archive.org/web/20201122011204id_/https://fpdownload.macromedia.com/pub/flashplayer/updaters/32/flashplayer_32_sa.exe'
    }
    chrome.downloads.download({
      url: download,
    }, function () {
      // Woo
    })
  } else {
    sendResponse({})
  }
  return true
})