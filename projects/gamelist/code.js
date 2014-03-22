// XML/XSLT
function loadXMLDoc(dname) {
	if (window.XMLHttpRequest) {
		xhttp=new XMLHttpRequest();
	} else {
		xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xhttp.open("GET",dname,false);
	xhttp.send("");
	return xhttp.responseXML;
}

function displayXSLT(xls_file, div_id) {
	xml=loadXMLDoc("gamelist.xml");
	xsl=loadXMLDoc(xls_file);
	// code for IE
	if (window.ActiveXObject) {
		ex=xml.transformNode(xsl);
		document.getElementById(div_id).innerHTML=ex;
	}
	// code for Mozilla, Firefox, Opera, etc.
	else if (document.implementation && document.implementation.createDocument) {
		xsltProcessor=new XSLTProcessor();
		xsltProcessor.importStylesheet(xsl);
		resultDocument = xsltProcessor.transformToFragment(xml,document);
		var d = document.getElementById(div_id);
		while(d.firstChild) d.removeChild(d.firstChild); // remove all child before appending results
		d.appendChild(resultDocument);
	}
}

//+ Jonas Raoni Soares Silva
//@ http://jsfromhell.com/array/shuffle [v1.0]
function array_shuffle(o){ //v1.0
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

// Slide Show
function isScrolledIntoView(elem) {
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();
  var elemTop = $(elem).offset().top;
  var elemBottom = elemTop + $(elem).height();
  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

var SHORT_TICK_DELAY = 100;
var SLEEP_TICK_DELAY = 1000;
var NEXT_IMAGE_DELAY_MIN = 2000;
var NEXT_IMAGE_DELAY_MAX = 3000;

function tickCanvas(canvas) {
	if(canvas.filenames.length == 0) return;
	var g = canvas.getContext("2d");
	var W = canvas.width;
	var H = canvas.height;
	if(isScrolledIntoView(canvas)) {
		if(!canvas.images) canvas.images = new Array();
		// load image
		if(!canvas.images[canvas.imageIndex]) {
			canvas.images[canvas.imageIndex] = document.createElement('img');
			canvas.images[canvas.imageIndex].src = canvas.filenames[canvas.imageIndex];
		}
		if(canvas.images[canvas.imageIndex].complete) {
			// draw image (respecting aspect ratio)
			// clear first since not all games have uniform aspect ratio screenshtos
			g.fillStyle = "#000000";
			g.fillRect(0, 0, W, H);
			var image = canvas.images[canvas.imageIndex];
			var zoomW = W / image.width;
			var zoomH = H / image.height;
			var zoom = Math.min(zoomW, zoomH);
			var x = (W - (image.width * zoom)) / 2;
			var y = (H - (image.height * zoom)) / 2;
			g.drawImage(canvas.images[canvas.imageIndex], x, y, image.width * zoom, image.height * zoom);
			// update link
			canvas.link.href = canvas.filenames[canvas.imageIndex];
			// preload next image, switch to it but delay paint for a little while
			var previous = canvas.imageIndex;
			while(previous == canvas.imageIndex && canvas.filenames.length > 1) {
				// canvas.imageIndex = Math.floor((Math.random()*canvas.filenames.length)); // true random
				canvas.imageIndex = (canvas.imageIndex + 1) % canvas.filenames.length; // next one cyclic
			}
			if(!canvas.images[canvas.imageIndex]) {
				canvas.images[canvas.imageIndex] = document.createElement('img');
				canvas.images[canvas.imageIndex].src = canvas.filenames[canvas.imageIndex];
			}
			setTimeout(function(){ tickCanvas(canvas); }, Math.floor((Math.random()*(NEXT_IMAGE_DELAY_MAX - NEXT_IMAGE_DELAY_MIN))) + NEXT_IMAGE_DELAY_MIN);
		}
		// still waiting for image to be loaded, check again in a short while
		else {
			// do nothing, which keeps the previous image
			// g.fillStyle = "#FF0000";
			// g.fillRect(0, 0, W, H);
			setTimeout(function(){ tickCanvas(canvas); }, SHORT_TICK_DELAY);
		}
	}
	// canvas is completly or partly out of view, don't bother managing it, check again later
	else {
		setTimeout(function(){ tickCanvas(canvas); }, SLEEP_TICK_DELAY);
	}
}

