import { nestDataByAgeGroup,updateExtents,nestDataByYear,getShortAgeGroup,AGES,COUNTRY_NAMES } from '../lib/utils';
import AgeChart from './AgeChart';

export function Age(data,options) {
	//console.log(data,options)

	let FIELDNAME="income";

	let nested_data=nestDataByAgeGroup(data,options.group_years,options.ages,options.countries);
	console.log("NESTED_DATA",nested_data)

	let avg_nested_data=nestDataByAgeGroup(data,options.group_years,["TOTAL"],options.countries);
	console.log("AVG_NESTED_DATA",avg_nested_data)

	let nested_data_year=nestDataByYear(data,null,options.countries);
	console.log("nested_data_year",nested_data_year)

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

	

	let extents=updateExtents(data);

	let chart=new AgeChart([{
			key:options.countries[0],
			values:nested_data[0].values.filter(c=>c.key===options.countries[0])[0].values.map(c=>{return{key:options.ages[0],country:options.countries[0],income:c.values.income,family:c.values.family,single:c.values.single,year:+c.key}})
		}]
		,{
			deviation:nested_data[0].values[0].range,
			first:true,
			age:options.ages[0],
			container:options.container,
			extents:extents,
			countries:options.countries,
			markers:options.markers,
			incomes:options.incomes,
			average:avg_nested_data[0].values.filter(c=>c.key===options.countries[0])[0].values.map(c=>{return{key:options.ages[0],country:options.countries[0],income:c.values.income,family:c.values.family,single:c.values.single,year:+c.key}}),
			//width:580,
			height:450,
			margins:{
				top:50,
				bottom:30,
				left:10,
				right:10
			},
			padding:{
				top:0,
				bottom:0,
				left:0,
				right:40
			},
			axis:{
				x:true,
				y:true
			},
			pattern:true
		}
	);

	this.addAnnotations=function(index,position) {
		chart.addAnnotations(index,position);
	}
	this.removeAnnotations=function() {
		chart.removeAnnotations();
	}

	function update() {
		nested_data=nestDataByAgeGroup(data,options.group_years,options.ages,options.countries);
		console.log(nested_data)

		avg_nested_data=nestDataByAgeGroup(data,options.group_years,["TOTAL"],options.countries);
		console.log("AVG_NESTED_DATA",avg_nested_data)
		
		nested_data_year=nestDataByYear(data,null,options.countries);
		console.log("nested_data_year",nested_data_year)

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

	this.update=function(status){
		console.log(status)
		options.ages=[status.age];
		options.countries=[status.country];
		update(status)
		
		console.log(nested_data)

		chart.update([{
			key:options.countries[0],
			values:nested_data[0].values.filter(c=>c.key===options.countries[0])[0].values.map(c=>{return{key:options.ages[0],country:options.countries[0],income:c.values.income,family:c.values.family,single:c.values.single,year:+c.key}})
		}],{
			deviation:nested_data[0].values[0].range,
			age:options.ages[0],
			countries:options.countries,
			average:avg_nested_data[0].values.filter(c=>c.key===options.countries[0])[0].values.map(c=>{return{key:options.ages[0],country:options.countries[0],income:c.values.income,family:c.values.family,single:c.values.single,year:+c.key}})
		});
	}

}
export function Ages(data,options) {

	let FIELDNAME="income";

	let nested_data=nestDataByAgeGroup(data,options.group_years);
	console.log(nested_data)

	let nested_data_year=nestDataByYear(data,null,options.countries);
	console.log("nested_data_year",nested_data_year)

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

	console.log(extents);

	let row=d3.select(options.container)
		.selectAll("div.row")
			.data(options.countries)
			.enter()
			.append("div")
			.attr("class","row")
	let description=row.append("div")
						.attr("class","description")


	description.append("h2")
			.html(d=>COUNTRY_NAMES[d])



	description.append("p")
			.html("We serve freshly brewed coffee and a section of tasty treats and snacks. We are open for breakfast, lunch and afternoon tea. And unlike any other cafe in the town, we are open 7 days per week.")

	let ages=row.append("div")
						.attr("class","ages")
	let age=ages.selectAll("div.age")
				.data((c)=>{
						return nested_data.sort((a,b)=>(AGES.indexOf(a.key)-AGES.indexOf(b.key))).map((d)=>{
							//console.log(d)
							return {
								country:c,
								key:d.key,
								values:d.values
							}
						})
					}
				)
				.enter()
				.append("div")
					.attr("class","age")
					.style("width",d => "calc(100% / "+nested_data.length+")")
					.attr("rel",d=>d.key);
	

	age
					.each(function(d,i){
						//console.log(d.key,d.country,d.values.filter(c=>c.key===d.country)[0].values)

						//console.log("!!!!!!!",d.values.filter(c=>c.key===d.country)[0])

						new AgeChart([{
								key:d.country,
								values:d.values.filter(c=>c.key===d.country)[0].values.map(c=>{return{key:d.key,country:d.country,income:c.values.income,family:c.values.family,single:c.values.single,year:+c.key}})
							}]
							,{
							deviation:d.values.filter(c=>c.key===d.country)[0].range,
							first:!i,
							age:d.key,
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
								y:false
							},
							pattern:false
						})
					})



	age
		.append("h4")
			.html(d=>getShortAgeGroup(d.key))

}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};