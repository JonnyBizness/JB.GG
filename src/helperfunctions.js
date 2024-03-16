
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
