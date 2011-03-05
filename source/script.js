/*
 * Get selection text, detect language, get the corresponding audio file,
 * play/pronounce the text
 *
 */


/*
	Once the user selects text and clicks on the pronounce context menu item, control
	will be passed to this function. Create an <embed> tag and push it to the
	background html file. Language parameter defaults to english.
*/

function pronounceSelection(info, tab) {
	var text = info.selectionText;
	var base_url = 
		"http://translate.google.com/translate_tts?";
	var url = base_url + 
				"q=" + encodeURIComponent(text) + 
				"&tl=" + 'en';
	var audio_embed = 
		"<embed src='"+url+"' hidden=true autostart=true loop=false>";
	$('#audioHolder').html(audio_embed);
}

/*
	Once the user selects text and clicks on the pronounce foregin context menu item, 
	control will be passed to this function. Use the selection text to detect the
	language and pass that language as a parameter to the next request to 
	get the right audio file and create an <embed> tag and push it to the
	background html file
*/

function pronounceForeignSelection(info, tab) {
	var text = info.selectionText;
	base_url_for_detection =
	"https://ajax.googleapis.com/ajax/services/language/detect";
	url_for_detection = base_url_for_detection + 
						"?v=1.0&q=" + encodeURIComponent(text);
	$.getJSON(url_for_detection+"&callback=?", function(data) {
		var lang = data.responseData.language;
		var base_url = 
			"http://translate.google.com/translate_tts?";
		var url = base_url + 
					"q=" + encodeURIComponent(text) + 
					"&tl=" + lang;
		var audio_embed = 
			"<embed src='"+url+"' hidden=true autostart=true loop=false>";
		$('#audioHolder').html(audio_embed);
	});
}

var pronounce_foreign_id;

function create_pronounce_context_menu() {
	// Create a new selection context menu
	chrome.contextMenus.create({"title": "Pronounce", 
								"contexts":["selection"],
								"onclick": pronounceSelection});
}

var pronounce_foreign_menu_id;

function create_pronounce_foreign_context_menu() {
	// create a pronounce foreign context menu
	var pronounce_foreign_id = chrome.contextMenus.create({"title": "Pronounce Foreign", 
								"contexts":["selection"],
								"onclick": pronounceForeignSelection});
	return pronounce_foreign_id;
}

function remove_pronounce_foreign_context_menu() {
	chrome.contextMenus.remove(pronounce_foreign_menu_id);
}

/*
	Using message passing to create/remove context menu items
	when called from outside the context of the extension (eg. options page)
	Note: A response(sendResponse) is required to finish the message call and initiate clean up
*/

chrome.extension.onRequest.addListener(
	function(request, sender, sendResponse) {
		if (request.execute == "remove_pronounce_foreign_context_menu") {
			remove_pronounce_foreign_context_menu();
			sendResponse({});
		} else if (request.execute == "create_pronounce_foreign_context_menu") {
			create_pronounce_foreign_context_menu();
			sendResponse({});
		} else {
			sendResponse({}); // snub them.
		}
});


/*
	Once the background page loads(on browser launch), create the 
	context menu items
*/

$('body#background_page').ready(function() {
	
	create_pronounce_context_menu();

	// If option enabled, create a pronounce foreign context menu
	// and assign the menu id to a variable							
	if(localStorage['show_intl'] == "yes") {
		pronounce_foreign_menu_id = create_pronounce_foreign_context_menu();
	}
	
});