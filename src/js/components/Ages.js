import { nestDataByAgeGroup,updateExtents,nestDataByYear,getShortAgeGroup,AGES,COUNTRY_NAMES } from '../lib/utils';
import { strokeShadow } from '../lib/CSSUtils';
import AgeChart from './AgeChart';

export function Age(data,options) {
	//console.log(data,options)

	let FIELDNAME=options.fieldname || "income";

	//let nested_data=nestDataByAgeGroup(data,options.group_years,options.ages,options.countries);
	let nested_data=nestDataByAgeGroup(data,options.group_years,[],options.countries);
	

	let avg_nested_data=nestDataByAgeGroup(data,options.group_years,["TOTAL"],options.countries);
	//console.log("AVG_NESTED_DATA",avg_nested_data)

	let nested_data_year=nestDataByYear(data,null,options.countries);
	//console.log("nested_data_year",nested_data_year)

	nested_data.forEach(a=>{
		a.values.forEach(d=>{
			let range=nested_data_year.find(y=>y.key===d.key);
			d.range=range.values.map(v=>{
						//console.log(FIELDNAME,v)
						return {
							year:v.key,
							value:v.values[FIELDNAME]
						}
					}
				)	
		})
	})

	//console.log("NESTED_DATA",nested_data)

	let extents=updateExtents(data);

	let chart=new AgeChart([{
			key:options.countries[0],
			//name:"Disposable income",
			name:"Age",
			values:nested_data.find(d=>(d.key===options.ages[0])).values.filter(c=>c.key===options.countries[0])[0].values.map(c=>{return{key:options.ages[0],country:options.countries[0],income:c.values.income,family:c.values.family,single:c.values.single,perc:c.values.perc,year:+c.key}}),
			all:options.others?nested_data.map(d=>d.values.filter(c=>c.key===options.countries[0])[0].values.map(c=>{return{key:d.key,country:options.countries[0],income:c.values.income,family:c.values.family,single:c.values.single,perc:c.values.perc,year:+c.key}})):null
		}]
		,{
			deviation:[],//nested_data[0].values[0].range,
			first:true,
			age:options.ages[0],
			container:options.container,
			extents:extents,
			countries:options.countries,
			markers:options.markers,
			incomes:options.incomes,
			fieldname:FIELDNAME,
			voronoi:false,
			others:options.others,
			average:avg_nested_data[0].values.filter(c=>c.key===options.countries[0])[0].values.map(c=>{return{key:options.ages[0],country:options.countries[0],income:c.values.income,family:c.values.family,single:c.values.single,perc:c.values.perc,year:+c.key}}),
			//width:580,
			height:420,
			margins:{
				top:20,
				bottom:30,
				left:10,
				right:40
			},
			padding:{
				top:0,
				bottom:0,
				left:0,
				right:20
			},
			axis:{
				x:true,
				y:true
			},
			labels:{
				x:{
					format:(d,first,last)=>{
						return "$"+d3.format(",.0")(d)
					}
				},
				y:{
					align:options.y.align || "right",
					format:options.y.format || ((d)=>{
											//console.log("---->",d)
											if(d[FIELDNAME]===0) {
												return "";//"Average";
											}
											return d3.format("+,.0%")(d[FIELDNAME]);
											//return ((d.index===d.length-1)?"distance from average ":"")+""+d3.format("+,.0%")(d[FIELDNAME]);
											//return ((d.index===d.length-1)?"disposable income (USD) $":"$")+""+d3.format(",.0")(d[FIELDNAME]);
										})
				}
			},
			number_format:(d,no_plus)=>{
				return d3.format((no_plus?"":"+")+",.2%")(d);
			}
		}
	);

	this.addAnnotations= (index,position) =>{
		chart.addAnnotations(index,position);
	}
	this.removeAnnotations= () =>{
		chart.removeAnnotations();
	}
	this.transition= () =>{
		chart.transition();
	}
	this.selectOthers= (ages) => {
		chart.selectOthers(ages);
	}
	function update() {
		//nested_data=nestDataByAgeGroup(data,options.group_years,options.ages,options.countries);
		nested_data=nestDataByAgeGroup(data,options.group_years,[],options.countries);
		//console.log(nested_data)

		avg_nested_data=nestDataByAgeGroup(data,options.group_years,["TOTAL"],options.countries);
		//console.log("AVG_NESTED_DATA",avg_nested_data)
		
		nested_data_year=nestDataByYear(data,null,options.countries);
		//console.log("nested_data_year",nested_data_year)

		nested_data.forEach(a=>{
			a.values.forEach(d=>{
				let range=nested_data_year.find(y=>y.key===d.key);
				d.range=range.values.map(v=>{
							return {
								year:v.key,
								value:v.values[FIELDNAME]
							}
						}
					)	
			})
		})

	}

	this.update=(status) => {
		//console.log(status)
		options.ages=[status.age];
		options.countries=[status.country];
		update(status)
		
		//console.log("NESTED DATA",nested_data)

		chart.update([{
			key:options.countries[0],
			values:nested_data.find(d=>(d.key===options.ages[0])).values.filter(c=>c.key===options.countries[0])[0].values.map(c=>{return{key:options.ages[0],country:options.countries[0],income:c.values.income,family:c.values.family,single:c.values.single,perc:c.values.perc,year:+c.key}}),
			all:nested_data.map(d=>d.values.filter(c=>c.key===options.countries[0])[0].values.map(c=>{return{key:d.key,country:options.countries[0],income:c.values.income,family:c.values.family,single:c.values.single,perc:c.values.perc,year:+c.key}}))
		}],{
			deviation:[],//nested_data[0].values[0].range,
			age:options.ages[0],
			countries:options.countries,
			average:avg_nested_data[0].values.filter(c=>c.key===options.countries[0])[0].values.map(c=>{return{key:options.ages[0],country:options.countries[0],income:c.values.income,family:c.values.family,perc:c.values.perc,single:c.values.single,year:+c.key}})
		});
	}

	this.updateDescription=(description)=> {
		let p=document.querySelector(".person-profile p");
		p.innerHTML=description;
		strokeShadow(p)
	}

	this.resize=()=>{
		chart.resize();
	}

}
export function Ages(data,options) {

	let FIELDNAME=options.fieldname || "income";

	let nested_data=nestDataByAgeGroup(data,options.group_years);
	//console.log("nested_data",nested_data)

	let nested_data_year=nestDataByYear(data,null,options.countries);
	//console.log("nested_data_year",nested_data_year)

	nested_data.forEach(a=>{
		a.values.forEach(d=>{
			let range=nested_data_year.find(y=>y.key===d.key);
			if(range){
				d.range=range.values.map(v=>{
						return {
							year:v.key,
							value:v.values[FIELDNAME]
						}
					}
				)		
			}
		})
	})

	let extents=updateExtents(data);

	//console.log(extents);

	let row=d3.select(options.container)
		.append("div")
			.attr("class","rows")
			.selectAll("div.row")
				/*.data(options.countries.sort((a,b)=>{
					if(a===options.country) {
						return -1;
					}
					if(b===options.country) {
						return 1;
					}
					return 0;
				}))*/
				.data(options.countries)
				.enter()
				.append("div")
				.attr("class","row")
				.classed("selected",d=>(d===options.country))
	
	row
		.filter(d=>d===options.country)
		.each(function(d){
			//this.parentNode.prepend()
			this.parentNode.insertBefore(this,this.parentNode.firstChild)
		})
	/*let description=row.append("div")
						.attr("class","description")*/


	/*description.append("h2")
			.html(d=>COUNTRY_NAMES[d])*/



	/*description.append("p")
			.html("We serve freshly brewed coffee and a section of tasty treats and snacks. We are open for breakfast, lunch and afternoon tea. And unlike any other cafe in the town, we are open 7 days per week.")*/

	let ages=row.append("div")
						.attr("class","ages")

	ages.append("div")
			.attr("class","age2")
			.append("h3")
				.html(d=>{
					if(d==="UK") {
						return "UK";
					}
					if(d==="US") {
						return "US";
					}
					return COUNTRY_NAMES[d]
				});

	let age=ages.selectAll("div.age")
				.data((c)=>{
						let age_groups=nested_data.sort((a,b)=>(AGES.indexOf(a.key)-AGES.indexOf(b.key))).map((d)=>{
							//console.log(d)
							return {
								country:c,
								key:d.key,
								values:d.values
							}
						})


						return age_groups;
						//return age_groups.filter(d=>(d.key===options.age)).concat(age_groups.filter(d=>(d.key!==options.age)));
					}
				)
				.enter()
				.append("div")
					.attr("class","age")
					.classed("highlight",d=>{
						return d.key===options.age;
					})
					.attr("rel",d=>d.key);
	

	age
		.each(function(d,i){
			//console.log(d.key,d.country,d.values.filter(c=>c.key===d.country)[0].values)

			//console.log("!!!!!!!",d.values.filter(c=>c.key===d.country)[0])

			new AgeChart([{
					key:d.country,
					values:d.values.filter(c=>c.key===d.country)[0].values.map(c=>{return{key:d.key,country:d.country,income:c.values.income,perc:c.values.perc,family:c.values.family,single:c.values.single,year:+c.key}})
				}]
				,{
					deviation:d.values.filter(c=>c.key===d.country)[0].range,
					first:!i,
					age:d.key,
					fieldname:FIELDNAME,
					container:this,
					extents:extents,
					countries:[d.country],
					incomes:options.incomes,
					margins:{
						top:2,
						bottom:2,
						left:5,
						right:5
					},
					height:80,
					axis:{
						x:false,
						y:false,
						zero:true
					},
					pattern:false
				}
			)
		})



	age
		.append("h4")
			.html(d=>getShortAgeGroup(d.key))

	this.select=(__age,__country)=>{
		options.country=__country;
		row
			.filter(d=>d===options.country)
			.each(function(d){
				//this.parentNode.prepend()
				this.parentNode.insertBefore(this,this.parentNode.firstChild)
			})
		age
			.classed("selected",d=>{
				//console.log("!!!!",__age,d)
				return (d.key===__age && d.country===options.country)
			})
			.classed("highlight",d=>{
				return d.key===__age;
			})
	}

}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};