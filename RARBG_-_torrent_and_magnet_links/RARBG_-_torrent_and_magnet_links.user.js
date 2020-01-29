// ==UserScript==
// @name        RARBG - torrent and magnet links
// @namespace   darkred
// @version     2020.01.29
// @description Adds a column with torrent and magnet links in RARBG lists
// @author      darkred
// @contributor sxe, dandyclubs
// @license     MIT
// @include     /^(https?:)?\/\/(www\.)?(rarbg|rbg(\.(bypassed|unblockall|unblocked))?|rarbgaccess(ed)?|rarbgcore|rarbgenter|rarbgget|rarbggo|rarbgmirror(ed)?|rarbgproxy|rarbgproxied|rarbgprx|rarbgs|rarbgto|rarbgunblock|rarbgway|proxyrarbg|unblocktorrent)\.(to|com|org|is|xyz|lol|vc|link)\/(rarbg-proxy-unblock\/)?(torrents\.php.*|catalog\/.*|tv\/.*|top10)$/
// @grant       none
// @require     https://cdnjs.cloudflare.com/ajax/libs/arrive/2.4.1/arrive.min.js
// @run-at      document-idle
// ==/UserScript==


function appendColumn(elem) {

	const title = 'DL&nbsp;ML';

	let entries = elem.querySelectorAll('.lista2t > tbody > tr > td:nth-child(2) ');        // the initial column 'Files' after of which the extra column will be appended

	for (let i = 0; i < entries.length; i++) {                                                  // creation of the extra column
		entries[i].insertAdjacentHTML('afterend', `<td>` + title + `</td>`);
	}

	let header = elem.querySelector('.lista2t > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(3)');       // the first cell (the header cell) of the new column
	header.innerHTML = title;
	header.setAttribute('align', 'center');
	header.setAttribute('class', 'header6');

	let cells = elem.querySelectorAll('.lista2t > tbody > tr[class="lista2"] > td:nth-child(3)');               // the rest cells of the new column
	for (let i = 0; i < cells.length; i++) {
		cells[i].setAttribute('class', 'lista');
		cells[i].setAttribute('width', '50px');
		cells[i].setAttribute('align', 'center');
	}

	let newColumn = elem.querySelectorAll('.lista2t > tbody > tr[class="lista2"] > td:nth-child(3)');       // new column
	let oldColumn = elem.querySelectorAll('.lista2t > tbody > tr[class="lista2"] > td:nth-child(2)');       // old column


	for (let i = 0; i < newColumn.length; i++) {

		let href = oldColumn[i].firstChild.href;

		newColumn[i].innerHTML =        '<a class="xhrDownloadLink" data-href="' + href + '" href="javascript:void(0)"><img src="https://dyncdn.me/static/20/img/16x16/download.png""></>';
		newColumn[i].lastChild.title = 'DL via XHR';

		newColumn[i].innerHTML += '&nbsp;<a class="xhrMagnetLink" data-href="' + href + '" href="javascript:void(0)"><img src="https://dyncdn.me/static/20/img/magnet.gif""></>';
		newColumn[i].lastChild.title = 'ML via XHR';

	}
}



function addClickListeners(links, type){

	for(let i = 0; i < links.length; i++) {

		links[i].addEventListener('click', function(event){

			let href = this.getAttribute('href');
			if (href === 'javascript:void(0)') {
				let tLink = this.getAttribute('data-href');

				var xhr = new XMLHttpRequest();
				xhr.open('GET', tLink, true);	// XMLHttpRequest.open(method, url, async)
				xhr.onload = function () {

					let container = document.implementation.createHTMLDocument().documentElement;
					container.innerHTML = xhr.responseText;

					let retrievedLink;
					if (type === 'dl'){
						retrievedLink = container.querySelector('a[href^="/download.php"]');		// the 'download link' element in the retrieved page
					} else {
						retrievedLink = container.querySelector('a[href^="magnet:"]');		// the 'magnet link' element in the retrieved page
					}


					if (retrievedLink) {
						links[i].setAttribute('href', retrievedLink.href);
						links[i].click();
					}


				};
				xhr.send();

			}

		}, false);

	}

}



function createColumn(element){
	appendColumn(element);
	addClickListeners(element.querySelectorAll('.xhrDownloadLink'), 'dl' );
	addClickListeners(element.querySelectorAll('.xhrMagnetLink'), 'ml' );
}





const isOnTV = window.location.href.includes('/tv/');  // example link: https://rarbgproxy.org/tv/tt1720601/

if (isOnTV) {
	var tvLinks = document.querySelectorAll('.tvshowClick');

	for (let i = 0; i < tvLinks.length; i++) {
		tvLinks[i].addEventListener('click',
			function handler(e) {  // https://stackoverflow.com/questions/26617719/turn-off-event-listener-after-triggered-once
				var targetElement = e.target || e.srcElement;   // https://stackoverflow.com/questions/11741070/js-how-to-get-the-element-clicked-on
				targetElement.parentElement.nextElementSibling.arrive('.lista2t', function() {
					createColumn(targetElement.parentElement.nextElementSibling);
					targetElement.parentElement.nextElementSibling.unbindArrive('.lista2t');
				});
			}
		);
	}
} else {
	createColumn(document);        // the initial column 'Files' after of which the extra column will be appended);
}
