/*
 * Get selection text, detect language, get the corresponding audio file,
 * play/pronounce the text
 *
 */


/*
	Once the user selects text and clicks on the context menu item, control
	will be passed to this function. Use the selection text to detect the
	language and pass that language as a parameter to the next request to 
	get the right audio file and create an <embed> tag and push it to the
	background html file
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

// Create a new selection context menu

chrome.contextMenus.create({"title": "Pronounce", 
							"contexts":["selection"],
							"onclick": pronounceSelection});
	
var pronounce_foreign_id;							
if(localStorage['show_intl'] == "yes") {
	pronounce_foreign_id = chrome.contextMenus.create({"title": "Pronounce Foreign", 
								"contexts":["selection"],
								"onclick": pronounceForeignSelection});
}

$(document).ready(function() {
	
	
	/*
		Process stuff on options page
	*/
	
	
	// Check the appropriate radio box based on value in local
	// storage
	if(localStorage['show_intl'] == null) {
		localStorage['show_intl'] = "no";
	}
	$('input#show_intl_' + localStorage['show_intl']).attr('checked', 'checked');
	
	// If preference changes, update local storage and
	// flash a message
	$('input[name="show_intl"]').click(function() {
		if(localStorage['show_intl'] != $(this).val()) {
			localStorage['show_intl'] = $(this).val()
			if(localStorage['show_intl'] == 'no') {
				chrome.contextMenus.remove(pronounce_foreign_id);
			} else if(localStorage['show_intl'] == 'yes') {
				pronounce_foreign_id = chrome.contextMenus.create({"title": "Pronounce Foreign", 
											"contexts":["selection"],
											"onclick": pronounceForeignSelection});
			}
			$('div#notice').html("Preferences updated.").fadeIn(500, function() {
				setTimeout($('div#notice').fadeOut(1000), 2000);
			});
		}
	});
});