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
    // Create list item
    var el = document.createElement('li')
    el.classList.add('list-group-item', 'list-group-item-action', 'd-flex', 'justify-content-between', 'align-items-center')
    // Add file name to list item
    var span = document.createElement('span')
    span.innerText = filename
    el.appendChild(span)
    // Download file when list item is clicked
    el.addEventListener('click', function() {
        var a = document.createElement('a')
        a.style.display = 'none'
        document.body.appendChild(a)
        a.href = url
        a.setAttribute('download', '')
        console.log(a)
        a.click()
        window.URL.revokeObjectURL(a.href)
        document.body.removeChild(a)
    })
    // Add link to page
    container.appendChild(el)
    // Try to find media length
    var mediaPlayer = document.createElement('video')
    mediaPlayer.muted = 'muted'
    var source = document.createElement('source')
    source.src = url
    mediaPlayer.addEventListener('loadedmetadata', function(event) {
        var duration = mediaPlayer.duration / 100
        duration = Math.round(duration * 100) / 100
        // Print media length to list item
        var time = document.createElement('span')
        time.classList.add('badge', 'badge-info', 'badge-pill')
        time.innerText = duration.toString().replace('.', ':')
        el.appendChild(time)
    })
    document.body.appendChild(mediaPlayer)
    mediaPlayer.appendChild(source)
})