var ZrScrollers = new Array();
var isOpera6 = ( navigator.userAgent.toLowerCase().indexOf( 'opera' ) + 1 && !document.childNodes ) || ( window.ScriptEngine && ScriptEngine().indexOf( 'InScript' ) + 1 );

function getReferenceToDiv( divID, oDoc ) {
	if( !oDoc ) { oDoc = document; }
	if( document.layers ) {
		if( oDoc.layers[divID] ) { return oDoc.layers[divID]; } else {
		for( var x = 0, y; !y && x < oDoc.layers.length; x++ ) {
			y = getRefToDivNest(divID,oDoc.layers[x].document); }
			return y; } }
	if( document.getElementById ) { return document.getElementById(divID); }
	if( document.all ) { return document.all[divID]; }
	return document[divID];
}

function reWriteScroll(oDiv,oFrame,oString) {
	if( isOpera6 ) {
		var oContent = window.opera ? window.open('',oFrame) : window.frames[oFrame].window;
		oContent.document.open('text/html','replace');
		oContent.document.write('<html><head><title>Dynamic content</title></head><body>'+oString+'</body></html>');
		oContent.document.close();
	} else {
		var oContent = getReferenceToDiv(oDiv); if( !oContent ) { oContent = new Object(); }
		if( oContent.document && oContent.document != document ) {
			oContent.document.open();
			oContent.document.write('<html><head><title>Dynamic content</title></head><body>'+oString+'</body></html>');
			oContent.document.close();
		} else {
			oContent.innerHTML = oString;
		}
	}
}

function createScroller() {
	if( document.layers ) {
		document.write('<ilayer left="0" top="0" height="' + ( this.height + ( this.border[0] * 2 ) ) + '" width="' + ( this.width + ( this.border[0] * 2 ) ) + '" bgcolor="' + this.border[1] + '">\n' );
		document.write('<layer left="' + this.border[0] + '" top="' + this.border[0] + '" height="' + this.height + '" width="' + this.width + '" clip="0,0,' + this.width + ',' + this.height + '">\n' );
		document.write('<layer id="' + this.layer + '" bgcolor="' + this.background + '" height="' + this.height + '" width="' + this.width + '"></layer></layer></ilayer>\n' );
	} else if( isOpera6 ) {
		//on crée le scroller avec un iframe
		document.write('<table border="0" cellpadding="' + this.border[0] + '" cellspacing="0"><tr><td bgcolor="' + this.border[1] + '"><iframe src="about:blank" name="' + this.iframe + '" marginwidth="0" marginheight="0" frameborder="0" height="' + this.height + '" width="' + this.width + '" scrolling="no"></iframe></td></tr></table>' );
	} else {
		document.write( '<div style="position:relative;background-color:' + this.border[1] + ';width:' + ( this.width + ( this.border[0] * 2 ) ) + 'px;height:' + ( this.height + ( this.border[0] * 2 ) ) + 'px;">' );
		document.write( '<div style="position:absolute;width:' + this.width + 'px;height:' + this.height + 'px;clip:rect(0px ' + this.width + 'px ' + this.height + 'px 0px);top:' + this.border[0] + 'px;left:' + this.border[0] + 'px;">' );
		document.write( '<div style="position:absolute;background-color:' + this.background + ';left:0px;top:0px;width:' + this.width + 'px;height:' + this.height + 'px;"></div>' );
		document.write( '<div style="position:absolute;left:0px;top:0px;width:' + this.width + 'px;height:' + this.height + 'px;" id="' + this.layer + '"></div></div></div>' );
	}
}

function Scroller(oH,oW,oTH,oBW,oBC,oSD,oPT,oSP,oBGC) {
	if( arguments.length > 9 ) { window.alert('Incompatible avec votre navigateur'); window.onerror = function () { return true; }; return; }
	this.height = oH; this.width = oW; this.textHeight = oTH; this.border = [ oBW, oBC ];
	this.scrollSpeed = oSD; this.pauseLength = oPT; this.stopOff = oSP; this.background = oBGC;
	this.msgArray = ['']; this.scrollNum = window.ZrScrollers.length; 
	this.constructScroller = createScroller;
	this.layer = 'scLyEr' + window.ZrScrollers.length;
	this.iframe = 'scFrAm' + window.ZrScrollers.length;
	window.ZrScrollers[window.ZrScrollers.length] = this;
}

//now do the bit that works out what to write and how far to scroll
function rotateMsg(oNum,sCroll,oUnit) {
	oUnit = ZrScrollers[oUnit];
	if( isOpera6 ) { //scroll the iframe
		window.frames[oUnit.iframe].scrollTo(0,sCroll);
	} else {
		var refToDiv = getReferenceToDiv(oUnit.layer);
		if( !refToDiv ) { return; } 
		if( refToDiv.style ) { refToDiv = refToDiv.style; }
		refToDiv.top = ( ( document.layers ? 0 : oUnit.height ) - sCroll ) + ( document.childNodes ? 'px' : 0 );
	}
	if( sCroll == 0 ) { //next message
		if( isOpera6 || document.layers ) {
			reWriteScroll(oUnit.layer,oUnit.iframe,'<table border="0" cellpadding="0" cellspacing="0"><tr><td height="'+oUnit.height+'" bgcolor="' + oUnit.background + '">&nbsp;</td></tr></td><tr><td height="'+oUnit.textHeight+'" width="'+oUnit.width+'" align="center" bgcolor="' + oUnit.background + '"><table border="0" cellpadding="0" cellspacing="0"><tr><td align="left">'+oUnit.msgArray[oNum]+'</td></tr></table></td></tr><tr><td height="'+(oUnit.height+2)+'" bgcolor="' + oUnit.background + '">&nbsp;</td></tr></table>');
		} else {
			reWriteScroll(oUnit.layer,oUnit.iframe,'<table align="center"><tr><td align="left">'+oUnit.msgArray[oNum]+'</table>');
		}
		oNum++; if( oNum >= oUnit.msgArray.length ) { oNum = 0; }
	}
	if( sCroll >= oUnit.height + oUnit.textHeight ) { sCroll = -3; }
	window.setTimeout( 'rotateMsg('+oNum+','+(((oUnit.height-oUnit.stopOff)-sCroll==1||(oUnit.height-oUnit.stopOff)-sCroll==2)?oUnit.height-oUnit.stopOff:sCroll+3)+','+oUnit.scrollNum+');', ( sCroll == oUnit.height - oUnit.stopOff ) ? oUnit.pauseLength : oUnit.scrollSpeed );
}

window.onload = function () { for( var x = 0; x < ZrScrollers.length; x++ ) { rotateMsg( 0, 0, x ); } }