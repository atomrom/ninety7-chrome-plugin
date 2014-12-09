var currentUrl;
var updatedTimestamp;

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
	updatedTimestamp = new Date().getTime();
}

function printTimeSpentOnPage() {
	if (updatedTimestamp != undefined) {
		console.log("Time spent on page ", currentUrl, ": ", new Date()
				.getTime()
				- updatedTimestamp);
	}
}