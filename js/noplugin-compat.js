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
                value: [{
                    name: 'Shockwave Flash',
                    description: 'Simulated Flash Player activated by NoPlugin Compatibility Mode',
                    version: '100',
                    filename: 'NoPlugin'
                }],
                configurable: false,
                enumerable: true,
                writable: false
                
            },
            mimeTypes: {
                value: [{
                    type: 'application/x-shockwave-flash',
                    suffixes: 'swf',
                    description: 'Shockwave Flash'
                }, {
                    type: 'application/futuresplash',
                    suffixes: 'spl',
                    description: 'Shockwave Flash'
                }],
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
        // Define functions for plugin access
        Object.defineProperties(modifiedNavigator.plugins, {
            namedItem: {
                // The navigator.plugins.namedItem() function is used to obtain information about the plugin specified in the argument
                value: function(plugin) {
                    var info = navigator.plugins.find(a => a['name'] === plugin)
                    if (info) {
                        // If there is a valid JSON object, return it
                        return info
                    } else {
                        // If the desired plugin is not implemented by NoPlugin, try to generate something the page will accept
                        var array = {
                            name: plugin,
                            description: 'Simulated ' + plugin + ' activated by NoPlugin Compatibility Mode',
                            version: '100',
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
                value: function() {
                    return
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