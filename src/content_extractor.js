console.log("title:", document.title);
console.log("text:", document.body.innerText);

chrome.runtime.sendMessage({
	title : document.title,
	content : document.body.innerText
});