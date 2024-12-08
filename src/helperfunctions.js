
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

function FindReact(dom, traverseUp = 0) { //https://stackoverflow.com/a/39165137
	const key = Object.keys(dom).find(key=>{
		return key.startsWith("__reactFiber$") // react 17+
			|| key.startsWith("__reactInternalInstance$"); // react <17
	});
	const domFiber = dom[key];
	if (domFiber == null) return null;

	// react <16
	if (domFiber._currentElement) {
		let compFiber = domFiber._currentElement._owner;
		for (let i = 0; i < traverseUp; i++) {
			compFiber = compFiber._currentElement._owner;
		}
		return compFiber._instance;
	}

	// react 16+
	const GetCompFiber = fiber=>{
		//return fiber._debugOwner; // this also works, but is __DEV__ only
		let parentFiber = fiber.return;
		while (typeof parentFiber.type == "string") {
			parentFiber = parentFiber.return;
		}
		return parentFiber;
	};
	let compFiber = GetCompFiber(domFiber);
	for (let i = 0; i < traverseUp; i++) {
		compFiber = GetCompFiber(compFiber);
	}
	return compFiber.stateNode;
}


function processEntrant(node, id) {
	const rl = (e, t, i) => { //taken directly from the selectCharacter function in start.gg with some variables swapped for their string values
		e.dispatch("SET_UI_CHARACTER_SELECTED", t);
		const n = e.getStore("SetUIStore").getLastSelectionParams();
		if (n) {
			let s, r = {}, d = n.get("id"), o = n.get("participantId"), m = n.get("characterIdx"), c = n.get("taskId"), u = {};
			if (o ? (u[o] = d, s = a().fromJS(u)) : 0 === m || m ? (u[m] = d, s = a().fromJS(u)) : s = d, "report" === n.get("actionType")) {
				const v = n.get("entrantNum");
				let g = e.getStore("SetTaskUIStore").getTask(c).getIn(["metadata", "report", "selections"], a().List());
				g = g.set(v - 1, n.get("gameSelection"));
				l.Z.deepSet(r, ["report", "selections"], g);
			} else {
				l.Z.deepSet(r, ["selection"], s);
			}
			e.dispatch("SET_TASK_UI_UPDATE", { taskId: c, metadata: r });
		}
		i();
	};

	const reactInstance = FindReact(node);

	const props = reactInstance.props.children._owner.memoizedProps; // dark magic! 
	const entrantNum = props.entrantNum;
	let setId, cId, entrantId, entrant1Id, entrant2Id;

	if (props.game._root.entries) { // the data is either in entries or nodes. dunno what causes the difference
		// props.game._root.entries = "setId","entrant1Id","entrant2Id","orderNum","cId","selections"
		setId = props.game._root.entries[0][1];
		cId = props.game._root.entries[4][1];
		entrant1Id = props.game._root.entries[1][1];
		entrant2Id = props.game._root.entries[2][1];
	} else {
		// props.game._root.nodes = "selections","entrant1Id","entrant2Id","entrant2P1Stocks","loserId","winnerId","setId","cId"
		setId = props.game._root.nodes[6].entry[1];
		cId = props.game._root.nodes[7].entry[1];
		entrant1Id = props.game._root.nodes[1].entry[1];
		entrant2Id = props.game._root.nodes[2].entry[1];
	}
	entrantId = entrantNum === 1 ? entrant1Id : entrant2Id;

	reactInstance.props.executeAction(rl, { setId, cId, id: setId, entrantId, characterId: id });
}