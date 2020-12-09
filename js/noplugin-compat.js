alert('NoPlugin Compatibility Mode is now enabled for this page. Compatibility Mode tricks sites into thinking you have Adobe Flash Player and other plugins installed, allowing you to potentially view legacy plugin content. The mode may not work for all pages.\n\nCompatibility Mode will automatically turn off when you leave this page.')

if (!navigator.plugins.namedItem('Shockwave Flash')) {

    console.log('Compatibilty mode enabled.')

    // Credit: https://stackoverflow.com/a/23456845
    var actualCode = '(' + function () {
        'use strict'
        var navigator = window.navigator
        var modifiedNavigator
        if ('userAgent' in Navigator.prototype) {
            // Chrome 43+ moved all properties from navigator to the prototype,
            // so we have to modify the prototype instead of navigator.
            modifiedNavigator = Navigator.prototype
        } else {
            // Chrome 42- defined the property on navigator.
            modifiedNavigator = Object.create(navigator)
            Object.defineProperty(window, 'navigator', {
                value: modifiedNavigator,
                configurable: false,
                enumerable: false,
                writable: false
            })
        }

        // Define list of plugins and supported MIME types

        Object.defineProperties(modifiedNavigator, {
            plugins: {
                value: {
                    'Shockwave Flash': {
                        name: 'Shockwave Flash',
                        description: 'Shockwave Flash 50.0 r0 (NoPlugin)',
                        version: '50.0',
                        filename: 'NoPlugin'
                    },
                    'QuickTime Plug-in': {
                        name: 'QuickTime Plug-in 50.0',
                        description: 'Shockwave Flash 50.0 r0 (NoPlugin)',
                        version: '50.0',
                        filename: 'NoPlugin'
                    }
                },
                configurable: false,
                enumerable: true,
                writable: false
            }
        })

        // Define list of supported MIME types and their linked plugins

        Object.defineProperties(modifiedNavigator, {
            mimeTypes: {
                value: {
                    'application/x-shockwave-flash': {
                        type: 'application/x-shockwave-flash',
                        suffixes: 'swf',
                        description: 'Shockwave Flash',
                        enabledPlugin: navigator.plugins['Shockwave Flash']
                    },
                    'application/futuresplash': {
                        type: 'application/futuresplash',
                        suffixes: 'spl',
                        description: 'Shockwave Flash',
                        enabledPlugin: navigator.plugins['Shockwave Flash']
                    },
                    'video/mpeg': {
                        type: 'video/mpeg',
                        suffixes: 'mpeg,mpg,m1s,m1v,m1a,m75,m15,mp2,mpm,mpv,mpa',
                        description: 'MPEG media',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'video/x-mpeg': {
                        type: 'video/x-mpeg',
                        suffixes: 'mpeg,mpg,m1s,m1v,m1a,m75,m15,mp2,mpm,mpv,mpa',
                        description: 'MPEG media',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/mpeg': {
                        type: 'audio/mpeg',
                        suffixes: 'mpeg,mpg,m1s,m1a,mp2,mpm,mpa,m2a',
                        description: 'MPEG audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/x-mpeg': {
                        type: 'audio/x-mpeg',
                        suffixes: 'mpeg,mpg,m1s,m1a,mp2,mpm,mpa,m2a',
                        description: 'MPEG audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'video/3gpp': {
                        type: 'video/3gpp',
                        suffixes: '3gp,3gpp',
                        description: '3GPP media',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/3gpp': {
                        type: 'audio/3gpp',
                        suffixes: '3gp,3gpp',
                        description: '3GPP media',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'video/3gpp2': {
                        type: 'video/3gpp2',
                        suffixes: '3g2,3gp2',
                        description: '3GPP2 media',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/3gpp2': {
                        type: 'audio/3gpp2',
                        suffixes: '3g2,3gp2',
                        description: '3GPP2 media',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/x-gsm': {
                        type: 'audio/x-gsm',
                        suffixes: 'gsm',
                        description: 'GSM audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/amr': {
                        type: 'audio/amr',
                        suffixes: 'AMR',
                        description: 'AMR audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/aac': {
                        type: 'audio/aac',
                        suffixes: 'aac,adts',
                        description: 'AAC audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/x-aac': {
                        type: 'audio/x-aac',
                        suffixes: 'aac,adts',
                        description: 'AAC audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/x-m4a': {
                        type: 'audio/x-m4a',
                        suffixes: 'aac,adts',
                        description: 'AAC audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/x-m4p': {
                        type: 'audio/x-m4p',
                        suffixes: 'm4p',
                        description: 'AAC audio (protected)',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/x-m4b': {
                        type: 'audio/x-m4b',
                        suffixes: 'm4b',
                        description: 'AAC audio book',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/x-caf': {
                        type: 'audio/x-caf',
                        suffixes: 'caf',
                        description: 'CAF audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/ac3': {
                        type: 'audio/ac3',
                        suffixes: 'ac3',
                        description: 'AC3 audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/x-ac3': {
                        type: 'audio/x-ac3',
                        suffixes: 'ac3',
                        description: 'AC3 audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'image/jpeg2000': {
                        type: 'image/jpeg2000',
                        suffixes: 'jp2',
                        description: 'JPEG2000 image',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'image/jpeg2000-image': {
                        type: 'image/jpeg2000-image',
                        suffixes: 'jp2',
                        description: 'JPEG2000 image',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'image/x-jpeg2000-image': {
                        type: 'image/x-jpeg2000-image',
                        suffixes: 'jp2',
                        description: 'JPEG2000 image',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'image/jp2': {
                        type: 'image/jp2',
                        suffixes: 'jp2',
                        description: 'JPEG2000 image',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'video/x-m4v': {
                        type: 'video/x-m4v',
                        suffixes: 'm4v',
                        description: 'Video (protected)',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'image/x-macpaint': {
                        type: 'image/x-macpaint',
                        suffixes: 'pntg,pnt,mac',
                        description: 'MacPaint image',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'image/pict': {
                        type: 'image/pict',
                        suffixes: 'pict,pic,pct',
                        description: 'PCT image',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'image/x-pict': {
                        type: 'image/x-pict',
                        suffixes: 'pict,pic,pct',
                        description: 'PCT image',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'image/x-quicktime': {
                        type: 'image/x-quicktime',
                        suffixes: 'qtif,qti',
                        description: 'QuickTime image',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'image/x-sgi': {
                        type: 'image/x-sgi',
                        suffixes: 'sgi,rgb',
                        description: 'SGI image',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'image/x-targa': {
                        type: 'image/x-targa',
                        suffixes: 'targa,tga',
                        description: 'TGA image',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'image/x-targa': {
                        type: 'image/x-targa',
                        suffixes: 'targa,tga',
                        description: 'TGA image',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'video/sd-video': {
                        type: 'video/sd-video',
                        suffixes: 'sdv',
                        description: 'SD video',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'application/x-mpeg': {
                        type: 'application/x-mpeg',
                        suffixes: 'amc',
                        description: 'AMC media',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'video/mp4': {
                        type: 'video/mp4',
                        suffixes: 'mp4',
                        description: 'MPEG-4 media',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/mp4': {
                        type: 'audio/mp4',
                        suffixes: 'mp4',
                        description: 'MPEG-4 media',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/aiff': {
                        type: 'audio/aiff',
                        suffixes: 'aiff,aif,aifc,cdda',
                        description: 'AIFF audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/x-aiff': {
                        type: 'audio/x-aiff',
                        suffixes: 'aiff,aif,aifc,cdda',
                        description: 'AIFF audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/basic': {
                        type: 'audio/basic',
                        suffixes: 'au,snd,ulw',
                        description: 'uLaw/AU audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/mid': {
                        type: 'audio/mid',
                        suffixes: 'mid,midi,smf,kar',
                        description: 'MIDI',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/x-midi': {
                        type: 'audio/x-midi',
                        suffixes: 'mid,midi,smf,kar',
                        description: 'MIDI',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/midi': {
                        type: 'audio/midi',
                        suffixes: 'mid,midi,smf,kar',
                        description: 'MIDI',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/vnd.qcelp': {
                        type: 'audio/vnd.qcelp',
                        suffixes: 'qcp',
                        description: 'QUALCOMM PureVoice audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'application/sdp': {
                        type: 'application/sdp',
                        suffixes: 'sdp',
                        description: 'SDP stream descriptor',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'application/x-sdp': {
                        type: 'application/x-sdp',
                        suffixes: 'sdp',
                        description: 'SDP stream descriptor',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'application/x-rtsp': {
                        type: 'application/x-rtsp',
                        suffixes: 'rtsp,rts',
                        description: 'RTSP stream descriptor',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'video/quicktime': {
                        type: 'video/quicktime',
                        suffixes: 'mov,qt,mqv',
                        description: 'QuickTime Movie',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'video/flc': {
                        type: 'video/flc',
                        suffixes: 'flc,fli,cel',
                        description: 'AutoDesk Animator (FLC)',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/x-wav': {
                        type: 'audio/x-wav',
                        suffixes: 'wav,bwf',
                        description: 'WAVE audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },
                    'audio/wav': {
                        type: 'audio/wav',
                        suffixes: 'wav,bwf',
                        description: 'WAVE audio',
                        enabledPlugin: navigator.plugins['QuickTime Plug-in']
                    },

                },
                configurable: false,
                enumerable: true,
                writable: false
            },
            // Set user agent to Windows
            platform: {
                value: 'Win32',
                configurable: false,
                enumerable: true,
                writable: false
            },
            userAgent: {
                value: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
                configurable: false,
                enumerable: true,
                writable: false
            }
        })

        // Define functions for navigator.plugins
        Object.defineProperties(modifiedNavigator.plugins, {
            namedItem: {
                // The navigator.plugins.namedItem() function is used to obtain information about the plugin specified in the argument
                value: function (plugin) {
                    var info = navigator.plugins.hasOwnProperty(plugin)
                    if (info) {
                        // If there is a valid JSON object, return it
                        return info
                    } else {
                        // If the desired plugin is not implemented by NoPlugin, try to generate something the page will accept
                        var array = {
                            name: plugin,
                            description: 'Simulated ' + plugin + ' 50.0 (NoPlugin)',
                            version: '50.0',
                            filename: 'NoPlugin'
                        }
                        return array
                    }
                },
                configurable: false,
                enumerable: true,
                writable: false
            }, refresh: {
                // The navigator.plugins.refresh() function is used to refresh the list of currently-installed applications
                value: function () {
                    return
                },
                configurable: false,
                enumerable: true,
                writable: false
            }, length: {
                // The navigator.plugins.length function returns the number of plugins installed
                value: Object.keys(navigator.plugins).length,
                configurable: false,
                enumerable: true,
                writable: false
            }
        })

        // Define functions for navigator.mimeTypes

        Object.defineProperties(modifiedNavigator.mimeTypes, {
            length: {
                // The navigator.mimeTypes.length function returns the number of mimeTypes supported
                value: function () {
                    return Object.keys(navigator.mimeTypes).length
                },
                configurable: false,
                enumerable: true,
                writable: false
            }
        })

    } + ')()'

    var s = document.createElement('script')
    s.textContent = actualCode
    document.documentElement.appendChild(s)
    s.remove()
}