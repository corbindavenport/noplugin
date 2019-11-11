// document.cookie = 'noplugin-compat-mode=' + encodeURIComponent(document.URL) + '; path=/'

// If compatibility mode has been enabled for this page, do the magic
if (!navigator.plugins.namedItem('Shockwave Flash') && document.cookie.includes('noplugin-compat-mode') && document.cookie.includes(encodeURIComponent(document.URL))) {

    console.log('[NoPlugin] Compatibilty mode enabled.')

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
                    }
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