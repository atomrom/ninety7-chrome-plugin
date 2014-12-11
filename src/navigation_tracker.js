var pageTitle;
var pageContent;

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
		postToServerTimeSpentOnPage();

		startTimer(tab.url);
	}
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	chrome.tabs.get(activeInfo.tabId, function(tab) {
		console.log("activated:", activeInfo.tabId, tab.url);

		postToServerTimeSpentOnPage();

		startTimer(tab.url);
	});
});

function startTimer(url) {
	if (isProtocolTracked(url)) {
		currentUrl = url;
		updatedTimestamp = now();

		lockedDuration = 0;
	}
}

function now() {
	return new Date().getTime();
}

function isProtocolTracked(url) {
	if (url == undefined) {
		return false;
	}

	protocol = $.url(url).attr('protocol');
	console.log("protocol:", protocol);

	return (protocol == "http" || protocol == "https" || protocol == "ftp" || protocol == "file");
}

function postToServerTimeSpentOnPage() {
	if (isProtocolTracked(currentUrl)) {
		console.log("lockedDuration: ", lockedDuration);

		if (updatedTimestamp != undefined) {
			visitDuration = now() - updatedTimestamp - lockedDuration;

			console.log("Time spent on page ", currentUrl, ", ", visitDuration);

			$.post("http://1-dot-ninety7-service.appspot.com/collector", {
				urlVisited : currentUrl,
				visitDuration : visitDuration,
				title : pageTitle != undefined ? pageTitle : "",
				content : pageContent != undefined ? pageContent : ""
			}, function(data, status) {
				console.log("Data: ", data, "\nStatus: ", status);
			});
		}
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	console.log(sender.tab ? "from a content script:" + sender.tab.url
			: "from the extension");

	pageTitle = request.title;
	pageContent = request.content;
});
