/*
This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see http://www.gnu.org/licenses/.
*/

window.onload = function() {
	document.getElementById("bitcoin").style.display = "none";

	document.querySelector('input[value="Donate via PayPal"]').onclick=function(){chrome.tabs.create({ url: "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=4SZVSMJKDS35J&lc=US&item_name=NoPlugin%20Donation&currency_code=USD&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted" });};

	document.querySelector('input[value="Donate via Bitcoin"]').onclick=function(){document.getElementById("bitcoin").style.display = "block";};

	var list = document.getElementsByClassName("version");
		for (var i = 0; i < list.length; i++) {
		    list[i].innerHTML = chrome.runtime.getManifest().version;
		}
}
