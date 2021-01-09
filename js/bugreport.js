function getUrlVars() {
    var vars = {}
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value
    })
    return vars
}

document.querySelector('.github-button').addEventListener('click', function () {
    window.open('https://github.com/corbindavenport/noplugin/issues/new', '_blank')
})