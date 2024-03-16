console.log('JB.GG Running...');






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


// TODO:  maybe try move this into the same observer? and also not recurse, just query select.

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


// TODO: this still isn't quite right, we don't need to try remove all of the time.
// it works though i guess

const refreshStartMatchTimerButton = (quickMatchContainer) => {
	let originalContainer = quickMatchContainer.parentElement.parentElement.parentElement;

	// Shouldn't have a timer in it so remove
	if(
		originalContainer.classList.contains('in-progress') ||
		!originalContainer.classList.contains('playable')
		//&& originalContainer.classList.contains('start-timer-added')
	){
		// console.log('removing timer');
		originalContainer.classList.remove('start-timer-added');
		quickMatchContainer.querySelector('.start-timer')?.remove();
		return;
	}

	// Maybe should have a container, but already has one.
	if(originalContainer.classList.contains('start-timer-added')){
		// console.log('skipped, already has.');
		return;
	}

	// needs a new timer added.
	// console.log('adding a new timer.');

	originalContainer.classList.add('start-timer-added');
	let button = document.createElement('button');
	button.classList.add("start-timer", "jb-gg", "btn", "tappable-component", "mui-o9fdh3");
	button.innerHTML = '<span class="fa fa-clock-o">';
	button.onclick = startMatch.bind(this, quickMatchContainer); //assign a function as onclick attr
	quickMatchContainer.appendChild(button);
}


const addAdminButtons = (foundLinks) => {

	//data needd:
	//id: 1096164 & 1098285

	// Read events data
	let dataElement = document.querySelector("#__NEXT_DATA__");
	let data = JSON.parse(dataElement.textContent);


	// another fluxStoreData
	// loop em
	let eventsData = [];
	for(let entitie of data.props.pageProps.fluxStoreData){
		console.log('entity looped?', entitie.entities.event);

		if(entitie.entities.event?.length > 0){
			console.log('update eventsdata');
			eventsData = entitie.entities.event;
		}
	}
	


	// one working approach sometimes.	
	// let eventsData = data.props.pageProps.fluxStoreData[0].entities.event;
	// console.log('have data?', dataElement);
	// console.log('have events?', eventsData);

	//https://www.start.gg/tournament/jonnybizness-testing/events
	// events page has no event data in store?
	// the observer for the links isn't time enough, need to observe for data too?
	// only a refresh on certain pages gives the event data?
	if(eventsData.length <= 0){
		return;
	}


	console.log('we have events, carry on:', eventsData);
	
	
	for(let i = 0; i < foundLinks.length; i++){
		let link = foundLinks[i];

		// this kind of all g, but sometimes start.gg is removing my added link?
		if(link.classList.contains('admin-added')){
			console.log('try skip this way instead');
			console.log(link.classList);
			return;
		}


		for(let ii = 0; ii < eventsData.length; ii++){
			let event = eventsData[ii];
			if(link.text?.includes(event.name)){

				// keep track of that this link has been updated.
				link.classList.add('admin-added');

				let newLink = document.createElement('a');
				newLink.classList.add("admin-link", "jb-gg", "btn", "tappable-component");
				newLink.innerHTML = 'Bracket Admin<span class="fa fa-magic">';

				let adminLink = link.href
					.replace('start.gg/tournament/', 'start.gg/admin/tournament/')
					.replace(/\/event\/.*/, '/brackets/')
					.concat(event.id);
				newLink.href = adminLink;
				


				// inserting link seems ok but maybe loops
				link.insertAdjacentElement('afterend', newLink);
				console.log('link added');

				// try just update.
				//this is a weird one, the hover kind of changes but doesn't take effect.
				// also doesn't work when navigateing settings -> public again. //fuck.
				//link.href = adminLink;
				// link.classList.add("jb-gg");

				

				// console.log('updated link:', link);
			}
		}
	}
}


// ** //
// Observers, just looking for changes to then act on.
// ** //
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

	// adding events admin links next to private
	if(document.querySelectorAll('[class*=EventItemLink-]:not(.admin-added):not(.admin-link)').length > 0){
		let eventLinks = document.querySelectorAll('[class*=EventItemLink-]');
		addAdminButtons(eventLinks);
	}

});
observer.observe(document.body, {
	childList: true,
	subtree: true
});





/// try get the tournament data from some data place...
// eventually move inside observer i guess



// for(let event of events){
// 	console.log('found event:', event);
// 	//admin url?:
// 	//https://www.start.gg/admin/tournament/jonnybizness-testing/brackets/1096164/1606930/2402798
// 	let eventUrl = `https://www.start.gg/admin/tournament/jonnybizness-testing/brackets/${event.id}`;

// 	console.log('new event url:', eventUrl);

// 	let eventlink = document.querySelectorAll('[class*=EventItemLink-]');
// 	console.log('event ink', eventlink);

// }