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
]

// Generate regexes
const globalSiteBlockList = new RegExp(siteBlocks.join('|'), 'i')
const globalEmbedBlockList = new RegExp(embedBlocks.join('|'), 'i')