import { updateExtents,nestDataByAgeGroup,AGES_GENERATIONS,GENERATIONS,COUNTRY_NAMES } from '../lib/utils';
import { appendShadow } from '../lib/CSSUtils';

export default function ArrowScatterplot(data,options) {

	let FIELDNAME="income";
	console.log(options)
	let nested_data=nestDataByAgeGroup(data,options.group_years,options.ages,options.countries);
	console.log("NESTED_DATA",nested_data)

	let chart=d3.select(options.container).append("div");
	chart.append("h2").text(COUNTRY_NAMES[options.countries])

	let svg=chart.append("svg")

	if(options.height) {
		svg.attr("height",options.height)
	}
	let colors={
		"under-20s":"#e31f26",
		"gen-y":"#f37021",
		"gen-x":"#fdb913",
		"baby-boomers":"#fcdd03",
		"over-70s":"#c5d4ea",
		"average":"#000"
	};
	let defs=svg.append("defs");
	d3.entries(colors).forEach(d=>{

		console.log(d)

		defs.append("marker")
			.attr({
				id:"markerArrow-"+d.key,
				markerWidth:13,
				markerHeight:13,
				refX:15,
				refY:6,
				orient:"auto",
				markerUnits:"userSpaceOnUse"
			})
			.append("path")
				.attr("d","M2,1 L2,11 L10,6z")
				.style("fill",d.value)
				.attr("class","marker-arrow")
	})
	

	let box=svg.node().getBoundingClientRect();
	let WIDTH = options.width || box.width,
		HEIGHT= options.height || box.height;
	//console.log(HEIGHT)
	
	let margins=options.margins || {
		top:30,
		bottom:30,
		left:20,
		right:30
	};

	let padding=options.padding || {
		top:0,
		bottom:0,
		left:0,
		right:0
	};

	let arrow,axes;

	//let extents=options.extents;
	
	let extents=updateExtents(data);
	console.log(extents)
	let family_path,single_path;

	let xscale=d3.scale.linear().domain([5000,40000]).range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]),
		yscale=d3.scale.linear().domain(extents.perc).range([HEIGHT-(margins.top+margins.bottom),0]);


	let line = d3.svg.line()
				    .x(function(d) { return xscale(d.x); })
				    .y(function(d) { return yscale(d.y); })
				    .defined(function(d) { return d.y; })

	buildVisual();

	function buildVisual() {

		axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")

		arrow=svg.append("g")
							.attr("class","ages-timelines")
							.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")
							.selectAll("g.age-timeline")
							.data(nested_data.filter(d=>(d.key!=="TOTAL")),(d)=>{
								//console.log(d)
								return (d.key);
							})
							.enter()
							.append("g")
								.attr("class",d=>("age-timeline "+GENERATIONS[AGES_GENERATIONS[d.key]].short_name))
								.classed("selected",d=>(options.selected_ages.indexOf(d.key)>-1))
								//.classed("unselected",d=>(options.selected_ages.indexOf(d.key)===-1))
								.attr("rel",d=>d.key)
								.each(function(d){
									if(options.selected_ages.indexOf(d.key)>-1) {
										d3.select(this).moveToFront();
									}
								})
		
		/*age_timeline.filter(d=>(options.selected_ages.indexOf(d.key)>-1))
								.moveToFront();
								

		age_timeline.append("path")
					.attr("d",d=>{
						let values=d.values[0].values.map(v=>({year:v.values.year,income:v.values[FIELDNAME],perc:v.values.perc}));
						//console.log(values)
						return line(values.map(v=>({x:v.income,y:v.perc})))
					})
		let age_label=age_timeline.append("g")
					.datum(d=>{
						let values=d.values[0].values,
							value=values[0].values;
						return value;
					})
					.attr("class","age-label")
					.attr("transform",d=>{
						//console.log("----->",d.values[0].values)
						
							let x=xscale(d.income)-15,
								y=yscale(d.perc)+4;

						return `translate(${x},${y})`
					})
		let rect_bg=age_label.append("rect")
					.attr("x",0)
					.attr("y",-15)
					.attr("height",20)
					.attr("rx",5)
					.attr("ry",5);

		let txt=age_label.append("text")
					.attr("x",-5)
					.attr("y",0)
					.text(d=>d.age)

		rect_bg
			.attr("x",-(txt.node().getBBox().width+15))
			.attr("width",txt.node().getBBox().width+15)
		*/



		arrow
			.append("path")
				.attr("transform",d=>{
					
					let value=d.values[0].values[0].values;

					//console.log(value)

					let x=xscale(value.income),
						y=yscale(value.perc);

					return `translate(${x},${y})`
				})
				.datum(d=>{
					let values = d.values[0].values.map(v=>v.values);
					values = values.map(v=>{
							v.max=values.length;
							return v;
						})
						.filter((d,i)=>(i===0 || i===d.max-1));
					let y=yscale(values[1].perc) - yscale(values[0].perc),
						x=xscale(values[1].income) - xscale(values[0].income),
						m=y/x;

					return {
						age:d.key,
						values:[values[0],values[1]],
						x:x,
						y:y,
						alpha:Math.atan2(y,x)
					};
						
				})
				.attr("d",d=>`M0,0L${d.x},${d.y}`)
				.each(function(d){
					let totalLength=this.getTotalLength()-10;
					//console.log(totalLength)
					d3.select(this)
						.attr("stroke-dasharray", totalLength + " " + totalLength)
      					.attr("stroke-dashoffset", 0)
				})
				.style("marker-end",d=>`url(#markerArrow-${GENERATIONS[AGES_GENERATIONS[d.age]].short_name})`);

		arrow.on("mouseenter",function(){
			arrow.classed("selected",false)
			d3.select(this)
				.classed("selected",true)
				.moveToFront();
		})
		
		arrow.append("text")
				.attr("class","title")
				.attr("transform",d=>{
					
					let value0=d.values[0].values[0].values,
						value1=d.values[0].values[d.values[0].values.length-1].values;


					//console.log(value)

					let x=d3.mean([xscale(value0.income),xscale(value1.income)]),
						y=d3.mean([yscale(value0.perc),yscale(value1.perc)]);//yscale(value.income);

					x+=(value1.income < value0.income)?-5:5;
					y+=(value1.perc < value0.perc)?-5:15;
					
					return `translate(${x},${y})`
				})
				.classed("right-aligned",d=>{
					let value0=d.values[0].values[0].values,
						value1=d.values[0].values[d.values[0].values.length-1].values;
					return value1.income < value0.income;
				})
				.text(d=>d.key);

		arrow.each(function(d){
			let txt=d3.select(this).select("text.title").node(),
				bg=txt.parentNode.insertBefore(txt.cloneNode(true),txt);
			d3.select(bg).classed("bg",true);
		})

		
		
		let marker=arrow.append("g")
					.datum(d=>{
						let values=d.values[0].values.map(v=>v.values);
						return values.map(v=>{
							v.max=values.length;
							return v;
						}).filter((d,i)=>(i===0 || i===d.max-1));
					})
						.attr("class","marker")
						/*.classed("hidden",(d,i)=>{
							return (i>0 && i<d.max-1);
						})
						.attr("transform",d=>{
							console.log("------->",d)
							return (`translate(${xscale(d.perc)},${yscale(d.income)})`)
						})*/
		
		/*marker.append("text")
					.attr("class","bg")
					.attr("x",0)
					.attr("y",-8)
						.text(d=>{
							console.log("->",d)
							return d.year
						})*/
		marker.append("text")
					.attr("class","bg")
					.attr("x",d=>xscale(d[0].income))
					.attr("y",d=>{
						let value=d[0].perc,
							value_other=d[1].perc;
						let dy=16;
						if(value>value_other) {
							dy=-8;
						}
						return yscale(value)+dy;
					})
						.text(d=>{
							return d[0].year
						})
		marker.append("text")
					.attr("x",d=>xscale(d[0].income))
					.attr("y",d=>{
						let value=d[0].perc,
							value_other=d[1].perc;
						let dy=16;
						if(value>value_other) {
							dy=-8;
						}
						return yscale(value)+dy;
					})
						.text(d=>{
							return d[0].year
						})
		marker.append("circle")
					.attr("cx",d=>xscale(d[0].income))
					.attr("cy",d=>yscale(d[0].perc))
					.attr("r",4)

		marker.append("text")
					.attr("class","bg")
					.attr("x",d=>xscale(d[1].income))
					.attr("y",d=>{
						let value=d[1].perc,
							value_other=d[0].perc;
						let dy=16;
						if(value>value_other) {
							dy=-8;
						}
						return yscale(value)+dy;
					})
						.text(d=>{
							return d[1].year
						})
		marker.append("text")
					.attr("x",d=>xscale(d[1].income))
					.attr("y",d=>{
						let value=d[1].perc,
							value_other=d[0].perc;
						let dy=16;
						if(value>value_other) {
							dy=-8;
						}
						return yscale(value)+dy;
					})
						.text(d=>{
							return d[1].year
						})
		marker.append("circle")
					.attr("cx",d=>xscale(d[1].income))
					.attr("cy",d=>yscale(d[1].perc))
					.attr("r",4)

		addYAxis();
		addXAxis();
	}
	function addXAxis() {
		let xAxis = d3.svg.axis()
				    .scale(xscale)
				    .orient("bottom")
				    //.ticks(2)
				    /*.tickValues(()=>{
				    	if(SMALL) {
				    		return extents.years;	
				    	}
						return xscale.ticks();
					})*/
				    .ticks(4)
				    .tickFormat((d)=>{
				    	//if(!d) return "";
				    	return "$"+d3.format(",.0")(d);
				    })
				    
				    

		let xaxis=axes.append("g")
			      .attr("class", "x axis")
			      //.classed("hidden",!options.first)
			      //.classed("hidden",!options.axis.x)
			      .attr("transform", "translate("+0+"," + yscale.range()[0] + ")")
			      .call(xAxis);

		xaxis.selectAll(".tick")
				//.filter((d,i) => d!==0)
				.select("line")
					//.classed("visible",true)
					.attr("y1",(d,i)=>{
						return -10
					})
					.attr("y2",(d,i) => {
						//return WIDTH;
						return -yscale.range()[0]
					})

		
	}
	function addYAxis() {
		let yAxis = d3.svg.axis()
				    .scale(yscale)
				    .orient("left")
					/*.tickValues(()=>{
						return ([0]).concat(yscale.ticks(2))
					})*/
					.ticks(4)
					.tickFormat((d)=>{
						if(!d) return "Distance from average";
				    	return d3.format("+,.0%")(d);
				    })
					
				    

		let yaxis=axes.append("g")
			      .attr("class", "y axis")
			      .attr("transform", "translate("+(0)+"," + 0 + ")")
			      .call(yAxis);

		yaxis.selectAll(".tick")
				//.filter((d,i) => d!==0)
				.select("line")
					//.classed("visible",true)
					.attr("x1",(d,i)=>{
						return -10
					})
					.attr("x2",(d,i) => {
						//return WIDTH;
						return xscale.range()[1]
					})
		yaxis.selectAll(".tick")
				.select("text")
					//.attr("x",padding.right)
					.attr("y","-7")

		yaxis.append("line")
				.attr("y1",yscale(0))
				.attr("x1",-7)
				.attr("y2",yscale(0))
				.attr("x2",xscale.range()[1]+7)
	}

}