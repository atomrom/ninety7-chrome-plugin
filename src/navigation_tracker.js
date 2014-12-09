var currentUrl;
var updatedTimestamp;

var lockedStart;
var lockedDuration = 0;

chrome.tabs.query({
	'active' : true,
	'windowId' : chrome.windows.WINDOW_ID_CURRENT
}, function(tabs) {
	// alert(tabs[0].url);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	console.log("url:", tab.url, tab.id);

	if (tab.url != currentUrl) {
		printTimeSpentOnPage();

		startTimer(tab.url);
	}
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tab) {
		console.log("activated:", activeInfo.tabId, tab.url);

		printTimeSpentOnPage();

		startTimer(tab.url);
	});
});

function startTimer(url) {
	currentUrl = url;
	updatedTimestamp = now();

	lockedDuration = 0;
}

function now() {
	return new Date().getTime();
}

function printTimeSpentOnPage() {
	console.log("lockedDuration: ", lockedDuration);

	if (updatedTimestamp != undefined) {
		console.log("Time spent on page ", currentUrl, ": ", now()
				- updatedTimestamp - lockedDuration);
	}
}

chrome.idle.setDetectionInterval(15);
// "active", "idle", or "locked"
chrome.idle.onStateChanged.addListener(function callback(newState) {
	if (newState != "active") {
		lockedStart = now();
	} else if (lockedStart > 0) {
		lockedDuration += now() - lockedStart;
	}

	console.log(newState, lockedDuration);
});

chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.create({
		"url" : "popup.html"
	});
});
