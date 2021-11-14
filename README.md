# NoPlugin is now discontinued, see [this blog post](https://blog.corbin.io/post/667791666532483072/ending-development-of-noplugin) for more information.

NoPlugin is the missing compatibility layer for modern web browers, allowing you to view most legacy content designed for browser plugins like Adobe Flash, QuickTime, and Windows Media Player. All browsers have phrased out the use of browser plugins, due to performance and security problems, so NoPlugin was created to maintain some compatibility with outdated/archived sites.

NoPlugin searches webpages for embedded plugin objects and converts them into native player elements, wherever possible. If the content can't be played in-browser (e.g. most Flash embeds), NoPlugin will help you download the file and play it in a separate application.

[![Download for Chrome](https://corbin.io/img/chrome-button.png)](https://chrome.google.com/webstore/detail/noplugin-previously-quick/llpahfhchhlfdigfpeimeagojnkgeice) [![Download for Firefox](https://corbin.io/img/firefox-button.png)](https://addons.mozilla.org/en-US/firefox/addon/noplugin/)

## Fully supported players

These embedded players are converted into HTML5 automatically by NoPlugin.

- [YouTube](https://youtube.com) Flash embeds
- [Twitch](https://twitch.tv) Flash embeds
- [Vimeo](https://vimeo.com) Flash embeds
- [Zanorg Player](https://radio.zanorg.com/zplayer_eng.htm) embeds
- [Viddler](viddler.com) Flash embeds

## Partially supported players

These embedded players sometimes contain files that can't play inside the browser. In cases where the file isn't supported by the browser, NoPlugin displays steps for opening the file in a separate application (like Windows Media Player, VLC, or Adobe Flash Projector).

- QuickTime Player embeds
- Windows Media Player embeds
- RealPlayer embeds
- VLC Plugin embeds
- Media streams (`mms://`, `rtsp://`, `.ram`)
- Miscellaneous Flash embeds

## Compatibility Mode

NoPlugin has an optional Compatibility Mode, accessible by right-clicking on a page and clicking 'Toggle NoPlugin Compatibility Mode' (or by adding `?noplugin_compat=true` to a tab's URL). This changes some behaviors, listed below.

- Modifies values for `navigator.plugins` and `navigator.mimeTypes` to trick some pages into thinking Flash player is availalable, to bypass some "Flash is not installed" errors
- Creates a shim API for [flashembed.js](https://github.com/jquerytools/jquerytools/blob/master/src/toolbox/toolbox.flashembed.js)
