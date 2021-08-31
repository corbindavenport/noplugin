// This is where NoPlugin stores its blacklists.

// URL patterns of sites that NoPlugin shouldn't run on
// Examples: Sites that heavily rely on Flash, sites that host tracking scripts
var siteBlocks = [
    //'^https:\/\/corbin.io', (for testing)
    '^https:\/\/www\.xfinity\.com\/stream', // Xfinity Stream (#70)
]

// URL patterns of files NoPlugin shouldn't load
// Examples: Tracking scripts, fallbacks for HTML5 players, etc.
var embedBlocks = [
    'fp.swf', // Tracking (#66)
    'visitCounter105.swf', // Used for tracking
    'VPAIDFlash.swf', // Broken DRM: https://docs.viblast.com/player/videojs-vast
    'pmfso.swf', // Security risk: https://github.com/offensive-security/exploitdb/blob/master/exploits/java/webapps/44634.txt#L63
    'ZeroClipboard.swf', // Security risk: https://www.acunetix.com/vulnerabilities/web/cross-site-scripting-vulnerability-in-zeroclipboard-swf/
]

// Generate regexes
const globalSiteBlockList = new RegExp(siteBlocks.join('|'), 'i')
const globalEmbedBlockList = new RegExp(embedBlocks.join('|'), 'i')