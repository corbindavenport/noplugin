// How NoPlugin works
// 1 - The reloadDOM() function runs when the page is loaded or changes, and looks for plugin objects.
// 2 - Plugin objects and embeds are passed to the replaceObject() and replaceEmbed() functions respectively, which parse information from the objects/embeds including size, ID, CSS styles, etc
// 3- Both replaceObject() and replaceEmbed() pass the data to injectPlayer(), which replaces the plugin HTML with either an HTML5 player if the media is supported or a prompt to download it

function findURL(url) {
  // Fix for Internet Archive pages sometimes storing the media on another backup
  if (document.location.href.includes('//web.archive.org/') && !(url.includes('//web.archive.org/'))) {
    // Regex to grab current Web Archive date: https://regex101.com/r/4F12w7/2
    var regex = /(?:web\.archive\.org\/web\/)(\d*)/
    var date = regex.exec(document.location.href)[1]
    // Change URL to Internet Archive mirror
    // Append '_id' to the end of the date, so the Internet Archive returns the original file and not an HTML file
    url = 'https://web.archive.org/web/' + date + 'id_/' + url
  } else if (url.includes('//web.archive.org/')) {
    // TODO: Append _id to already fixed URL
  }
  var img = document.createElement('img')
  img.src = url // Set string url
  url = img.src // Get qualified url
  img.src = null // No server request
  return url
}

function injectHelp() {
  // Show warning for NoPlugin
  if (document.querySelector('.noplugin-popup')) {
    // The popup was already created by another instance, so don't do it again
  } else {
    // Try to get existing margin
    var bodyMargin = window.getComputedStyle(document.body, null).getPropertyValue('margin-top')
    // Make sure margin is a pixel value and isn't null
    if (bodyMargin && bodyMargin.includes('px')) {
      margin = bodyMargin.replace('px', '')
      margin = parseInt(margin) + 36
    } else {
      margin = 36
    }
    // Create popup
    var popup = document.createElement('div')
    popup.className = 'noplugin-popup'
    // Create popup message
    var popupMessage = document.createElement('span')
    popupMessage.className = 'noplugin-popup-message'
    popupMessage.innerText = 'NoPlugin has loaded plugin content on this page.'
    popup.appendChild(popupMessage)
    // Create popup button
    var popupButton = document.createElement('button')
    popupButton.type = 'button'
    popupButton.id = 'noplugin-broken-button'
    popupButton.textContent = 'Not working?'
    popupButton.addEventListener('click', function() {
      window.open(chrome.extension.getURL("bugreport.html") + '?url=' + encodeURIComponent(window.location), '_blank', 'height=300,width=500')
      //window.open('mailto:noplugin@fire.fundersclub.com?subject=NoPlugin%20Bug%20Report&body=Web%20page%3A%20' + encodeURIComponent(window.location) + '%0A%0ADescribe%20the%20issue%3A', '_self')
    })
    popup.appendChild(popupButton)
    // Create CSS styles for body margin
    var popupStyles = document.createElement('style')
    popupStyles.textContent = 'body {margin-top: ' + margin + 'px !important;}'
    popup.appendChild(popupStyles)
    // Insert popup into <body>
    document.body.prepend(popup)
  }
}

