export function appendShadow(item, x, y, col) {
	// compute new text-shadow property

	//console.log("appendShadow",item,x,y,col)

	var textShadow = '';

	if (item.style['text-shadow'] !== 'none') {
		//console.log("--->",item.style['textShadow'],item.style)
		textShadow = item.style['text-shadow'] + ', ';
	}
	
	textShadow = textShadow + x + 'px ' + y + 'px ' + '1px ' +col;

	// apply new text-shadow property
	//item.css('text-shadow', textShadow);

	//console.log(textShadow)
	item.style['text-shadow']=textShadow;
	//item.style['fill']="#ff0000"

	//return textShadow;
}