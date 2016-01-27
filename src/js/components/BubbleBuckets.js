import { nestDataByCountry,updateExtents } from '../lib/utils';

export function BubbleBuckets(data,options) {

	let nested_data=nestDataByCountry(data,options.group_years);
	

	if(options.filter) {
		if(options.filter.ages) {
			console.log(options.filter.ages)
			nested_data=nested_data.map(d=>{

				d.values=d.values.filter(v=>options.filter.ages.indexOf(v.key)>-1);

				return d;
			})		
		}
	}
	
	//console.log(nested_data)

	//return;
	let bubble_buckets=[];

	let extents=updateExtents(data);

	let buckets=d3.select(options.container)
					.append("div")
						.attr("class","buckets")
						.selectAll("div.bucket")
						.data(nested_data)
						.enter()
						.append("div")
							.attr("class","bucket");
	let margins={
			top:10,
			bottom:0,
			left:10,
			right:10
		};
	let bucket=buckets.append("div")
					.attr("class","chart")
					.each(function(d,i){
						bubble_buckets.push(
							new BubbleBucket(d,{
								container:this,
								extents:extents,
								margins:margins,
								first:!i,
								ages:options.ages,
								mouseMoveCallback:(year,value)=>{
									bubble_buckets.forEach(d=>{d.update(year,value)})
								}
							})
						);
					})

	buckets.append("h3")
				.html(d=>d.key)

	this.updateAge=(age)=>{

		options.filter.ages=[age];

		nested_data=nestDataByCountry(data,options.group_years);
	

		if(options.filter) {
			if(options.filter.ages) {
				console.log(options.filter.ages)
				nested_data=nested_data.map(d=>{

					d.values=d.values.filter(v=>options.filter.ages.indexOf(v.key)>-1);

					return d;
				})		
			}
		}

		console.log(nested_data)

		buckets
			.data(nested_data)
				.select("div.chart")
				.each(function(d,i){
					console.log(i,d)
					bubble_buckets[i].updateAge(d);
				})

		//bubble_buckets.forEach(d=>{d.updateAge(age)})
	}

	new Slider(data,{
		container:options.container,
		dragCallback:(year)=>{
			bubble_buckets.forEach(d=>{d.update(year)})
			
		}
	})	

}
function BubbleBucket(data,options) {

	let svg=d3.select(options.container)
				.append("svg");

	let CURRENT_YEAR=0;

	let box=svg.node().getBoundingClientRect();
	let WIDTH = options.width || box.width,
		HEIGHT= options.height || box.height;

	let margins=options.margins || {
		top:10,
		right:10,
		bottom:10,
		left:10
	}

	svg.on("mousemove",function(){
		let x=d3.mouse(this)[0]-margins.left;
		//console.log(x,this)
		let year=Math.floor((x/(WIDTH-(margins.left+margins.right))) * (2013-1978))+1978;
		//console.log(x,year)
		if(year>=1978 && year<=2013) {
			if(options.mouseMoveCallback) {
				//console.log(data.values[0])
				let value=data.values[0].values.find(d=>(year===+d.key));
				if(value) {
					value=value.values.family;
					options.mouseMoveCallback(year,value);
				}
				
			}	
		}
	})

	//console.log(data.key,data.values)

	let xscale=d3.scale.ordinal().domain(data.values.map(d=>d.key)).rangePoints([0,WIDTH-(margins.left+margins.right)]),
		sparkline_xscale=d3.scale.linear().domain(options.extents.years).range([0,(WIDTH-(margins.left+margins.right))/1]),
		yscale=d3.scale.linear().domain([0,options.extents.family[1]]).range([HEIGHT-(margins.top+margins.bottom),0]);

	let axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+(margins.left)+","+margins.top+")")

	let bubbles=svg.append("g")
					.attr("class","bubbles")
					.attr("transform","translate("+(margins.left)+","+margins.top+")")

	let bucket_year=svg.append("g")
					.attr("class","bucket-year")
					.attr("transform","translate("+(WIDTH/2)+","+(HEIGHT-2)+")");

	let range=axes.selectAll("g.range")
					.data(data.values)
					.enter()
					.append("g")
						.datum(d => {
							d.extents=d3.extent(d.values.filter(v=>v.values.family>0),v=>v.values.family)
							//console.log(d)
							return d;
						})
						.attr("class","range")
						.classed("highlight",d => options.ages.indexOf(d.key)>-1)
						.attr("transform",d=>{
							let x=-margins.left,//xscale(d.key),
								y=0;
							return `translate(${x},${y})`;
						})
	range
		.filter(d=>(d.extents[0] && d.extents[1]))
		.append("rect")
		.attr("x",0)
		.attr("y",d=>{
			return yscale(d.extents[1])-2
		})
		.attr("width",WIDTH)
		.attr("height",d=>{
			return yscale(d.extents[0])-yscale(d.extents[1])+4
		})
	range
		.filter(d=>(d.extents[0] && d.extents[1]))
		.append("line")
			.attr("class","l1")
			.attr("x1",0)
			.attr("y1",d=>yscale(d.extents[0])+2)
			.attr("x2",WIDTH)
			.attr("y2",d=>yscale(d.extents[0])+2)
	range
		.filter(d=>(d.extents[0] && d.extents[1]))
		.append("line")
			.attr("class","l2")
			.attr("x1",0)
			.attr("y1",d=>yscale(d.extents[1])-2)
			.attr("x2",WIDTH)
			.attr("y2",d=>yscale(d.extents[1])-2)

	let gauge=range.append("line")
					.attr("class","gauge hidden")
					.attr("x1",0)
					.attr("x2",WIDTH)
					.attr("y1",0)
					.attr("y1",0)

	let sparkline=bubbles.selectAll("g.sparkline")
					.data(data.values)
					.enter()
					.append("g")
						.attr("class","sparkline")
						.classed("highlight",d => options.ages.indexOf(d.key)>-1)
						.attr("transform",d=>{
							let x=0,//xscale(d.key)-sparkline_xscale.range()[1]/2,
								y=0;
							return `translate(${x},${y})`;
						})
	let line = d3.svg.line()
				    .x(function(d) { return sparkline_xscale(d.x); })
				    .y(function(d) { return yscale(d.y); })
				    .defined(function(d) { return d.y; })
				    //.interpolate("cardinal")
					//.tension(0)
	sparkline.append("path")
				/*.attr("transform",d=>{
					let x=-sparkline_xscale(+d.values[0].key),
						y=0;
					return `translate(${x},${y})`;
				})*/
				.attr("d",d=>{
					return line(d.values.map(v=>{
						return {
							x:+v.key,
							y:v.values.family
						}
					}))
				})

	let bubble=bubbles.selectAll("g.bubble")
					.data(data.values)
					.enter()
					.append("g")
						.attr("class","bubble")
						.classed("highlight",d => options.ages.indexOf(d.key)>-1)
						.attr("transform",d=>{
							let x=sparkline_xscale(d.values[d.values.length-1].key),//xscale(d.key),
								y=yscale(d.values[d.values.length-1].values["family"]);
							return `translate(${x},${y})`;
						})
						.style("opacity",d=>{
							return d.values[0].values["family"]===0?0:1;
						})
	bubble.append("circle")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",d=>{
				return options.ages.indexOf(d.key)>-1?5:3
			})

	bucket_year
			.append("text")
			.attr("x",0)
			.attr("y",0)
			.text(d=>{
				let values=data.values.map(v=>v.values);
				//console.log("AAAAHHH",values[0][values[0].length-1].key)
				//let year=d3.min(values.map(v=>d3.min(v,y=>+y.key)))
				//console.log("!",year)
				CURRENT_YEAR=+values[0][values[0].length-1].key;

				return CURRENT_YEAR;
			})

	let yAxis = d3.svg.axis()
			    .scale(yscale)
			    .orient("left")
			    //.ticks(options.indicator.ticks || 5)
				//.tickValues((d,i) => {})
				//.ticks(5)
				.tickValues(()=>{
					return ([0]).concat(yscale.ticks(2))
				})
			    .tickFormat((d)=>{
			    	//if(!d) return "";
			    	return "$"+d3.format(",.0")(d/1000)+"k";
			    })
			    

	let yaxis=axes.append("g")
		      .attr("class", "y axis")
		      .classed("hidden",!options.first)
		      .attr("transform", "translate("+(-margins.left)+"," + 0 + ")")
		      .call(yAxis);

	yaxis.selectAll(".tick")
			//.filter((d,i) => d!==0)
			.select("line")
				//.classed("visible",true)
				.attr("x2",(d,i) => {
					return WIDTH
				})
	yaxis.selectAll(".tick")
			.select("text")
				.attr("x",0)
				.attr("y","-7")
	

	this.updateAge = (data) => {
		updateAge(data);
	}

	function updateAge(__data) {
		
		data=__data;

		//console.log("---->",data)

		bubble.data(data.values);
		bubble
			.transition()
			.duration(500)
			.delay(250)
			.attr("transform",d=>{
							//console.log(CURRENT_YEAR)
							//console.log(d.values,d.values.find(d=>{console.log(+d.key,CURRENT_YEAR);return +d.key===CURRENT_YEAR}))
							let x=sparkline_xscale(CURRENT_YEAR),//xscale(d.key),
								y=yscale(d.values.find(d=>{return +d.key===CURRENT_YEAR}).values["family"]);
							return `translate(${x},${y})`;
						})

		sparkline.data(data.values);
		sparkline
			.transition()
			.duration(500)
			.delay(250)
			/*.attr("transform",d=>{
						let x=0,//xscale(d.key)-sparkline_xscale.range()[1]/2,
							y=0;
						//console.log(d.key,xscale.domain(),xscale(d.key),`translate(${x},${y})`)
						return `translate(${x},${y})`;
					})*/
					.select("path")
					.attr("d",d=>{
						return line(d.values.map(v=>{
							return {
								x:+v.key,
								y:v.values.family
							}
						}))
					})

		range
			.data(data.values)
			.datum(d => {
				d.extents=d3.extent(d.values.filter(v=>v.values.family>0),v=>v.values.family)
				//console.log(d)
				return d;
			})

		range
			.filter(d=>(d.extents[0] && d.extents[1]))
			.select("rect")
				.transition()
				.duration(500)
				.delay(250)
					.attr("y",d=>{
						return yscale(d.extents[1])-2
					})
					.attr("height",d=>{
						return yscale(d.extents[0])-yscale(d.extents[1])+4
					})
		range
			.filter(d=>(d.extents[0] && d.extents[1]))
			.select("line.l1")
				.transition()
				.duration(500)
				.delay(250)
					.attr("y1",d=>yscale(d.extents[0])+2)
					.attr("y2",d=>yscale(d.extents[0])+2)
		range
			.filter(d=>(d.extents[0] && d.extents[1]))
			.select("line.l2")
				.transition()
				.duration(500)
				.delay(250)
					.attr("y1",d=>yscale(d.extents[1])-2)
					.attr("y2",d=>yscale(d.extents[1])-2)

	}

	this.update = (year,value) => {
		update(year,value);
	}

	function update(year,value) {
		//console.log(data.key,year)
		
		bucket_year.select("text").text((d)=>{
			//console.log(d)
			let values=data.values.map(v=>v.values);
			//console.log(values)
			let years=values[0].filter(v=>{return +v.key<=year})
			//console.log("!",years)
			if(!years.length) {
				years=[values[0][0]];
			}
			CURRENT_YEAR=+years[years.length-1].key;
			return CURRENT_YEAR;
		});
		/*sparkline
			.select("path")
				.transition()
				.duration(100)
				.attr("transform",d=>{

					let values=data.values.map(v=>v.values);
					//console.log(values)
					let years=values[0].filter(v=>{return +v.key<=year})
					//console.log("!",years)
					if(!years.length) {
						years=[values[0][0]];
					}
					let __year=years[years.length-1].key

					let x=-sparkline_xscale(__year),
						y=0;
					return `translate(${x},${y})`;
				})*/
		//console.log(value)
		gauge
			.classed("hidden",false)
			.transition()
			.duration(50)
			.attr("y1",yscale(value)).attr("y2",yscale(value))

		bubble
			.classed("higher",d=>{
				let __value=d.values.filter(v=>{return +v.key<=year});

				if(!__value.length) {
					__value=[d.values[0]];
				}

				return value<__value[__value.length-1].values["family"];
			})
			.classed("lower",d=>{
				let __value=d.values.filter(v=>{return +v.key<=year});

				if(!__value.length) {
					__value=[d.values[0]];
				}

				return value>__value[__value.length-1].values["family"];
			})
			.transition()
			.duration(50)
			.attr("transform",d=>{
				

				let value=d.values.filter(v=>{return +v.key<=year});

				if(!value.length) {
					value=[d.values[0]];
				}
				//console.log(year,value[0])

				let x=sparkline_xscale(+value[value.length-1].key),//xscale(d.key),
					y=yscale(value[value.length-1].values["family"]);

				return `translate(${x},${y})`;
			})
			.style("opacity",d=>{
				let value=d.values.filter(v=>{return +v.key<=year});

				if(!value.length) {
					value=[d.values[0]];
				}

				let y=value[value.length-1].values["family"];

				return (y/yscale.domain()[1]===0?0:1);
			})
	}

}
function Slider(data,options){

	//xscale=d3.scale.ordinal().domain(data.values.map(d=>d.key)).rangePoints([0,WIDTH-(margins.left+margins.right)]),

	let slider=d3.select(options.container)
					.append("svg")
						.attr("class","slider");
	
	let box=slider.node().getBoundingClientRect();
	let WIDTH = options.width || box.width,
		HEIGHT= options.height || box.height;

	slider.append("line")
				.attr("x1",0)
				.attr("y1",HEIGHT/2)
				.attr("x2",WIDTH)
				.attr("y2",HEIGHT/2)
	
	let handle=slider
					.append("g")
						.attr("class","handle")
						.attr("transform","translate(20,"+(HEIGHT/2)+")")
	handle.append("circle")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",5)
	handle.append("text")
			.attr("x",0)
			.attr("y",20)
			.text(1978)

	

	let drag = d3.behavior.drag()
						//.origin(function(d) { return d; })
    					//.on("drag", dragmove);
    drag.on("dragstart", (d) => {
		d3.event.sourceEvent.stopPropagation(); // silence other listeners

		//console.log("dragstart")

		if (this.isAndroid && window.GuardianJSInterface) {
			window.GuardianJSInterface.registerRelatedCardsTouch(true);
		}
	})
	.on("dragend",function(){
		//console.log("dragend")
		if (this.isAndroid && window.GuardianJSInterface) {
			window.GuardianJSInterface.registerRelatedCardsTouch(false);
		}
	})
	.on("drag",function(d){
		//console.log(d3.event);
		let year=Math.floor((d3.event.x/(WIDTH-40)) * (2013-1978))+1978;
		if(year>=1978 && year<=2013) {
			handle.attr("transform","translate("+(d3.event.x+20)+","+(HEIGHT/2)+")")
			handle.select("text")
						.text(year)
			if(options.dragCallback) {
				options.dragCallback(year);
			}	
		}
		
	})


    handle.call(drag);
}
 