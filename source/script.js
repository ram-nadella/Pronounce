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

/*
	Once the background page loads(on browser launch), create the 
	context menu items
*/

$('body#background_page').ready(function() {
	
	// Create a new selection context menu

	chrome.contextMenus.create({"title": "Pronounce", 
								"contexts":["selection"],
								"onclick": pronounceSelection});

	// If option enabled, create a pronounce foreign context menu
	// and assign the menu id to a variable							
	if(localStorage['show_intl'] == "yes") {
		pronounce_foreign_id = chrome.contextMenus.create({"title": "Pronounce Foreign", 
									"contexts":["selection"],
									"onclick": pronounceForeignSelection});
	}
	
});

/*
	JS code for options page
	Handling preference changes and add/remove foreign 
	context menu item based on preference
*/

$('body#options_page').ready(function() {
	
	// Check the appropriate radio box based on value 
	// in local storage
	if(localStorage['show_intl'] == null) {
		localStorage['show_intl'] = "no";
	}
	$('input#show_intl_' + localStorage['show_intl']).attr('checked', 'checked');
	
	// If preference changes, update local storage and
	// flash a message
	$('input[name="show_intl"]').click(function() {
		// Execute only if preference has changed, ignore if clicked on the 
		// existing preference
		if(localStorage['show_intl'] != $(this).val()) {
			localStorage['show_intl'] = $(this).val()
			if(localStorage['show_intl'] == 'no') {
				chrome.contextMenus.remove(pronounce_foreign_id);
			} else if(localStorage['show_intl'] == 'yes') {
				pronounce_foreign_id = chrome.contextMenus.create({"title": "Pronounce Foreign", 
											"contexts":["selection"],
											"onclick": pronounceForeignSelection});
			}
			$('div#notice').html("Preference updated.").fadeIn(500);
		}
	});
});