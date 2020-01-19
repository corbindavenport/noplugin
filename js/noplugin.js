/*

  How NoPlugin works:

  1 - The loadDOM() function runs when the page is loaded and looks for <embed> and <object> tags that match plugin content.
  2 - Plugin objects and embeds are passed to the replaceObject() and replaceEmbed() functions, respectively, which parse information from the objects/embeds including size, ID, CSS styles, etc
  3- Both replaceObject() and replaceEmbed() pass the data to injectPlayer(), which replaces the plugin HTML with either an HTML5 player if the media is supported or a prompt to download it

*/

// Detect Flash support
const flashSupported = navigator.plugins.namedItem('Shockwave Flash')

// YouTube ID regex
const youtubeRegex = /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/
// Regex for detecting livestream links https://regex101.com/r/So4qWf/1
const streamDetectRegex = /(\:\d{1,}$)|(\/$)/gm

// Find the full path of a given URL
function getFullURL(url) {
  // Fix URLs that start at the site root
  if (url.startsWith('/')) {
    url = window.location.protocol + "//" + window.location.host + url
  }
  // Regex to parse Internet Archive URLs: https://regex101.com/r/4F12w7/3
  var regex = /(?:web\.archive\.org\/web\/)(\d*)(\/)(.*)/
  // Fix Internet Archive links
  if (url.includes('//web.archive.org/')) {
    // Get date
    var date = regex.exec(url)[1]
    // Get original URL
    var originalURL = regex.exec(url)[3]
    // Append '_id' to the end of the date, so the Internet Archive returns the original file and not an HTML file
    url = 'https://web.archive.org/web/' + date + 'id_/' + originalURL
  }
  // Get full URL
  var img = document.createElement('img')
  img.src = url
  url = img.src
  img.src = null
  return url
}

// Function for placing popup windows roughly in the center of the screen
function createPopup(url) {
  // Set popup dimensions
  var windowWidth = 500
  var windowHeight = 350
  // Calculate screen position
  var posX = (window.screen.width / 2) - (windowWidth / 2)
  var posY = (window.screen.height / 2) - (windowHeight / 2) - 15 // Subtract 15 to compensate for address bar
  // Create the popup
  window.open(url, '_blank', 'toolbar=no,height=' + windowHeight + ',width=' + windowWidth + ',screenX=' + posX + ',screenY=' + posY)
}

// Insert 'NoPlugin has loaded plugin content on this page' toolbar
function injectHelp() {
  // Show warning for NoPlugin
  if (!document.querySelector('.noplugin-popup')) {
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
    popupButton.addEventListener('click', function () {
      createPopup(chrome.extension.getURL("bugreport.html") + '?url=' + encodeURIComponent(window.location))
    })
    popup.appendChild(popupButton)
    // Create CSS styles for body margin
    var popupStyles = document.createElement('style')
    popupStyles.textContent = 'body {margin-top: ' + margin + 'px !important;}'
    document.body.appendChild(popupStyles)
    // Insert popup into <body>
    document.body.prepend(popup)
  }
}

// Open Adobe Flash content with Flash Projector desktop software
function openInFlash(url) {
  // Determine the user's operating system
  chrome.runtime.sendMessage({ method: 'getPlatform', key: 'os' }, function (response) {
    if (response === 'win' || response === 'mac' || response === 'linux') {
      // Ask if Projector is installed
      if (confirm('Do you have Adobe Flash Projector installed?\n\nPress "OK" for Yes, or "Cancel" for No.')) {
        // Projector on Mac and Windows have the URL bar in a submenu
        if (response === 'win' || response === 'mac') {
          prompt('Open Flash Projector on your computer, click the File menu, select Open, and paste this in the text box:', url)
        } else {
          // Projector on Linux has the URL bar in the main window
          prompt('Open Flash Projector on your computer, and paste this in the URL box:', url)
        }
      } else {
        // Help the user install Flash Projector
        alert('The download page for Adobe Flash Projector will open in a new tab. Just click the "Download Flash Player projector" link for your platform (Windows, Mac, or Linux).')
        window.open('https://www.adobe.com/support/flashplayer/debug_downloads.html', '_blank')
      }
    } else {
      alert('Sorry, Adobe has not released Flash Projector for your operating system, so there is no way to play this content on your device. Projector is only availabe for Mac, Windows, and Linux.')
    }
  })
}

