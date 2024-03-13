//live auth
curTab = '';
ticketId = '';
fullUrl = '';
fullTicket = '';
Auth = '';

ticketSubject = '';
commentBody = '';



document.addEventListener('DOMContentLoaded', () => {
	//chrome.tabs.getSelected(null,function(tab) {
		curTab = tab.url;

		console.log('current tab?:', curTab);
		
		// if(curTab.indexOf("zendesk.com/agent/tickets/") >= 0){
		// 	ticketArea = curTab.substr(curTab.indexOf("/agent/tickets/"));
		// 	ticketId = ticketArea.match(/\d+/)[0];
			
		// 	environment = curTab.substr(8, curTab.indexOf('.zendesk.com'));
		// 	if(environment == 'trademesupport.zendesk'){
		// 		Auth = "Basic am9uYXRoYW4uYnJvd25AdHJhZGVtZS5jby5uei90b2tlbjpmbG1MS2FWMmRsMDMweDZ2R1JWaWNpa3R6U0hORk1KUFExYUxFelFE";
		// 	}else{
		// 		Auth = "Basic am9uYXRoYW4uYnJvd25AdHJhZGVtZS5jby5uei90b2tlbjp3Vnc0YVdNR3pMc3NuWXNVTmJLQ2VEUDBjY3BqVk8yNUw5SUFHY0Vr";
		// 	}
		// }

		
		// //get ticket, used to get the subject
		// fullUrl = 'https://' + environment + '.com/api/v2/tickets/' + ticketId + '.json';
		// console.log(fullUrl);
		// $.ajax({
		// 	type: "GET",
		// 	url: fullUrl,
		// 	headers: {"Authorization": Auth},
		// 	success: function(success){
		// 		console.log(success);
		// 		ticketSubject = success.ticket.subject.toLowerCase();
		// 		getComments();
		// 	},
		// 	error: function(error){
		// 		console.log(error);
		// 	}
		// });


//	});
	
}, false);


//need to change to look up trigger at the time it happpened? - Nah, deminished returns doing this.
//need to look at subject? - yeah maybe.//subject check logic seems good but need to restructure for time
//lower case - DONE

//get comments on the ticket, used to get the first comment specifically
function getComments(){
	fullUrl = 'https://' + environment + '.com/api/v2/tickets/' + ticketId + '/comments.json';
	console.log(fullUrl);
	$.ajax({
		type: "GET",
		url: fullUrl,
		headers: {"Authorization": Auth},
		success: function(success){
			console.log(success);
			//is success so do the rest of it
			fullTicket = success;
			commentBody = fullTicket.comments[0].body.toLowerCase();

			getTriggerIds();
		},
		error: function(error){
			console.log(error);
		}
	});
}

//get trigger IDs that were run that are 'Assign - Abouts'
//also assign product
function getTriggerIds(){
	fullUrl = 'https://' + environment + '.com/api/v2/tickets/' + ticketId + '/audits.json';
	console.log(fullUrl);
	$.ajax({
		type: "GET",
		url: fullUrl,
		headers: {"Authorization": Auth},
		success: function(success){
			console.log(success);
			allEvents = success.audits[0].events;
			var result = allEvents.filter(function( obj ) {
				return obj.type == 'Change';
			});

			var triggersToUse = [];

			$.each( result, function( key, value ) {
				if(value.via.source.rel == 'trigger'){
					triggerId = value.via.source.from.id;
					triggerName = value.via.source.from.title;
					if(triggerName.indexOf("Assign - About") >= 0 || triggerName.indexOf("Assign - Product") >= 0){

						if($.inArray(triggerId, triggersToUse) == -1){
							triggersToUse.push(triggerId);
							//console.log('USE THE ID: ' + triggerId + ' now.');
						}
					}
				}
			});

			//console.log(triggersToUse);
			getMatches(triggersToUse);

		},
		error: function(error){
			console.log(error);
		}
	});
}


//getmMatches
function getMatches(triggerIds){
	$.each(triggerIds, function(key, value){

		//get specific trigger info
		fullUrl = 'https://' + environment + '.com/api/v2/triggers/' + value + '.json';
		console.log(fullUrl);
		$.ajax({
			type: "GET",
			url: fullUrl,
			headers: {"Authorization": Auth},
			success: function(success){

				console.log(success);
				$('body').append('<h2>' + success.trigger.title + '</h2>');

				//all of the reasons for the triggers
				allAnys = success.trigger.conditions.any;
				var strings = allAnys.filter(function( obj ) {
					return obj.operator == 'is';
				});
				var words = allAnys.filter(function( obj ) {
					return obj.operator == 'includes';
				});

								
				//console.log(commentBody);
				//console.log(ticketSubject);
				
				$.each( strings, function( key, value ) {
					//check body, else check the subject?
					if(commentBody.indexOf(value.value.toLowerCase()) != -1){
						//console.log(success.trigger.title);
						//console.log('String: ' + value.value);
						$('body').append('<p>String in comment: ' + value.value + '</p>');
						findWordInComment(value.value);
					}
					if(ticketSubject.indexOf(value.value.toLowerCase()) != -1){
						//console.log(success.trigger.title);
						//console.log('String: ' + value.value);
						$('body').append('<p>String in subject: ' + value.value + '</p>');
					}
				});

				$.each( words, function( key, value ) {
					//split the words
					individualWords = value.value.split(/\s+/);
					$.each( individualWords, function( key, value ) {
						//use regex for words not strings
						regex = "\\b" + value.toLowerCase(); + "\\b";
						var matchBody = commentBody.match(regex);
						var matchSubject = ticketSubject.match(regex);
						if(matchBody != null){
							//console.log(success.trigger.title);
							//console.log('Word: ' + value);
							$('body').append('<p>Word in comment: ' + value + '</p>');
							findWordInComment(value);
						}
						if(matchSubject != null){
							//console.log(success.trigger.title);
							//console.log('Word: ' + value);
							$('body').append('<p>Word in subject: ' + value + '</p>');
						}
					});

					
				});


			},
			error: function(error){
				console.log(error);
			}
		});
	});

}


function findWordInComment(word){

	console.log(word);
	chrome.tabs.getSelected(null,function(tab){
        chrome.tabs.sendRequest(tab.id, {req: "getZendeskComments"}, function(response){
			console.log(response);
        });
    });

}