function getUrlVars() {
    var vars = {}
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value
    })
    return vars
}

// Process URLs
var mediaArray = getUrlVars()['urls'].split(',')
mediaArray.forEach(function (value, index) {
    mediaArray[index] = decodeURIComponent(value)
})
console.log('Processed URLs: ', mediaArray)

// Add each URL to the page
var container = document.getElementById('playlist')
mediaArray.forEach(function (url) {
    var filename = url.split('/').pop()
    var link = document.createElement('a')
    link.classList.add('list-group-item', 'list-group-item-action')
    link.href = url
    link.innerText = filename
    link.setAttribute('download', 'true')
    container.appendChild(link)
})