/*
The MIT License (MIT)

Copyright (c) 2017 Corbin Davenport

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

window.onload = function() {
	document.getElementById("bitcoin").style.display = "none";

	document.querySelector('input[value="Download VLC Media Player"]').onclick=function(){
		if (navigator.platform.indexOf('Mac') > -1) {
			// Mac OS X download
			chrome.tabs.create({ url: "http://www.videolan.org/vlc/download-macosx.html" });
		} else if (navigator.platform.indexOf('Win') > -1) {
			// Windows download
			chrome.tabs.create({ url: "http://www.videolan.org/vlc/download-windows.html" });
		} else if (navigator.platform.indexOf('CrOS') > -1) {
			// Chrome OS download
			chrome.tabs.create({ url: "https://chrome.google.com/webstore/detail/vlc/obpdeolnggmbekmklghapmfpnfhpcndf?hl=en" });
		}else {
			// Other downloads
			chrome.tabs.create({ url: "http://www.videolan.org/vlc/#download" });
		}
	};

	document.querySelector('input[value="Donate via PayPal"]').onclick=function(){chrome.tabs.create({ url: "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4SZVSMJKDS35J&lc=US&item_name=NoPlugin%20Donation&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted" });};

	document.querySelector('input[value="Donate via Bitcoin"]').onclick=function(){document.getElementById("bitcoin").style.display = "block";};

	var list = document.getElementsByClassName("version");
		for (var i = 0; i < list.length; i++) {
		    list[i].innerHTML = chrome.runtime.getManifest().version;
		}
}
