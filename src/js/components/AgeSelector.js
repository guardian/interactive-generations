export default function AgeSelector(data,options) {
	console.log("AgeSelector",data)
	
	let countries=d3.select("#countrySelector")
					.on("change",function(d){
						////console.log()
						//self.COUNTRY=this.options[this.selectedIndex].value;
						//self.options.country=self.COUNTRY;
						console.log(this.options[this.selectedIndex].value)
						if(options.changeCallback) {
							options.changeCallback(this.options[this.selectedIndex].value)
						}

					})
					.selectAll("option.new")
					.data(data)
					.enter()
					.append("option")
						.attr("value",(d)=>d.age_short)
						.text((d)=>{
							//console.log(d)
							return d.age;
						})
						.each(function(d){
							let search=window.location.search.replace(/\?/gi,"").toLowerCase();
							if(search && d.toLowerCase()===search) {
								d3.select(this).attr("selected","selected")
							}
						})
	/*
	this.data.map((d)=>d.country).sort((a,b)=>{
		if(a < b) return -1;
	    if(a > b) return 1;
	    return 0;
	}).forEach((country)=>{
		let questions=this.options.questions.filter((d,i)=>{
					//console.log(d,this.data,this.options.country)
					let dd=this.data.find((c)=>c.country===country),
						qq=dd.questions.find((q)=>q.question===d.id);
					////console.log(qq)

					return !isNaN(qq.mean);

					return 1;
					return d==="1";
		}).sort((a,b)=>{
				return a.index-b.index
		})

		//console.log("\""+country+"\":["+questions.map(d=>d.id)+"],")
	})
	*/
		

	
}