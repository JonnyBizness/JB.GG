
// generic recursive search
// parent: added node
// searchedClass : what we're looking for
// toDoOnFind:  function to run on complete
const recurse = (parent, searchedClass, toDoOnFind) => {
	
	if(parent instanceof SVGElement){
		return;
	}
	if (parent.className?.includes(searchedClass)) {
		toDoOnFind(parent);
	}
	if (parent.childNodes) {
	  [...parent.childNodes].forEach((item) => {recurse(item, searchedClass, toDoOnFind)});
	}
};


function waitForElm(selector) { // https://stackoverflow.com/a/61511955
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                observer.disconnect();
                resolve(document.querySelector(selector));
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}
