$(function() {
	//鎺у埗瀛椾綋
	var calculate_size = function() {
		var BASE_FONT_SIZE = 100;
		var docEl = document.documentElement,
			clientWidth = docEl.clientWidth;
		if(!clientWidth) return;
		size = BASE_FONT_SIZE * (clientWidth / 750);
		docEl.style.fontSize = size + 'px';
		if(size > 56) {
			size = 56;
			docEl.style.fontSize = size + 'px';
		}
	};

	// 濡傛灉娴忚鍣ㄤ笉鏀寔addEventListener锛屽垯涓
	if(document.addEventListener) {
		var resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize';
		window.addEventListener(resizeEvt, calculate_size, false);
		document.addEventListener('DOMContentLoaded', calculate_size, false);
		calculate_size();
	}
});