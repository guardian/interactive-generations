import { COUNTRY_NAMES } from '../lib/utils';

export function Q1(data,options) {
	
	let container=d3.select(options.container);
	data=data.filter(d=>d.Age!=="TOTAL")
	


	this.update=(age,country)=> {
		//console.log("Q1",age,country)

		let these_data=data.filter(d=>(d.Age===age && d.Country===country)).sort((a,b)=>(a.year - b.year))

		//console.log(these_data)

		let dollars=d3.format(",.0d");

		let v_past=these_data[0],
			v_now=these_data[these_data.length-1],
			diff=v_now.perc-v_past.perc,
			extents=d3.extent(these_data,d=>d.perc),
			raw_diff=v_now.income-v_past.income,
			first_year=v_past.Year,
			ever="most";

		//console.log(v_now.perc,v_past.perc,diff,extents)

		let better="";
		let was=``;

		if(diff>=0) {
			better="richer";//"a bit better off";
			was="";
		}
		if(diff>0.05) {
			better="richer"
		}
		if(diff<0) {
			better="poorer";//a bit worse off"
			was=``
		}
		if(diff<-0.05) {
			better="poorer"
		}
		if(extents.indexOf(v_now.perc)>-1) {
			ever="";
		}
		


		let txt=`<h2>Compared to the national average, you are ${better} than ${ever} people of your age in the past.</h2>
			${was}
			In real terms, your disposable income is about ${"$"+dollars(Math.abs(raw_diff))} ${raw_diff>0?"more":"less"} than in ${first_year}.`;

		//console.log("Q1",txt)

		container.html(txt);

	}
}

export function Q2(data,options) {
	
	let container=d3.select(options.container);
	data=data.filter(d=>d.Age!=="TOTAL")
	/*
	[And {country} is the [best/worst] place to be that age] or
	[But hey, you are doing better than {your age group} in {country}]
	The [best/worst] place to be your age is {country}
	*/



	this.update=(age,country)=> {
		//console.log("Q2",age,country)

		let all_country_data=data.filter(d=>(d.Age===age)).sort((a,b)=>(a.year - b.year)),
			these_data=data.filter(d=>(d.Age===age && d.Country===country)).sort((a,b)=>(a.year - b.year));

		let all_country_last_data={};

		all_country_data.forEach(d=>{
			if(!all_country_last_data[d.Country]) {
				all_country_last_data[d.Country]=d;
			}
			if(all_country_last_data[d.Country].year<d.year) {
				all_country_last_data[d.Country]=d;	
			}
		})

		let extents=d3.extent(d3.values(all_country_last_data),d=>d.perc),
			best=all_country_last_data[country].perc===extents[1],
			worst=all_country_last_data[country].perc===extents[0],
			best_country=d3.values(all_country_last_data).find(d=>(d.perc===extents[1])),
			worst_country=d3.values(all_country_last_data).find(d=>(d.perc===extents[0]));

		//console.log(d3.values(all_country_last_data))
		//console.log(extents,best,worst,best_country,worst_country)
		let the1="";
		if(country==="US" || country==="UK") {
			the1="the";
		}
		let the2="";
		if(worst_country.Country==="US" || worst_country.Country==="UK") {
			the2="the";
		}
		let the3="";
		if(best_country.Country==="US" || best_country.Country==="UK") {
			the3="the";
		}

		let txt="",
			txt_best_worst="";

		if(best) {
			txt=`<h2>${capitalize(the1)+" "}${COUNTRY_NAMES[country]} is the best place to be that age</h2>. `;
			txt_best_worst=`The worst place to be your age is ${the2} ${COUNTRY_NAMES[worst_country.Country]}.`;
		}
		if(worst) {
			txt=`<h2>And ${the1} ${COUNTRY_NAMES[country]} is the worst place to be that age</h2>. `;	
			txt_best_worst=`The best place to be your age is ${the3} ${COUNTRY_NAMES[best_country.Country]}.`;
		}
		if(!best && !worst) {
			txt=`<h2>But hey, you are doing better than those aged ${age} in ${the2} ${COUNTRY_NAMES[worst_country.Country]}</h2>. `;
			txt_best_worst=`The best place to be your age is ${the3} ${COUNTRY_NAMES[best_country.Country]}.`;
		}

		//console.log(txt,txt_best_worst)

		container.html(txt+txt_best_worst);

	}
}
function capitalize(string) {
	if(string==="") return "";
	return string.charAt(0).toUpperCase() + this.slice(1);
}

export function Q3(data,options) {
	
	let container=d3.select(options.container);
	data=data.filter(d=>d.Age!=="TOTAL")
	



	this.update=(age,country,parents_age)=> {
		//console.log("Q3",age,country,parents_age)

		let my=data.filter(d=>(d.Age===age && d.Country===country)),
			other=data.filter(d=>(d.Age===parents_age && d.Country===country))

		let last_my=my.find(d=>{
				return d.year===d3.max(my,v=>v.year)
			}),
			last_other=other.find(d=>{
				return d.year===d3.max(other,v=>v.year)
			});


		//console.log(last_my,last_other)

		let better=(last_other.perc>last_my.perc)?"better":"worse",
			raw_diff=other[other.length-1].income-other[0].income,
			more=raw_diff>0?"more":"less",
			first_year=other[0].year;

		let dollars=d3.format(",.0d");

		let txt=`<h2>They are doing ${better} than you!</h2>
			In real terms, their disposable income is about ${"$"+dollars(Math.abs(raw_diff))} ${raw_diff>0?"more":"less"} than in ${first_year}.`;

		container.html(txt);

	}
}
export function Q4(data,options) {
	/*
	People {your age group} have [lost/gained] status. {age group} are now the highest earners [although they are poorer than before/and they have gained status since {first year for data}]
	*/
	let container=d3.select(options.container);
	data=data.filter(d=>d.Age!=="TOTAL")

	this.update=(age,country)=>{
		//console.log("Q4",age,country)

		let these_data=data.filter(d=>(d.Age===age && d.Country===country)).sort((a,b)=>(a.year - b.year)),
			last_year=these_data[these_data.length-1].year,
			all_ages=data.filter(d=>(d.Country===country)).sort((a,b)=>(a.year - b.year));

		let max=d3.max(all_ages.filter(d=>d.year===last_year),d=>d.perc);

		let highest_earner=all_ages.find(d=>d.perc===max);

		let only_highest_earner=all_ages.filter(d=>d.Age===highest_earner.Age),
			although=(only_highest_earner[0].perc>only_highest_earner[only_highest_earner.length-1].perc)?", although they are poorer than before":(" and they have gained in relative terms since "+only_highest_earner[0].Year)

		//console.log("--->",only_highest_earner)

		let gained=(these_data[these_data.length-1].perc>these_data[0].perc)?"gained":"lost";
		let txt=`<h2>People ${age} have ${gained}, relative to the national average.</h2> The highest earners are now aged ${highest_earner.Age}${although}.`

		//console.log(txt,max,highest_earner)

		container.html(txt);
	}

}