// Open a media stream/playlist with native media player
function openInPlayer(url) {
  // Determine the user's operating system
  chrome.runtime.sendMessage({ method: 'getPlatform', key: 'os' }, function (response) {
    console.log(response)
    if ((response === 'win') && url.includes('mms://')) {
      // If on Windows, open MMS streams with Windows Media Player
      alert('Select Windows Media Player on the next pop-up.')
      window.open(url, '_self')
    } else if ((response === 'win') && (url.endsWith('.asx') || url.endsWith('.wpl'))) {
      // If on Windows, open Windows Media playlists with Windows Media Player
      var message = 'Follow these steps to open this file:\n\n1. Open Windows Media Player from the Start Menu (search for "wmp").\n2. In Windows Media Player, press CTRL+U on your keyboard. The "Open URL" pop-up should appear.\n3. Paste the below address into the pop-up:'
      prompt(message, url)
    } else if (url.endsWith('.ram')) {
      // RealPlayer streams can only be played with RealPlayer
      var message = 'Follow these steps to open this file:\n\n1. Open RealPlayer on your computer.\n2. In RealPlayer, press CTRL+O on your keyboard. The "Open" pop-up should appear.\n3. Paste the below address into the pop-up:'
      prompt(message, url)
    } else if (response === 'cros') {
      // VLC Media Player is the only option for playing media streams on Chrome OS
      if (confirm('Do you have VLC Media Player installed?\n\nPress "OK" for Yes, or "Cancel" for No.')) {
        prompt('NoPlugin cannot automatically open this stream. Open VLC Media Player, select "Stream" from the side menu, and paste this:', url)
      } else {
        // Help the user install VLC Media Player
        if (confirm('Would you like to download VLC Media Player? It might be able to play this stream.')) {
          if (confirm('Last question: does your Chromebook have the Google Play Store? Press "OK" for Yes, or "Cancel" for No.')) {
            window.open('market://details?id=org.videolan.vlc', '_blank')
          } else {
            window.open('https://chrome.google.com/webstore/detail/vlc/obpdeolnggmbekmklghapmfpnfhpcndf?hl=en', '_blank')
          }
        }
      }
    } else {
      // For other operating systems, the user can open the stream with whatever they have installed, or NoPlugin can offer to download VLC for them
      if (confirm('Do you have VLC Media Player installed?\n\nPress "OK" for Yes, or "Cancel" for No.')) {
        prompt('NoPlugin cannot automatically open this stream. Open VLC Media Player, click the "Media" menu at the top-left, select "Open Network Stream", and paste this:', url)
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

// Process playlist files and return them as an array of media links
function parsePlaylist(url) {
  // Create synchronous HTTP request
  console.log('[NoPlugin] Attempting to read playlist file: ' + url)
  var xhr = new XMLHttpRequest()
  xhr.onerror = function () {
    // Return empty array
    return []
  }
  xhr.open('GET', url, false)
  xhr.send(null)
  // Access data
  if (xhr.status === 200) {
    // Create array of linked media files
    var array = []
    // Read the file
    if (url.endsWith('.asx')) {
      // Advanced Stream Redirector (ASX) files are in XML format
      // Documentation: http://www.streamalot.com/playlists.shtml
      var asx = document.createElement('div')
      asx.innerHTML = xhr.responseText
      // Check playlist is valid
      if (asx.querySelectorAll('ref').length === 0) {
        throw new Error('No <ref> tags found in ASX playlist file')
      }
      // Add each media file to array
      asx.querySelectorAll('ref').forEach(function (el) {
        try {
          var mediaUrl = DOMPurify.sanitize(el.getAttribute('href'), { ALLOW_UNKNOWN_PROTOCOLS: true })
        } catch {
          // Skip this <ref> tag if the URL can't be found
          return
        }
        // Check if the media file URLs are relative to the playlist's location
        if ((mediaUrl.includes('://')) || (mediaUrl.startsWith('/'))) {
          mediaUrl = getFullURL(mediaUrl)
        } else {
          // Re-create URL with full path before calling getFullURL()
          var path = url.substr(0, url.lastIndexOf("/"))
          mediaUrl = getFullURL(path + '/' + mediaUrl)
        }
        array.push(mediaUrl)
      })
    } else if (url.endsWith('.wpl')) {
      // Windows Media Player Playlist files are in XML format
      // Documentation: https://en.wikipedia.org/wiki/Windows_Media_Player_Playlist
      var wpl = document.createElement('div')
      wpl.innerHTML = xhr.responseText
      // Check playlist is valid
      if (asx.querySelectorAll('media').length === 0) {
        throw new Error('No <media> tags found in WPL playlist file')
      }
      // Add each media file to array
      wpl.querySelectorAll('media').forEach(function (el) {
        try {
          var mediaUrl = DOMPurify.sanitize(el.getAttribute('src'), { ALLOW_UNKNOWN_PROTOCOLS: true })
        } catch {
          // Skip this <media> tag if the URL can't be found
          return
        }
        // Check if the media file URLs are relative to the playlist's location
        if ((mediaUrl.includes('://')) || (mediaUrl.startsWith('/'))) {
          mediaUrl = getFullURL(mediaUrl)
        } else {
          // Re-create URL with full path before calling getFullURL()
          var path = url.substr(0, url.lastIndexOf("/"))
          mediaUrl = getFullURL(path + '/' + mediaUrl)
        }
        array.push(mediaUrl)
      })
    } else if (url.endsWith('.qtl')) {
      // QuickTime Link files are in XML format
      // Documentation: https://stackoverflow.com/a/25399903/2255592 and http://www.streamalot.com/playlists.shtml
      var qtl = document.createElement('div')
      qtl.innerHTML = xhr.responseText
      // Check playlist is valid
      if (qtl.querySelectorAll('embed').length === 0) {
        throw new Error('No <embed> tags found in QTL playlist file')
      }
      // Add each media file to array
      qtl.querySelectorAll('embed').forEach(function (el) {
        try {
          var mediaUrl = DOMPurify.sanitize(el.getAttribute('src'), { ALLOW_UNKNOWN_PROTOCOLS: true })
        } catch {
          // Skip this <embed> tag if the URL can't be found
          return
        }
        // Check if the media file URLs are relative to the playlist's location
        if ((mediaUrl.includes('://')) || (mediaUrl.startsWith('/'))) {
          mediaUrl = getFullURL(mediaUrl)
        } else {
          // Re-create URL with full path before calling getFullURL()
          var path = url.substr(0, url.lastIndexOf("/"))
          mediaUrl = getFullURL(path + '/' + mediaUrl)
        }
        array.push(mediaUrl)
      })
    } else if (url.endsWith('.m3u')) {
      // M3U files are just lists with links to files
      // Documentation: https://en.wikipedia.org/wiki/M3U#Examples and http://www.streamalot.com/playlists.shtml
      var m3u = xhr.responseText.split('\n')
      // Filter out empty lines and comments
      m3u = m3u.filter(s => s.replace(/\s+/g, '').length !== 0)
      m3u = m3u.filter(s => s.indexOf('#') !== 0)
      // Check playlist is valid
      if (m3u.length === 0) {
        throw new Error('No links found in M3U playlist file')
      }
      // Copy contents of playlist to main array
      array = m3u
    }
    // Return the array
    console.log('[NoPlugin] Identified playlist contents:', array)
    return array
  } else {
    throw new Error('Could not read playlist file')
  }
}

// Allow user to download files that failed to play in-browser
function playbackError(mediaPlayer, id, url, width, height, cssclass, cssstyles) {
  chrome.runtime.sendMessage({ method: 'getPlatform', key: 'os' }, function (response) {
    // Create new NoPlugin container
    var container = document.createElement('div')
    container.setAttribute('class', 'noplugin ' + cssclass)
    container.id = id
    container.align = 'center'
    container.setAttribute('style', cssstyles + ' width:' + (width - 10) + 'px !important; height:' + (height - 10) + 'px !important;')
    // Create text content
    var content = document.createElement('div')
    content.className = 'noplugin-content'
    content.textContent = 'This media file cannot be played in your browser. Do you want to try downloading the file instead?'
    content.appendChild(document.createElement('br'))
    // Create play button
    var downloadButton = document.createElement('button')
    downloadButton.type = 'button'
    downloadButton.textContent = 'Download media file'
    content.appendChild(downloadButton)
    content.appendChild(document.createElement('br'))
    // Create eventListener for play button
    downloadButton.addEventListener('click', function () {
      chrome.runtime.sendMessage({ method: 'saveVideo', key: url })
    })
    // Create VLC button for Chrome OS
    if (response === 'cros') {
      var vlcButton = document.createElement('button')
      vlcButton.type = 'button'
      vlcButton.textContent = 'Open with VLC for Android'
      content.appendChild(vlcButton)
      content.appendChild(document.createElement('br'))
      var newurl = url.replace(/^\/\/|^.*?:\/\//, '') // Remove protocol from URL
      var intenturl = 'intent://' + newurl + '#Intent;scheme=http;package=org.videolan.vlc;end'
      console.log('[NoPlugin] VLC intent URL set to: ' + intenturl)
      // Create eventListener for VLC button
      vlcButton.addEventListener('click', function () {
        window.open(intenturl, '_blank')
      })
    }
    // Create info button
    var infoButton = document.createElement('button')
    infoButton.textContent = "More info"
    content.appendChild(infoButton)
    // Create eventListener for info button
    infoButton.addEventListener('click', function () {
      createPopup(chrome.extension.getURL("media-info.html"))
    })
    // Write container to page
    container.appendChild(content)
    mediaPlayer.parentNode.replaceChild(container, mediaPlayer)
  })
}

// Replace plugin embeds with native players
function injectPlayer(object, media, mediaUrl) {
  if ((mediaUrl === '') || (mediaUrl === null)) {
    // There is a URL error
    var container = document.createElement('div')
    container.setAttribute('class', 'noplugin ' + media.cssClass)
    container.id = media.id
    container.align = 'center'
    container.setAttribute('style', media.cssStyles + ' width:' + (media.width - 10) + 'px !important; height:' + (media.height - 10) + 'px !important;')
    // Create text content
    var content = document.createElement('div')
    content.className = 'noplugin-content'
    content.textContent = 'This page is trying to load plugin content here, but NoPlugin could not detect the media address.'
    // Write container to page
    container.appendChild(content)
    object.parentNode.replaceChild(container, object)
    // Add message to console
    console.log('[NoPlugin] Replaced plugin embed but could not detect URL:', media)
  } else if (mediaUrl.includes('youtube.com/v/')) {
    // Old Flash-based YouTube embed
    var frame = document.createElement('iframe')
    frame.setAttribute('class', media.cssClass)
    frame.id = media.id
    frame.setAttribute('style', 'style', media.cssStyles + ' border: 0; width:' + media.width + 'px; height:' + media.height + 'px;')
    // Parse video ID and replace object
    var youtubeID = mediaUrl.match(youtubeRegex)[1]
    frame.setAttribute('src', 'https://www.youtube.com/embed/' + youtubeID)
    object.parentNode.replaceChild(frame, object)
    // Add message to console
    console.log('[NoPlugin] Replaced YouTube embed:', media)
  } else if (mediaUrl.includes('vimeo.com/moogaloop.swf')) {
    // Old Flash-based Vimeo embed
    var frame = document.createElement('iframe')
    frame.setAttribute('class', media.cssClass)
    frame.id = media.id
    frame.setAttribute('style', 'style', media.cssStyles + ' border: 0; width:' + media.width + 'px; height:' + media.height + 'px;')
    // Parse video ID and replace object
    var vimeoID = mediaUrl.split('clip_id=').pop().split('&')[0]
    frame.setAttribute('src', 'https://player.vimeo.com/video/' + vimeoID)
    object.parentNode.replaceChild(frame, object)
    // Add message to console
    console.log('[NoPlugin] Replaced Vimeo embed:', media)
  } else if (mediaUrl.includes('mms://') || mediaUrl.includes('rtsp://') || mediaUrl.endsWith('.ram') || streamDetectRegex.test(mediaUrl)) {
    // This is a media stream
    var container = document.createElement('div')
    container.setAttribute('class', 'noplugin ' + media.cssClass)
    container.id = media.id
    container.align = 'center'
    container.setAttribute('style', media.cssStyles + ' width:' + (media.width - 10) + 'px !important; height:' + (media.height - 10) + 'px !important;')
    // Create text content
    var content = document.createElement('div')
    content.className = 'noplugin-content'
    if (mediaUrl.endsWith('.ram')) {
      content.innerHTML = 'This page is trying to load a RealPlayer stream here. You will need <a href="http://www.oldversion.com/windows/realplayer-16-0-0-282" target="_blank">RealPlayer</a> to open this file.'
    } else {
      content.textContent = 'This page is trying to load a video/audio stream here. You might be able to play this with a media player.'
    }
    content.appendChild(document.createElement('br'))
    // Create play button
    var playStreamButton = document.createElement('button')
    playStreamButton.type = 'button'
    playStreamButton.setAttribute('data-url', mediaUrl)
    playStreamButton.textContent = 'Open stream'
    content.appendChild(playStreamButton)
    // Write container to page
    container.appendChild(content)
    object.parentNode.replaceChild(container, object)
    // Create eventListener for button
    playStreamButton.addEventListener('click', function () {
      openInPlayer(mediaUrl)
    })
    // Add message to console
    console.log('[NoPlugin] Replaced playlist embed:', media)
  } else if (mediaUrl.includes('.swf')) {
    // This is a Flash Player file
    var container = document.createElement('div')
    container.setAttribute('class', 'noplugin ' + media.cssClass)
    container.id = media.id
    container.align = 'center'
    container.setAttribute('style', media.cssStyles + ' width:' + (media.width - 10) + 'px !important; height:' + (media.height - 10) + 'px !important;')
    // Create text content
    var content = document.createElement('div')
    content.className = 'noplugin-content'
    content.textContent = 'This page is trying to load Adobe Flash here. You might be able to play this with Adobe Flash Projector.'
    content.appendChild(document.createElement('br'))
    // Create play button
    var playStreamButton = document.createElement('button')
    playStreamButton.type = 'button'
    playStreamButton.setAttribute('data-url', mediaUrl)
    playStreamButton.textContent = 'Open media'
    content.appendChild(playStreamButton)
    // Write container to page
    container.appendChild(content)
    object.parentNode.replaceChild(container, object)
    // Create eventListener for button
    playStreamButton.addEventListener('click', function () {
      openInFlash(mediaUrl)
    })
    // Add message to console
    console.log('[NoPlugin] Replaced Flash embed:', media)
  } else if (mediaUrl.endsWith('.asx') || mediaUrl.endsWith('.wpl') || mediaUrl.endsWith('.qtl') || mediaUrl.endsWith('.m3u')) {
    // This is a playlist file
    try {
      var mediaArray = parsePlaylist(mediaUrl)
    } catch (error) {
      // If the file is invalid/couldn't be reached, display an error
      var container = document.createElement('div')
      container.setAttribute('class', 'noplugin ' + media.cssClass)
      container.id = media.id
      container.align = 'center'
      container.setAttribute('style', media.cssStyles + ' width:' + (media.width - 10) + 'px !important; height:' + (media.height - 10) + 'px !important;')
      // Create text content
      var content = document.createElement('div')
      content.className = 'noplugin-content'
      content.textContent = 'This page is trying to load playlist of media files here, but the playlist is either invalid or could not be accessed by NoPlugin.'
      // Write container to page
      container.appendChild(content)
      object.parentNode.replaceChild(container, object)
      // Add message to console
      console.error('[NoPlugin] Error replacing playlist embed for ' + mediaUrl + ':', error)
    }
    if (mediaArray.length === 1) {
      // If there is only one item in the playlist, run the injectPlayer() function again with it as the new URL
      injectPlayer(object, media, mediaArray[0])
    } else {
      var container = document.createElement('div')
      container.setAttribute('class', 'noplugin ' + media.cssClass)
      container.id = media.id
      container.align = 'center'
      container.setAttribute('style', media.cssStyles + ' width:' + (media.width - 10) + 'px !important; height:' + (media.height - 10) + 'px !important;')
      // Create text content
      var content = document.createElement('div')
      content.className = 'noplugin-content'
      content.textContent = 'This page is trying to load playlist of media files here. You might be able to open the whole playlist with a media player, or you can see the individual files.'
      content.appendChild(document.createElement('br'))
      // Create play button
      var playPlaylistButton = document.createElement('button')
      playPlaylistButton.type = 'button'
      playPlaylistButton.setAttribute('data-url', mediaUrl)
      playPlaylistButton.textContent = 'Open playlist'
      playPlaylistButton.addEventListener('click', function () {
        openInPlayer(mediaUrl)
      })
      content.appendChild(playPlaylistButton)
      content.appendChild(document.createElement('br'))
      // Create list button
      var showPlayListButton = document.createElement('button')
      showPlayListButton.type = 'button'
      showPlayListButton.setAttribute('data-url', url)
      showPlayListButton.textContent = 'View playlist contents'
      showPlayListButton.addEventListener('click', function () {
        // Create urls paramter with comma-seperated list of playlist contents
        var params = '?urls='
        mediaArray.forEach(function (url) {
          params += encodeURIComponent(url) + ','
        })
        // Remove trailing comma
        params = params.substring(0, params.length - 1)
        createPopup(chrome.extension.getURL("playlist-viewer.html") + params)
      })
      content.appendChild(showPlayListButton)
      // Write container to page
      container.appendChild(content)
      object.parentNode.replaceChild(container, object)
      // Add message to console
      console.log('[NoPlugin] Replaced plugin embed:', media)
    }
  } else if ((mediaUrl.endsWith('.mp3')) || (mediaUrl.endsWith('.m4a')) || (mediaUrl.endsWith('.wav'))) {
    // This is an audio file
    var mediaPlayer = document.createElement('audio')
    mediaPlayer.setAttribute('controlsList', 'nofullscreen nodownload')
    mediaPlayer.id = media.id
    mediaPlayer.controls = true
    mediaPlayer.name = name
    mediaPlayer.setAttribute('style', media.cssStyles + ' width:' + media.width + 'px !important; height:' + media.height + 'px !important;')
    // Add source to audio player
    var source = document.createElement('source')
    source.src = mediaUrl
    mediaPlayer.appendChild(source)
    // Write container to page
    object.parentNode.replaceChild(mediaPlayer, object)
    // Add message to console
    console.log('[NoPlugin] Replaced audio embed:', media)
  } else {
    // Attempt to play other formats (MP4, FLV, QuickTime, etc.) in the browser
    var container = document.createElement('div')
    container.setAttribute('class', 'noplugin ' + media.cssClass)
    container.id = media.id
    container.align = 'center'
    container.setAttribute('style', media.cssStyles + ' width:' + (media.width - 10) + 'px !important; height:' + (media.height - 10) + 'px !important;')
    // Create text content
    var content = document.createElement('div')
    content.className = 'noplugin-content'
    content.textContent = 'This page is trying to load plugin content here. NoPlugin may be able to play the media file.'
    content.appendChild(document.createElement('br'))
    // Create play button
    var playMediaButton = document.createElement('button')
    playMediaButton.type = 'button'
    playMediaButton.setAttribute('data-url', mediaUrl)
    playMediaButton.textContent = 'Play media file'
    content.appendChild(playMediaButton)
    // Create video player
    var mediaPlayer = document.createElement('video')
    mediaPlayer.controls = true
    mediaPlayer.setAttribute('class', 'noplugin ' + media.cssClass)
    mediaPlayer.id = media.id
    mediaPlayer.setAttribute('style', media.cssStyles + ' width:' + (media.width - 10) + 'px !important; height:' + (media.height - 10) + 'px !important;')
    // Add source to video player
    var source = document.createElement('source')
    source.src = mediaUrl
    source.addEventListener('error', function (event) {
      if (event.type === 'error') {
        playbackError(mediaPlayer, media.id, mediaUrl, media.width, media.height, media.cssClass, media.cssStyles)
      }
    })
    // Write container to page
    container.appendChild(content)
    object.parentNode.replaceChild(container, object)
    // Create eventListener for button
    playMediaButton.addEventListener('click', function () {
      // Replace container element with video
      container.parentNode.replaceChild(mediaPlayer, container)
      // Load media in player
      mediaPlayer.appendChild(source)
      mediaPlayer.play()
    })
    // Add message to console
    console.log('[NoPlugin] Replaced plugin embed:', media)
  }
}

// Parse <embed> tag attributes and pass data to injectPlayer()
function replaceEmbed(object) {
  // Find video sources
  var links = []
  if (object.hasAttribute('qtsrc')) {
    // <object qtsrc="url"></object>
    var url = DOMPurify.sanitize(object.getAttribute('qtsrc'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    url = getFullURL(url)
    links.push(url)
  }
  if (object.hasAttribute('href')) {
    // <object href="url"></object>
    var url = DOMPurify.sanitize(object.getAttribute('href'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    url = getFullURL(url)
    links.push(url)
  }
  if (object.hasAttribute('src')) {
    // <object src="url"></object>
    var url = DOMPurify.sanitize(object.getAttribute('src'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    url = getFullURL(url)
    links.push(url)
  }
  // Find attributes of object
  if (object.hasAttribute('width')) {
    var width = DOMPurify.sanitize(object.getAttribute('width'), { ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var width = 'auto'
  }
  if (object.hasAttribute('height')) {
    var height = DOMPurify.sanitize(object.getAttribute('height'), { ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var height = 'auto'
  }
  if (object.hasAttribute('class')) {
    var cssclass = DOMPurify.sanitize(object.getAttribute('class'), { ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var cssclass = ''
  }
  if (object.hasAttribute('id')) {
    var id = DOMPurify.sanitize(object.getAttribute('id'), { ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var id = ''
  }
  if (object.hasAttribute('style')) {
    var cssstyles = DOMPurify.sanitize(object.getAttribute('style'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    // Add semi-colon to end of styles if not already present
    if (!cssstyles.endsWith(';')) {
      cssstyles = cssstyles + ';'
    }
  } else {
    var cssstyles = ''
  }
  if (object.hasAttribute('name')) {
    var name = DOMPurify.sanitize(object.getAttribute('name'), { ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var name = ''
  }
  // Add Flash variables to end of URLs
  if (object.hasAttribute('FlashVars')) {
    var flashVars = DOMPurify.sanitize(object.getAttribute('FlashVars'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    flashVars = flashVars.replace(/&amp;/g, '&') // Fix DOMPurify breaking & characters
    links.forEach(function (link) {
      link = link + '?' + flashVars
    })
  }
  // Remove duplicate URLs
  links = [...new Set(links)]
  // Inject the player
  injectPlayer(object, {
    id: id,
    links: links,
    width: width,
    height: height,
    cssClass: cssclass,
    cssStyles: cssstyles,
    name: name
  }, links[0])
  injectHelp()
}

// Parse <object> tag attributes and pass data to injectPlayer()
function replaceObject(object) {
  // Find video sources
  var links = []
  if (object.hasAttribute('data')) {
    // <object data="url"></object>
    var url = DOMPurify.sanitize(object.getAttribute('data'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    url = getFullURL(url)
    links.push(url)
  }
  if (object.querySelector('param[name="MOVIE" i]')) {
    // <object><param name="movie" value="url"></object>
    var url = DOMPurify.sanitize(object.querySelector('param[name="MOVIE" i]').getAttribute('value'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    url = getFullURL(url)
    links.push(url)
  }
  if (object.querySelector('param[name="HREF" i]')) {
    // <object><param name="href" value="url"></object>
    var url = DOMPurify.sanitize(object.querySelector('param[name="HREF" i]').getAttribute('value'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    url = getFullURL(url)
    links.push(url)
  }
  if (object.querySelector('param[name="SRC" i]')) {
    // <object><param name="src" value="url"></object>
    var url = DOMPurify.sanitize(object.querySelector('param[name="SRC" i]').getAttribute('value'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    url = getFullURL(url)
    links.push(url)
  }
  if (object.querySelector('embed') && object.querySelector('embed').getAttribute('src')) {
    // <object><embed src="url"></object>
    var url = DOMPurify.sanitize(object.querySelector('embed').getAttribute('src'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    url = getFullURL(url)
    links.push(url)
  }
  if (object.querySelector('embed') && object.querySelector('embed').getAttribute('target')) {
    // <object><embed target="url"></object>
    var url = DOMPurify.sanitize(object.querySelector('embed').getAttribute('target'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    url = getFullURL(url)
    links.push(url)
  }
  // Find attributes of object
  if (object.hasAttribute('width')) {
    var width = DOMPurify.sanitize(object.getAttribute('width'), { ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var width = 'auto'
  }
  if (object.hasAttribute('height')) {
    var height = DOMPurify.sanitize(object.getAttribute('height'), { ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var height = 'auto'
  }
  if (object.hasAttribute('class')) {
    var cssclass = DOMPurify.sanitize(object.getAttribute('class'), { ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var cssclass = ''
  }
  if (object.hasAttribute('style')) {
    var cssstyles = DOMPurify.sanitize(object.getAttribute('style'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    // Add semi-colon to end of styles if not already present
    if (!cssstyles.endsWith(';')) {
      cssstyles = cssstyles + ';'
    }
  } else {
    var cssstyles = ''
  }
  if (object.hasAttribute('id')) {
    var id = DOMPurify.sanitize(object.getAttribute('id'), { ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var id = ''
  }
  if (object.hasAttribute('name')) {
    var name = DOMPurify.sanitize(object.getAttribute('name'), { ALLOW_UNKNOWN_PROTOCOLS: true })
  } else {
    var name = ''
  }
  // Add Flash variables to end of URLs
  if (object.hasAttribute('FlashVars')) {
    var flashVars = DOMPurify.sanitize(object.getAttribute('FlashVars'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    flashVars = flashVars.replace(/&amp;/g, '&') // Fix DOMPurify breaking & characters
    links.forEach(function (link) {
      link = link + '?' + flashVars
    })
  } else if (object.querySelector('param[name="FLASHVARS" i]')) {
    var flashVars = DOMPurify.sanitize(object.querySelector('param[name="FLASHVARS" i]').getAttribute('value'), { ALLOW_UNKNOWN_PROTOCOLS: true })
    flashVars = flashVars.replace(/&amp;/g, '&') // Fix DOMPurify breaking & characters
    links.forEach(function (link) {
      link = link + '?' + flashVars
    })
  }
  // Remove duplicate URLs
  links = [...new Set(links)]
  // Inject the player
  injectPlayer(object, {
    id: id,
    links: links,
    width: width,
    height: height,
    cssClass: cssclass,
    cssStyles: cssstyles,
    name: name
  }, links[0])
  injectHelp()
}

// Replace URLs for specific <frame> and <iframe> embeds
function replaceFrame(frame) {
  var url = DOMPurify.sanitize(frame.getAttribute('src'), { ALLOW_UNKNOWN_PROTOCOLS: true })
  // Replace old YouTube embeds
  if (url.includes('youtube.com/v/')) {
    var youtubeID = url.match(youtubeRegex)[1]
    frame.setAttribute('src', 'https://www.youtube.com/embed/' + youtubeID)
    console.log('[NoPlugin] Replaced frame embed for ' + url)
  }
  injectHelp()
}

// Detect possible plugin/frame objects and pass elements to replaceObject(), replaceEmbed(), and replaceFrame()
function loadDOM() {
  var objectList = [
    /* QuickTime */
    'object[type="video/quicktime"]',
    'object[type="application/x-quicktimeplayer"]',
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
    'object[type="video/x-ms-wmv"]',
    'object[type="video/x-msvideo"]',
    'object[type="audio/x-ms-wma"]',
    'object[type="audio/x-ms-wmv"]',
    'object[type="application/x-mplayer2"]',
    'object[type="application/vnd.ms-wpl"]',
    'object[type="video/x-ms-asf"]',
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
    'embed[type="application/x-quicktimeplayer"]',
    'embed[src$=".mov"]',
    'embed[src$=".qt"]',
    'embed[src$=".qtl"]',
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
    'embed[type="video/x-ms-wmv"]',
    'embed[type="video/x-msvideo"]',
    'embed[type="video/x-ms-wm"]',
    'embed[type="audio/x-ms-wma"]',
    'embed[type="audio/x-ms-wmv"]',
    'embed[type="application/x-mplayer2"]',
    'embed[type="application/vnd.ms-wpl"]',
    'embed[classid="clsid:22d6f312-b0f6-11d0-94ab-0080c74c7e95"]',
    'embed[pluginspage^="http://www.microsoft.com"]',
    'embed[src$=".wm"]',
    'embed[src$=".wma"]',
    'embed[src$=".wmv"]',
    'embed[src$=".wpl"]',
    'embed[src$=".asx"]',
    /* VLC Plugin */
    'embed[type="application/x-vlc-plugin"]',
    'embed[pluginspage="http://www.videolan.org"]',
    /* Generic */
    'embed[src$=".m3u"]'
  ]
  var frameList = [
    /* YouTube */
    'iframe[src*="youtube.com/v/"]',
    'frame[src*="youtube.com/v/"]'
  ]
  // Detect Flash objects and embeds if the real Flash plugin is unavailable
  if (!flashSupported) {
    var flashObjectList = [
      'object[classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"]',
      'object[codebase*="download.macromedia.com/pub/shockwave"]',
      'object[type="application/x-shockwave-flash"]',
      'object[src$=".swf"]',
      'object[src$=".flv"]'
    ]
    var flashEmbedList = [
      'embed[classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"]',
      'embed[codebase*="download.macromedia.com/pub/shockwave"]',
      'embed[type="application/x-shockwave-flash"]',
      'embed[src$=".swf"]',
      'embed[src$=".flv"]'
    ]
    objectList = objectList.concat(flashObjectList)
    embedList = embedList.concat(flashEmbedList)
  }
  // Replace objects
  var objects = objectList.toString()
  document.querySelectorAll(objects).forEach(function (item) {
    replaceObject(item)
  })
  // Replace embeds
  var embeds = embedList.toString()
  document.querySelectorAll(embeds).forEach(function (item) {
    replaceEmbed(item)
  })
  // Replace frames
  var frames = frameList.toString()
  document.querySelectorAll(frames).forEach(function (item) {
    replaceFrame(item)
  })
}

// Initialize NoPlugin on page load
console.log('[NoPlugin] Searching for plugin objects...')
loadDOM()