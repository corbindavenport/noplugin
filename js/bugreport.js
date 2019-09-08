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

document.querySelector('.email-button').addEventListener('click', function () {
    window.location.href = 'mailto:noplugin@fire.fundersclub.com?subject=NoPlugin%20not%20working%20on%20' + getUrlVars()['url'] + '&body=Please%20describe%20the%20issue%3A%20'
})