// Opens a media stream with a local application
function openStream(url) {
  // Determine the user's operating system
  chrome.runtime.sendMessage({ method: 'getPlatform', key: 'os' }, function (response) {
    if ((response === 'win') && url.includes('mms://')) {
       // The user shouldn't need VLC Media Player for MMS streams if they are running Windows, becausee they should already have Windows Media Player
      alert('Choose Windows Media Player on the next pop-up.')
      window.open(url, '_self')
    } else if (response === 'cros') {
      // Directly opening the stream might not work on Chrome OS, so the user has to copy and paste it manually into VLC Media Player
      if (confirm('Do you have VLC Media Player installed?\n\nPress "OK" for Yes, or "Cancel" for No.')) {
        prompt('NoPlugin cannot automatically open this stream in VLC. Open VLC, select "Stream" from the side menu, and paste this:', url)
      } else {
        // Help the user install VLC Media Player
        if (confirm('Would you like to download VLC Media Player? It might be able to play this stream.')) {
          if (confirm('Last question - does your Chromebook have the Google Play Store? Press "OK" for Yes, or "Cancel" for No.')) {
            window.open('market://details?id=org.videolan.vlc', '_blank')
          } else {
            window.open('https://chrome.google.com/webstore/detail/vlc/obpdeolnggmbekmklghapmfpnfhpcndf?hl=en', '_blank')
          }
        }
      }
    } else {
      // For other operating systems, the user can open the stream with whatever they have installed, or NoPlugin can offer to download VLC for them
      if (confirm('Do you have VLC Media Player installed?\n\nPress "OK" for Yes, or "Cancel" for No.')) {
        prompt('NoPlugin cannot automatically open this stream in VLC. Open VLC, click the "Media" menu at the top-left, select "Open Network Stream", and paste this:', url)
      } else {
        if (confirm('Would you like to download VLC Media Player? It might be able to play this stream.')) {
          // Download VLC for user's operating system
          if (response === 'win') {
            // Windows download
            window.open('http://www.videolan.org/vlc/download-windows.html', '_blank')
          } else if (response === 'mac') {
            // macOS download
            window.open('http://www.videolan.org/vlc/download-macosx.html', '_blank')
          } else {
            // Other downloads
            window.open('http://www.videolan.org/vlc/#download', '_blank')
          }
        }
      }
    }
  })
}

// Allow user to download files that failed to play in-browser
function playbackError(url) {
  if (confirm('This media cannot be played in your browser, due to missing video/audio codecs. Do you want to try downloading the media file instead?')) {
    // Pass URL to background.js for browser to download and open video
    chrome.runtime.sendMessage({ method: 'saveVideo', key: url })
  }
}

