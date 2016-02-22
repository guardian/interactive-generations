import { nestDataByCountryAgeYearsRanking,getShortAgeGroup,AGES,COUNTRY_NAMES,AGES_GENERATIONS,GENERATIONS } from '../lib/utils';

export default function FettuccineChart(data,options) {

	let flat_data=nestDataByCountryAgeYearsRanking(data,[options.country || "UK"]);

	console.log(flat_data)

	let chart=d3.select(options.container).append("div");
	chart.append("h2").text(COUNTRY_NAMES[options.country])

	let svg=chart.append("svg")

	buildVisual();

	function buildVisual() {

		let box=svg.node().getBoundingClientRect();
		let WIDTH = options.width || box.width,
			HEIGHT= options.height || box.height;
		//console.log(HEIGHT)
		
		let margins=options.margins || {
			top:10,
			bottom:10,
			left:10,
			right:10
		};

		let padding=options.padding || {
			top:0,
			bottom:0,
			left:0,
			right:0
		};

		let extents={
			x:[1978,2013],
			y:[0,420000],
			h:[4000,48000]
		}
		let thickness=40;
		let xscale=d3.scale.linear().domain(extents.x).range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]),
			yscale=d3.scale.linear().domain(extents.y).range([HEIGHT-(margins.top+margins.bottom)-thickness,0]),
			hscale=d3.scale.linear().domain(extents.h).range([0,thickness]);

		let defs=svg.append("defs");

		/*svg.append("line")
				.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")
				.attr("x1",0)
				.attr("y1",yscale.range()[0]+thickness)
				.attr("x2",xscale.range()[1])
				.attr("y2",yscale.range()[0]+thickness)*/
		let axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")

		let plot=svg.append("g")
					.attr("class","plots")
						.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")
						.selectAll("g.plot")
						//.data(AGES.map(age=>flat_data.filter(d=>d.age===age)))
						.data(AGES.filter(d=>(d!=="TOTAL")).map(d=>{
							return {
								age:d,
								values:flat_data.filter(v=>v.age===d)
							}
						}))
						.enter()
						.append("g")
							.attr("class",d=>("plot "+GENERATIONS[AGES_GENERATIONS[d.age]].short_name))
							.attr("rel",d=>d.age)
		plot.on("mouseenter",function(){
			d3.select(this).moveToFront();
		})


		let line = d3.svg.line()
				    .x(function(d) { return xscale(d.x); })
				    .y(function(d) { return (d.y); })
				    //.defined(function(d) { return d.y; })
				    .interpolate("cardinal")

		plot
			//.filter(d=>(d.age==="70 to 74 years"))
			.append("path")
				.attr("d",(d,i)=>{
					//console.log(d)
					let reversed_values=[];
					let values=d.values.map(v=>{
							
							let value= {
								x:+v.year,
								y:yscale(v.stacked_value),
								yh2:yscale(v.stacked_value)+hscale(v.income)/2,
								income:v.income
							};

							//console.log([value]);
							
							reversed_values=([value]).concat(reversed_values);

							return value;
						}).sort((a,b)=>(a.x-b.x))

					reversed_values=reversed_values.sort((a,b)=>(b.x-a.x)).map(v=>({
							x:v.x,
							y:v.y+hscale(v.income),
							income:v.income
						}));

					let all_values=values.concat(reversed_values);
				
					let curve_id=options.index+"_curve_"+i;

					//let years=d3.range(xscale.domain()[1]-xscale.domain()[0]).map(d=>(xscale.domain()[0]+d));
					let year=Math.floor(Math.random() * ((xscale.domain()[1]-3) - (xscale.domain()[0]+4))) + (xscale.domain()[0]+4);
					//console.log("->",year)
					d.startOffset=(Math.floor(Math.random() * (90-10)) + 10)+"%";
					defs.append("path")
						.attr("id",curve_id)
						//.attr("d",line(values.filter(v=>(v.x>=year)).map(v=>({x:v.x,y:v.yh2}))));
						.attr("d",line(values.map(v=>({x:v.x,y:v.yh2}))));

					d.curve="#"+curve_id;


					return line(values)+line(reversed_values).replace(/M/,"L")+"Z";//.concat(copied_values.reverse()));

				})
				//.style("filter","url(#dropshadow)")
		
		plot
			.append("text")
				.attr("class","label bg")
				.attr("dy","0.3em")
				.append("textPath")
				.attr("xlink:href",d=>d.curve)
				.attr("startOffset",d=>d.startOffset)
				.text(d=>d.age)

		plot
			.append("text")
				.attr("class","label")
				.attr("dy","0.3em")
				.append("textPath")
				.attr("xlink:href",d=>d.curve)
				.attr("startOffset",d=>d.startOffset)
				.text(d=>d.age)
		/*plot
			.append("use")
			.attr("id", (d,i)=>"curve-line"+i)
    		.attr("xlink:href", d=>d.curve)
    		.style({
    			stroke:"#000",
    			"stroke-width":1,
    			"fill":"none"
    		})*/

		let xAxis = d3.svg.axis()
				    .scale(xscale)
				    .orient("bottom")
				    //.ticks(2)
				    .tickValues(()=>{
						return xscale.ticks();
					})
				    .tickFormat((d)=>{
				    	let year=d3.format("0d")(d);
				    	/*if(!SMALL) {
				    		return year;	
				    	}*/
				    	if(year%1000===0) {
				    		return year;
				    	}
				    	return "'"+year.substr(2)
				    })
				    

		let xaxis=axes.append("g")
			      .attr("class", "x axis")
			      //.classed("hidden",!options.first)
			      //.classed("hidden",!options.axis.x)
			      .attr("transform", "translate("+0+"," + (yscale.range()[0]+thickness - 10) + ")")
			      .call(xAxis);

		xaxis.selectAll(".tick")
				.select("line")
					.attr("y2",-yscale.range()[0])

	}
}