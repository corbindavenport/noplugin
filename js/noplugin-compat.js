// document.cookie = 'noplugin-compat-mode=' + encodeURIComponent(document.URL) + '; path=/'

// If compatibility mode has been enabled for this page, do the magic
if (!navigator.plugins.namedItem('Shockwave Flash') && document.cookie.includes('noplugin-compat-mode') && document.cookie.includes(encodeURIComponent(document.URL))) {

    console.log('[NoPlugin] Compatibilty mode enabled.')

    // Credit: https://stackoverflow.com/a/23456845
    var actualCode =  '(' + function() {
        'use strict';
        var navigator = window.navigator;
        var modifiedNavigator;
        if ('userAgent' in Navigator.prototype) {
            // Chrome 43+ moved all properties from navigator to the prototype,
            // so we have to modify the prototype instead of navigator.
            modifiedNavigator = Navigator.prototype;
    
        } else {
            // Chrome 42- defined the property on navigator.
            modifiedNavigator = Object.create(navigator);
            Object.defineProperty(window, 'navigator', {
                value: modifiedNavigator,
                configurable: false,
                enumerable: false,
                writable: false
            });
        }
        Object.defineProperties(modifiedNavigator, {
            plugins: {
                value: {
                    name: 'Shockwave Flash',
                    description: 'Simulated Flash Player',
                    version: '50',
                    filename: 'noplugin'
                },
                configurable: false,
                enumerable: true,
                writable: false
            },
            platform: {
                value: 'Win32',
                configurable: false,
                enumerable: true,
                writable: false
            },
        });
    } + ')();';
    
    var s = document.createElement('script');
    s.textContent = actualCode;
    document.documentElement.appendChild(s);
    s.remove();
}