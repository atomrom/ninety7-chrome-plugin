var activeTabId;

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
	activeTabId = tabs[0].id;
	console.log('activeTabId:', activeTabId);
});

chrome.webNavigation.onCompleted.addListener(function(details) {
	if (details.frameId == 0) {
		console.log("onCompleted-url:", details.url);

		if (currentUrl != details.url) {
			postToServerTimeSpentOnPage();
		}

		if (activeTabId == details.tabId) {
			extractContent(details.tabId, details.url);
			startTimer(details.url);
		}
	}
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	console.log("onActivated-url:", activeInfo.tabId, activeInfo.url);

	postToServerTimeSpentOnPage();

	chrome.tabs.get(activeInfo.tabId, function(tab) {
		extractContent(activeInfo.tabId, tab.url);
		startTimer(tab.url);
	});

	activeTabId = activeInfo.tabId;
});

function extractContent(tabId, url) {
	if (isTracked(url)) {
		chrome.tabs.executeScript(tabId, {
			file : "content_extractor.js"
		});
	}
}

function startTimer(url) {
	if (isTracked(url)) {
		currentUrl = url;
		updatedTimestamp = now();

		lockedDuration = 0;
	}
}

function now() {
	return new Date().getTime();
}

function isTracked(url) {
	if (url == undefined) {
		return false;
	}

	protocol = $.url(url).attr('protocol');
	console.log("protocol:", protocol);

	host = $.url(url).attr('host');
	console.log("host:", host);

	return (protocol == "http")
			&& ("1-dot-ninety7-service.appspot.com" != host);
}

function postToServerTimeSpentOnPage() {
	if (isTracked(currentUrl)) {
		console.log("lockedDuration: ", lockedDuration);

		if (updatedTimestamp != undefined) {
			visitDuration = now() - updatedTimestamp - lockedDuration;

			console.log("Time spent on page ", currentUrl, ", ", visitDuration);
			console.log("Title:", pageTitle);
			console.log("Content:", pageContent);

			$.post("http://1-dot-ninety7-service.appspot.com/collector", {
				urlVisited : currentUrl,
				visitDuration : visitDuration,
				title : pageTitle != undefined ? pageTitle : "",
				content : pageContent != undefined ? pageContent : ""
			}, function(data, status) {
				console.log("Data: ", data, "\nStatus: ", status);

				currentUrl = undefined;
				visitDuration = undefined;
				title = undefined;
				content = undefined;

				lockedDuration = 0;
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
