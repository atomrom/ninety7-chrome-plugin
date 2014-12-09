console.log("title:", document.title);
console.log("text:", document.body.innerText);

document.onmousemove = function() {
	console.log("move");
};

document.onscroll = function() {
	console.log("scroll");
};