function injectPlayer(object, id, url, width, height, cssclass, cssstyles, name) {
  if (url == null) {
    // URL error
    // Create noplguin container
    var container = document.createElement('div')
    container.setAttribute('class', 'noplugin ' + cssclass)
    container.id = id
    container.align = 'center'
    container.setAttribute('style', cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;')
    // Create text content
    var content = document.createElement('div')
    content.className = 'noplugin-content'
    content.textContent = 'This page is trying to load plugin content here, but NoPlugin could not detect the media address.'
    // Write container to page
    container.appendChild(content)
    object.parentNode.replaceChild(container, object)
  } else if (url.includes('mms://') || url.includes('rtsp://')) {
    // Create noplguin container
    var container = document.createElement('div')
    container.setAttribute('class', 'noplugin ' + cssclass)
    container.id = id
    container.align = 'center'
    container.setAttribute('style', cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;')
    // Create text content
    var content = document.createElement('div')
    content.className = 'noplugin-content'
    content.textContent = 'This page is trying to load a video/audio stream here. You migh be able to play this with a media player.'
    content.appendChild(document.createElement('br'))
    // Create play button
    var playStreamButton = document.createElement('button')
    playStreamButton.type = 'button'
    playStreamButton.setAttribute('data-url', url)
    playStreamButton.textContent = 'Open stream'
    content.appendChild(playStreamButton)
    // Write container to page
    container.appendChild(content)
    object.parentNode.replaceChild(container, object)
    // Create eventListener for button
    playStreamButton.addEventListener('click', function() {
      openStream(url)
    })
  } else if ((url.endsWith('.mp3')) || (url.endsWith('.m4a')) || (url.endsWith('.wav'))) {
    // Play supported audio files in browser
    // Create basic container element
    var container = document.createElement('div')
    // Create audio player
    var mediaPlayer = document.createElement('audio')
    mediaPlayer.setAttribute('controlsList', 'nofullscreen nodownload')
    mediaPlayer.id = id
    mediaPlayer.controls = true
    mediaPlayer.name = name
    container.setAttribute('style', cssstyles + ' width:' + width + 'px !important; height:' + height + 'px !important;')
    container.appendChild(mediaPlayer)
    // Add source to audio player
    var source = document.createElement('source')
    source.src = url
    mediaPlayer.appendChild(source)
    // Write container to page
    object.parentNode.replaceChild(container, object)
  } else {
    // Attempt to play other formats (MP4, QuickTime, etc.) in browser
    // Create noplguin container
    var container = document.createElement('div')
    container.setAttribute('class', 'noplugin ' + cssclass)
    container.id = id
    container.align = 'center'
    container.setAttribute('style', cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;')
    // Create text content
    var content = document.createElement('div')
    content.className = 'noplugin-content'
    content.textContent = 'This page is trying to load plugin content here. NoPlugin may be able to play the media file.'
    content.appendChild(document.createElement('br'))
    // Create play button
    var playMediaButton = document.createElement('button')
    playMediaButton.type = 'button'
    playMediaButton.setAttribute('data-url', url)
    playMediaButton.textContent = 'Play media file'
    content.appendChild(playMediaButton)
    // Create video player
    var mediaPlayer = document.createElement('video')
    mediaPlayer.controls = true
    mediaPlayer.setAttribute('class', 'noplugin ' + cssclass)
    mediaPlayer.id = id
    mediaPlayer.setAttribute('style', cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;')
    // Add source to video player
    var source = document.createElement('source')
    source.src = url
    source.addEventListener('error', function(event) {
      if (event.type === 'error') {
        playbackError(url)
      }
    })
    // Write container to page
    container.appendChild(content)
    object.parentNode.replaceChild(container, object)
    // Create eventListener for button
    playMediaButton.addEventListener('click', function() {
      // Replace container element with video
      container.parentNode.replaceChild(mediaPlayer, container)
      // Load media in player
      mediaPlayer.appendChild(source)
      mediaPlayer.play()
    })
  }
  console.log('[NoPlugin] Replaced plugin embed for ' + url)
}

function replaceEmbed(object) {
  // Create ID for player
  var id = String(Math.floor((Math.random() * 1000000) + 1))
  // Find video source of object
  if (object.attr('qtsrc')) {
    var url = findURL(DOMPurify.sanitize(object.attr('qtsrc'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }))
  } else if (object.attr('href')) {
    var url = findURL(DOMPurify.sanitize(object.attr('href'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }))
  } else if (object.attr('src')) {
    var url = findURL(DOMPurify.sanitize(object.attr('src'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }))
  } else {
    var url = null
  }
  // Find attributes of object
  if (object.is('[width]')) {
    var width = DOMPurify.sanitize($(object).attr('width'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var width = object.width()
  }
  if (object.is('[height]')) {
    var height = DOMPurify.sanitize($(object).attr('height'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var height = object.height()
  }
  if (object.is('[class]')) {
    var cssclass = DOMPurify.sanitize($(object).attr('class'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var cssclass = ''
  }
  if (object.is('[style]')) {
    var cssstyles = DOMPurify.sanitize($(object).attr('style'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }) + ';'
  } else {
    var cssstyles = ''
  }
  if (object.is('[name]')) {
    var name = DOMPurify.sanitize($(object).attr('name'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var name = ''
  }
  injectPlayer(object, id, url, width, height, cssclass, cssstyles, name)
  injectHelp()
}

function replaceObject(object) {
  object = object[0] // tempt convert jQuery object to DOM
  // Create ID for player
  var id = String(Math.floor((Math.random() * 1000000) + 1))
  // Find video source of object
  if (object.hasAttribute('data')) {
    // <object data="url"></object>
    var url = object.getAttribute('data')
  } else if (object.querySelector('param[name="HREF" i]')) {
    // <object><param name="href" value="url"></object>
    var url = object.querySelector('param[name="HREF" i]').getAttribute('value')
  } else if (object.querySelector('param[name="SRC" i]')) {
    // <object><param name="src" value="url"></object>
    var url = object.querySelector('param[name="SRC" i]').getAttribute('value')
  } else if (object.querySelector('embed').getAttribute('src')) {
    // <object><embed src="url"></object>
    var url = object.querySelector('embed').getAttribute('src')
  } else if (object.querySelector('embed').getAttribute('target')) {
    // <object><embed target="url"></object>
    var url = object.querySelector('embed').getAttribute('target')
  } else {
    var url = null
  }
  if ((url != null) && (url != undefined)) {
    // Get exact URL
    url = findURL(url)
    // Sanitize URL
    url = DOMPurify.sanitize(url, { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true })
  }
  // Find attributes of object
  object = $(object) // temp for testing
  if (object.is('[width]')) {
    var width = DOMPurify.sanitize($(object).attr('width'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var width = object.width()
  }
  if (object.is('[height]')) {
    var height = DOMPurify.sanitize($(object).attr('height'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var height = object.height()
  }
  if (object.is('[class]')) {
    var cssclass = DOMPurify.sanitize($(object).attr('class'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var cssclass = ''
  }
  if (object.is('[style]')) {
    var cssstyles = DOMPurify.sanitize($(object).attr('style'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true }) + ';'
  } else {
    var cssstyles = ''
  }
  if (object.is('[name]')) {
    var name = DOMPurify.sanitize($(object).attr('name'), { SAFE_FOR_JQUERY: true, ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var name = ''
  }
  object = object[0] // temp for testing
  injectPlayer(object, id, url, width, height, cssclass, cssstyles, name)
  injectHelp()
}

function replaceFrame(frame) {
  var url = DOMPurify.sanitize($(frame).attr('src'))
  // Replace old YouTube embeds
  if (url.includes('youtube.com/v/')) {
    var regex = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/
    var youtubeID = url.match(regex)[1]
    $(frame).attr('src', 'https://www.youtube.com/embed/' + youtubeID)
    console.log('[NoPlugin] Replaced plugin embed for ' + url)
  }
  injectHelp()
}

// This function goes through every <object> and <embed> on the page and replaces it with a NoPlugin object. For browsers that support plugins, it checks if the original plugin is installed, and if available, uses that instead.
// MIME types from www.freeformatter.com/mime-types-list.html
function reloadDOM() {
  var objectList = [
    /* QuickTime */
    'object[type="video/quicktime"]',
    'object[codebase="http://www.apple.com/qtactivex/qtplugin.cab"]',
    'object[classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B"]',
    'object[data$=".mov"]',
    'object[data$=".qt"]',
    /* RealPlayer */
    'object[type="application/vnd.rn-realmedia"]',
    'object[type="audio/x-pn-realaudio"]',
    'object[type="audio/x-pn-realaudio-plugin"]',
    'object[classid="clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA"]',
    /* Windows Media Player */
    'object[type="video/x-ms-wm"]',
    'object[type="audio/x-ms-wma"]',
    'object[type="audio/x-ms-wmv"]',
    'object[type="application/x-mplayer2"]',
    'object[classid="clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95"]',
    'object[codebase^="http://activex.microsoft.com/activex/controls/mplayer"]',
    'object[pluginspage^="http://www.microsoft.com"]',
    /* VLC Plugin */
    'object[type="application/x-vlc-plugin"]',
    'object[pluginspage="http://www.videolan.org"]',
    'object[classid="clsid:9BE31822-FDAD-461B-AD51-BE1D1C159921"]',
    'object[codebase="http://download.videolan.org/pub/videolan/vlc/last/win32/axvlc.cab"]'
  ]
  var embedList = [
    /* QuickTime */
    'embed[type="video/quicktime"]',
    'embed[src$=".mov"]',
    'embed[src$=".qt"]',
    'embed[classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B"]',
    /* RealPlayer */
    'embed[type="application/vnd.rn-realmedia"]',
    'embed[type="audio/x-pn-realaudio"]',
    'embed[type="audio/x-pn-realaudio-plugin"]',
    'embed[classid="clsid:CFCDAA03-8BE4-11cf-B84B-0020AFBBCCFA"]',
    'embed[src$=".ram"]',
    'embed[src$=".rmp"]',
    'embed[src$=".rm"]',
    /* Windows Media Player */
    'embed[type="video/x-ms-wm"]',
    'embed[type="audio/x-ms-wma"]',
    'embed[type="audio/x-ms-wmv"]',
    'embed[type="application/x-mplayer2"]',
    'embed[classid="clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95"]',
    'embed[pluginspage^="http://www.microsoft.com"]',
    'embed[src$=".wm"]',
    'embed[src$=".wma"]',
    'embed[src$=".wmv"]',
    /* VLC Plugin */
    'embed[type="application/x-vlc-plugin"]',
    'embed[pluginspage="http://www.videolan.org"]'
  ]
  var frameList = [
    /* YouTube */
    'iframe[src*="youtube.com/v/"]'
  ]
  // Replace objects
  var objects = objectList.toString()
  document.querySelectorAll(objects).forEach(function (item) {
    replaceObject($(item))
  })
  // Replace embeds
  var embeds = embedList.toString()
  document.querySelectorAll(embeds).forEach(function (item) {
    replaceEmbed($(item))
  })
  // Replace frames
  var frames = frameList.toString()
  document.querySelectorAll(frames).forEach(function (item) {
    replaceFrame($(item))
  })
}

// Initialize tooltips for initial page load
console.log('[NoPlugin] Searching for plugin objects...')
reloadDOM()