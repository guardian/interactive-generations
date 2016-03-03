export function Q1(data,options) {
	
	let container=d3.select(options.container);

	


	this.update=(age,country)=> {
		console.log("Q1",age,country)

		let these_data=data.filter(d=>(d.Age===age && d.Country===country)).sort((a,b)=>(a.year - b.year))

		console.log(these_data)

		let v_past=these_data[0],
			v_now=these_data[these_data.length-1],
			diff=v_now.perc-v_past.perc,
			extents=d3.extent(these_data,d=>d.perc),
			raw_diff=v_now.income-v_past.income,
			first_year=v_past.Year,
			ever="most";

		console.log(v_now.perc,v_past.perc,diff,extents)

		let better="";
		let was=`It was much better to be that age in ${first_year}.`;

		if(diff>=0) {
			better="a bit better off";
			was="";
		}
		if(diff>0.05) {
			better="better off"
		}
		if(diff<0) {
			better="a bit worse off"
			was=`It was just a bit better to be that age in ${first_year}.`
		}
		if(diff<-0.05) {
			better="worse off"
		}
		if(extents.indexOf(v_now.perc)>-1) {
			ever="every";
		}
		


		let txt=`<h2>You are ${better} than ${ever} people that age in the past.</h2>
			${was}
			In real terms, you are making about ${"$"+Math.abs(raw_diff)} ${raw_diff>0?"more":"less"} than in ${first_year}.`;

		console.log(txt)

		container.html(txt);

	}
}