console.log('inserted script');


const focusOnField = (foundInput) => {
	foundInput.focus();
}


const matchRecurse = (parent, searchedClass) => {
	// console.log('finding but got,', parent);
	if(parent instanceof SVGElement){
		return;
	}
	if (parent.className?.includes(searchedClass)) {
		//console.log('found it finally.', parent);

		let button = Array.from(parent.querySelectorAll('button')).find(el => {
			return el.textContent === 'Start Match';
		});
		console.log('got button:', button);
		button.click();
		startMatchObserver.disconnect();

		//close modal?
		let closeButton = Array.from(document.querySelector('.PortalContext').querySelectorAll('span')).find(el => {
			console.log('lopin?:', el);
			return el.textContent === 'Close';
		});

		console.log('got close button', closeButton);
		closeButton.click();


		// addQuickMatchButtom(parent);
		// ? parent.click()
	}
	if (parent.childNodes) {
	  [...parent.childNodes].forEach((item) => {matchRecurse(item, searchedClass)});
	}
};
let findClass = 'match-winner-reporting'; // 'PortalContext'// 'match-winner-reporting'
const startMatchObserver = new MutationObserver((mutation_record) => {
	// console.log('startedMatchObserver running?:');

	// START MATCH
	for (let mutation of mutation_record) {
		if (mutation.addedNodes[0]) {
			if (mutation.addedNodes[0].className?.includes(findClass)) {
				
				console.log('found match winner thing.');
				
				// let modal = mutation.addedNodes[0];
				// //can find the button if added earlier but not working so need to use the obsering
				// console.log('modal dom?:', modal);
				// console.log('all butns', modal.querySelectorAll('button'));
				
				// let button = Array.from(modal.querySelectorAll('button')).find(el => {
				// 	console.log('lopin?:', el);
				// 	return el.textContent === 'Start Match';
				// });
				// console.log('button:', button);
				// button.click();
				//let buttonContainer = document.querySelector('.text-center .match-winner-reporting');// match-winner-reporting');
				//console.log('container:', buttonContainer);

				startMatchObserver.disconnect();
			} else {
				matchRecurse(mutation.addedNodes[0], findClass);
			}
		}
	}
});
const startMatch = (clickedElement, e) => {
	console.log('starting:', clickedElement);
	console.log('e?', e)

	let modalLauncher = clickedElement.firstChild;
	console.log('sibling?:', modalLauncher);

	modalLauncher.click();

	//do i have to do observer now?	

	// modal needs to be observed for. 
	// let reportButtonContainer = document.querySelector('.match-winner-reporting');
	// console.log('find button?:', reportButtonContainer);
	
	
	// observer since it's added? 
	// but is it added or like...idk, hiden and displayed?
	startMatchObserver.observe(document.body, {
		childList: true,
		subtree: true
	});
	
}

const addQuickMatchButtom = (qm) => {
	let button = document.createElement('button');
	button.classList.add("myBtn");
	button.innerText = 'Click Me';
	button.onclick = startMatch.bind(this, qm); //assign a function as onclick attr
	qm.appendChild(button);
}




const recurse = (parent, searchedClass) => {
	if(parent instanceof SVGElement){
		return;
	}
	if (parent.className?.includes(searchedClass)) {
		addQuickMatchButtom(parent);
	}
	if (parent.childNodes) {
	  [...parent.childNodes].forEach((item) => {recurse(item, searchedClass)});
	}
};
let matchingClass = 'match-quick-options'; // 'match-quick-container';
const observer = new MutationObserver((mutation_record) => {

	// QUICK MATCH
	for (let mutation of mutation_record) {
		if (mutation.addedNodes[0]) {
			if (mutation.addedNodes[0].className?.includes(matchingClass)) {
				console.log('found it early:', mutation.addedNodes[0]);
			} else {
				recurse(mutation.addedNodes[0], matchingClass);
			}
		}
	}


	// / CHARACTER SELECT
	if (document.querySelector('.character-selector')) {
		// Maybe change this to follow the above method of finding?
		console.log('found, do something', document.querySelector('.character-selector'));
		let input = document.querySelector('.character-selector').querySelectorAll('input');
		focusOnField(input[0]);
		//resolve(document.querySelector(selector));
	}
});

// If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
observer.observe(document.body, {
	childList: true,
	subtree: true
});