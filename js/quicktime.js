/* Implementation of the QuickTime scripting API */
/* Info doc: https://github.com/corbindavenport/noplugin/files/2890528/f3c2a13a-f258-45b9-bdcf-81c41eee33cd.pdf */

// document.movie1.Play();

// Get list of NoPlugin embeds

var players = document.querySelectorAll('video.noplugin, audio.noplugin')

players.forEach(function (player) {
    // document.movie1.Play();
    // Plays the movie at the default rate, starting from the movie’s current time.
    if (!('Play' in player)) {
        player.Play = function() {
            console.log('[NoPlugin] Intercepted Play() QuickTime API call')
            this.play()
        }
    }
    // document.movie1.Stop();
    // Stops the movie without changing the movie’s current time.
    if (!('Stop' in player)) {
        player.Stop = function() {
            console.log('[NoPlugin] Intercepted Stop() QuickTime API call')
            this.pause()
        }
    }
    // document.movie1.Rewind();
    // Sets the current time to the movie’s start time and pausesthe movie.
    if (!('Rewind' in player)) {
        player.Rewind = function() {
            console.log('[NoPlugin] Intercepted Rewind() QuickTime API call')
            this.pause()
            this.fastSeek(0)
        }
    }
    // document.movie1.Step(int count)
    // Steps the movie forward or backward the specified number of frames from the point at which the command is received. If the movie’s rate is non-zero, it is paused.
    if (!('Step' in player)) {
        // TODO: Implement Step()
    }
    // document.movie1.ShowDefaultView()
    // Displays a QuickTime VR movie’s default node,using the default pan angle, tilt angle, and field of view as set by the movie’s author.
    if (!('ShowDefaultView' in player)) {
        player.ShowDefaultView = function() {
            // No browser supports VR QuickTime movies natively, but implementing this function should still keep scripts from failing
            console.log('[NoPlugin] Intercepted ShowDefaultView() QuickTime API call, silently ignoring it')
        }
    }
    // document.movie1.GoPreviousNode()
    // Returns to the previous node in a QuickTime VR movie (equivalent to clicking the Back button on the VR movie controller).
    if (!('GoPreviousNode' in player)) {
        player.GoPreviousNode = function() {
            // No browser supports VR QuickTime movies natively, but implementing this function should still keep scripts from failing
            console.log('[NoPlugin] Intercepted GoPreviousNode() QuickTime API call, silently ignoring it')
        }
    }
    // TODO: Implement rest of properties from QuickTime doc
})

// Test: document.querySelector('video').Play()