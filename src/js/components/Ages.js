import { nestDataByAgeGroup,updateExtents,nestDataByYear } from '../lib/utils';
import AgeChart from './AgeChart';

export function Age(data,options) {
	let nested_data=nestDataByAgeGroup(data,options.group_years,options.ages,options.countries);
	console.log(nested_data)

	let nested_data_year=nestDataByYear(data,null,options.countries);
	console.log("nested_data_year",nested_data_year)

	nested_data.forEach(a=>{
		a.values.forEach(d=>{
			let range=nested_data_year.find(y=>y.key===d.key);
			d.range=range.values.map(v=>{
						return {
							year:v.key,
							value:v.values.family
						}
					}
				)	
		})
	})

	let extents=updateExtents(data);

	let chart=new AgeChart([{
			key:options.countries[0],
			values:nested_data[0].values.filter(c=>c.key===options.countries[0])[0].values.map(c=>{return{key:options.ages[0],country:options.countries[0],family:c.values.family,single:c.values.single,year:+c.key}})
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
		width:580,
		height:350,
		margins:{
			top:20,
			bottom:50,
			left:10,
			right:60
		}
	})

	this.addAnnotations=function(index,position) {
		chart.addAnnotations(index,position);
	}

}
export function Ages(data,options) {

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
							value:v.values.family
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
			.html(d=>d)

	description.append("p")
			.html("Lorem ipsum dolor sit amet, consectetur adipisicing elit. Pariatur alias quaerat ad dolores cumque corporis sapiente maiores! Maxime quisquam fugiat facere optio, veritatis, fugit dicta.")

	let ages=row.append("div")
						.attr("class","ages")
	let age=ages.selectAll("div.age")
				.data((c)=>{
						return nested_data.map((d)=>{
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
		.append("h4")
			.html(d=>d.key)

	age
					.each(function(d,i){
						//console.log(d.key,d.country,d.values.filter(c=>c.key===d.country)[0].values)

						//console.log("!!!!!!!",d.values.filter(c=>c.key===d.country)[0])

						new AgeChart([{
								key:d.country,
								values:d.values.filter(c=>c.key===d.country)[0].values.map(c=>{return{key:d.key,country:d.country,family:c.values.family,single:c.values.single,year:+c.key}})
							}]
							,{
							deviation:d.values.filter(c=>c.key===d.country)[0].range,
							first:!i,
							age:d.key,
							container:this,
							extents:extents,
							countries:[d.country],
							incomes:options.incomes
						})
					})

}
/*function updateExtents(data) {	
		
	let extents={
		years:d3.extent(data,d=>d.year),
		family:d3.extent(data.filter(d=>d.family>0),d=>d.family),
		single:d3.extent(data.filter(d=>d.single>0),d=>d.single),
		age:d3.set(data.map(d=>d.Age)).values()
	}

	return extents;
} */
d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};