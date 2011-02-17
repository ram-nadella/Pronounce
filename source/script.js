// A generic onclick callback function.
function pronounceSelection(info, tab) {
	var base_url = 
		"http://translate.google.com/translate_tts?&tl=en&q=";
	var text = info.selectionText;
	var url = base_url + text
	var audio_embed = 
		"<embed src='"+url+"' hidden=true autostart=true loop=false>";
	$('#audioHolder').html(audio_embed);
}

chrome.contextMenus.create({"title": "Pronounce", 
							"contexts":["selection"],
							"onclick": pronounceSelection});