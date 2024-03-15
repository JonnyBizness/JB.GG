//import { recurse } from "helperfunction"

console.log('inserted script');


const focusOnField = (foundInput) => {
	foundInput.focus();
}


const startMatchTimer = (parent) => {
	
	let button = Array.from(parent.querySelectorAll('button')).find(el => {
		return el.textContent === 'Start Match';
	});
	button.click();
	startMatchObserver.disconnect();

	//close modal
	let closeButton = Array.from(document.querySelector('.PortalContext').querySelectorAll('span')).find(el => {
		return el.textContent === 'Close';
	});
	closeButton.click();
}



let findClass = 'match-winner-reporting'; 
const startMatchObserver = new MutationObserver((mutation_record) => {
	// START MATCH
	for (let mutation of mutation_record) {
		if (mutation.addedNodes[0]) {
			if (mutation.addedNodes[0].className?.includes(findClass)) {
				// Found at top of newly added node
				startMatchTimer(mutation.addedNodes[0]);
			} else {
				recurse(mutation.addedNodes[0], findClass, startMatchTimer );
			}
		}
	}
});

// clicks the edit match button and starts observer for finding the modal
const startMatch = (clickedElement, e) => {
	let modalLauncher = clickedElement.firstChild;
	modalLauncher.click();
	startMatchObserver.observe(document.body, {
		childList: true,
		subtree: true
	});
}



const refreshStartMatchTimerButton = (quickMatchContainer) => {
	let originalContainer = quickMatchContainer.parentElement.parentElement.parentElement;

	// Shouldn't have a timer in it so remove
	if(
		originalContainer.classList.contains('in-progress') ||
		!originalContainer.classList.contains('playable')
	){
		console.log('removing timer');
		originalContainer.classList.remove('start-timer-added');
		quickMatchContainer.querySelector('.start-timer')?.remove();
		return;
	}

	// Maybe should have a container, but already has one.
	if(originalContainer.classList.contains('start-timer-added')){
		console.log('skipped, already has.');
		return;
	}

	// needs a new timer added.
	console.log('adding a new timer.');
	originalContainer.classList.add('start-timer-added');
	let button = document.createElement('button');
	button.classList.add("start-timer", "btn", "tappable-component", "mui-o9fdh3");
	button.innerHTML = '<span class="fa fa-clock-o">';
	button.onclick = startMatch.bind(this, quickMatchContainer); //assign a function as onclick attr
	quickMatchContainer.appendChild(button);
}



const observer = new MutationObserver((mutation_record) => {

	// Adding/Removing Start match timer button.
	if (document.querySelectorAll('.match-quick-options').length > 0) {	
		for(const quickmatchContainer of document.querySelectorAll('.match-quick-options')){
			refreshStartMatchTimerButton(quickmatchContainer);
		}
	}

	// CHARACTER SELECT
	// any mutation look for character-selector on the page then focus on it.
	if (document.querySelector('.character-selector')) {	
		let input = document.querySelector('.character-selector').querySelectorAll('input');
		focusOnField(input[0]);
	}
});
observer.observe(document.body, {
	childList: true,
	subtree: true
});