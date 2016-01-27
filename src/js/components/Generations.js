import { createPeople,updateExtents } from '../lib/utils';

export default function Generations(data,options) {

	let svg=d3.select(options.container)
						.append("svg");

	let box=svg.node().getBoundingClientRect();
	let WIDTH = box.width,
		HEIGHT= box.height;
	
	let margins=options.margins || {
		top:20,
		bottom:30,
		left:0,
		right:10
	};

	let chart_width=100;

	let padding=options.padding || {
		top:0,
		bottom:0,
		left:0,
		right:0
	};

	let people=createPeople(data);
	console.log(people)

	let extents={};
	updateExtents();

	console.log(extents);

	

	let xscale,yscale,agescale,country;

	buildVisual();

	function buildVisual() {
		let year_diff=0;//80-14;
		
		xscale=d3.scale.linear().domain(extents.born).range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]);
		
		agescale=d3.scale.ordinal().domain(extents.age).rangePoints([-(year_diff)*(xscale(31)-xscale(30)),0]);

		yscale=d3.scale.linear().domain(extents.family).range([HEIGHT-(margins.top+margins.bottom),0]).nice();

		let line = d3.svg.line()
				    .x(function(d) { console.log(d.x,xscale(d.x),xscale.domain());return xscale(d.x); })
				    .y(function(d) { return yscale(d.y); })
				    .defined(function(d) { return d.y; })
		
		let axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")

		let country=svg.append("g")
							.attr("class","countries")
							.selectAll("g.country")
							.data(people.filter(d => options.countries.indexOf(d.key)>-1))
							.enter()
							.append("g")
								.attr("class",d=>(d.key.toLowerCase()+" country"))
								//.classed("unselected",d=>d.key!==options.selected)
								.attr("rel",d=>d.key)

		country.filter(d=>d.key===options.selected).moveToFront();

		/*country.on("mouseenter",(d)=>{
			country.classed("unselected",true).filter(c=>c.key===d.key).classed("unselected",false).moveToFront();
		})*/

		let person=country
							.selectAll("g.generation")
							.data(d=>d.values.filter(d=>(d.key%5===0)))
							.enter()
								.append("g")
								.attr("class","generation")
								.attr("rel",d=>d.key)
								//.attr("transform",d => ("translate("+xscale(+d.key)+",0)"))
		
		person
				//.filter(d=>d.key==="20 to 24 years")
				.append("path")
				.attr("d",d => {
						let values=d.values.map(v => {
							return {
								x:v.year,
								y:v.family
							}
						});

						return line(values)
					}
				)
		person
			.append("circle")
			.attr("class","life")
			.datum(d=>d.values[d.values.length-1])
			.attr("cx",d=>xscale(d.year))
			.attr("cy",d=>yscale(d.family))
			.attr("r",2)
		
		person
			.append("circle")
			.attr("class","life")
			.datum(d=>d)
			.attr("cx",d=>xscale(+d.key))
			.attr("cy",d=>yscale(d.values[0].family))
			.attr("r",2)

		person
			.append("line")
			.attr("class","life")
			.datum(d=>d)
			.attr("x1",d=>xscale(d.key))
			.attr("y1",d=>yscale(d.values[0].family))
			.attr("x2",d=>xscale(d.values[0].year))
			.attr("y2",d=>yscale(d.values[0].family))

		let yAxis = d3.svg.axis()
				    .scale(yscale)
				    .orient("left")
				    //.ticks(options.indicator.ticks || 5)
					//.tickValues((d,i) => {})
				    .tickFormat((d)=>{
				    	return "$"+d3.format(",.0d")(d);
				    })
				    

		let yaxis=axes.append("g")
			      .attr("class", "y axis")
			      .attr("transform", "translate("+(0)+"," + 0 + ")")
			      .call(yAxis);

		yaxis.selectAll(".tick")
				.filter((d,i) => d!==0)
				.select("line")
					//.classed("visible",true)
					.attr("x2",(d,i) => {
						return xscale.range()[1]
					})
		yaxis.selectAll(".tick")
				.select("text")
					.attr("x",0)
					.attr("y","-7")

		let xAxis = d3.svg.axis()
				    .scale(xscale)
				    .orient("bottom")
				    

		let xaxis=axes.append("g")
			      .attr("class", "x axis")
			      .attr("transform", "translate("+0+"," + (yscale.range()[0]) + ")")
			      .call(xAxis);

		
	}

	/*function updateExtents() {	
		
		extents={
			born:[1900,2015],
			years:d3.extent(data,d=>d.year),
			family:d3.extent(data.filter(d=>d.family>0),d=>d.family),
			single:d3.extent(data.filter(d=>d.single>0),d=>d.single),
			age:d3.set(data.map(d=>d.Age)).values()
		}

	} */
}
d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};