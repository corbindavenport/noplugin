// Add version number to welcome page
document.querySelector('.version').innerHTML = chrome.runtime.getManifest().version

//Show instructions for leaving a review based on the browser being used
var useragent = navigator.userAgent;

// Opera has to be checked before Chrome, because Opera has both "Chrome" and "OPR" in the user agent string
var review = document.querySelector('.review-info')
if (useragent.includes("OPR")) {
  review.innerHTML = 'Leaving a review on the <a href="https://addons.opera.com/en/extensions/details/noplugin/" target="_blank">Opera add-ons site</a> is also greatly appreciated!'
} else if (navigator.userAgent.includes("Firefox")) {
  review.innerHTML = 'Leaving a review on the <a href="https://addons.mozilla.org/en-US/firefox/addon/noplugin/" target="_blank">Firefox add-ons site</a> is also greatly appreciated!'
} else if (useragent.includes("Chrome")) {
  review.innerHTML = 'Leaving a review on the <a href="https://chrome.google.com/webstore/detail/noplugin/llpahfhchhlfdigfpeimeagojnkgeice" target="_blank">Chrome Web Store</a> is also greatly appreciated!'
}

// Download button for VLC
document.querySelector('.vlc-btn').addEventListener('click', function () {
  // Get the OS from background.js
  chrome.runtime.sendMessage({ method: 'getPlatform', key: 'os' }, function (response) {
    if (localStorage['platform'] === 'mac') {
      // Mac OS X download
      chrome.tabs.create({ url: 'http://www.videolan.org/vlc/download-macosx.html' });
    } else if (localStorage['platform'] === 'win') {
      // Windows download
      chrome.tabs.create({ url: 'http://www.videolan.org/vlc/download-windows.html' });
    } else if (localStorage['platform'] === 'cros') {
      // Chrome OS download
      if (confirm('Does your Chromebook have the Google Play Store? Press "OK" for Yes, or "Cancel" for No.')) {
        chrome.tabs.create({ url: 'market://details?id=org.videolan.vlc' });
      } else {
        chrome.tabs.create({ url: 'https://chrome.google.com/webstore/detail/vlc/obpdeolnggmbekmklghapmfpnfhpcndf?hl=en' });
      }
    } else {
      // Other downloads
      chrome.tabs.create({ url: 'http://www.videolan.org/vlc/#download' })
    }
  })
})