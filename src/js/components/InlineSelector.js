export default function InlineSelector(list,__options) {

	let options=__options;
	let container=d3.select(options.container);
	

	//console.log(list)

	let option=container
					.on("change",function(d){
						////console.log()
						//self.COUNTRY=this.options[this.selectedIndex].value;
						//self.options.country=self.COUNTRY;
						//console.log(this.options[this.selectedIndex].value)
						

						updateOptions(this.options[this.selectedIndex].value);

						if(options.changeCallback) {
							options.changeCallback(this.options[this.selectedIndex].value)
						}

					})
					.selectAll("option")
					.data(list)
					.enter()
					.append("option")
						.attr("value",d=>d.shortname)
						.html((d)=>{
							
							if(d.name==="US" || d.name==="UK") {
								return "the "+d.name;
							}
							return d.name;
						})
						/*.each(function(d){
							let search=window.location.search.replace(/\?/gi,"").toLowerCase();
							if(search && d.toLowerCase()===search) {
								d3.select(this).attr("selected","selected")
							}
						})*/
	updateOptions();
	
	function updateOptions(selectedValue) {
		if(selectedValue) {
			options.selected=selectedValue;
		}
		option
			.html(d=>d.name)
			.filter(d=>{
				return (d.shortname===options.selected);
			})
			.attr("selected","selected")
			.html((d)=>{
							
				if(d.name==="US" || d.name==="UK") {
					return "the "+d.name;
				}
				return d.name;
			})
	}

	this.selectOption=(value)=>{
		container.selectAll("option")
				.each((d,i)=>{
					if(d.shortname===value) {
						//console.log("selecting",i,d)
						container.node().selectedIndex=i;
					}
				})
		updateOptions(value);

		if(options.changeCallback) {
			options.changeCallback(value)
		}
	}
}