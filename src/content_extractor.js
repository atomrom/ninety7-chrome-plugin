metaKeywords = $("meta[name='keywords']").attr("content");
metaDescription = $("meta[name='description']").attr("content");

console.log("title:", document.title);
console.log("text:", document.body.innerText);
console.log("metaKeywords:", metaKeywords);
console.log("metaDescription:", metaDescription);


chrome.runtime.sendMessage({
	title : document.title,
	meta_keywords : metaKeywords,
	meta_description : metaDescription,
	content : document.body.innerText
});