import { nestDataByCountry,updateExtents,nestDataByYear,AGES_GENERATIONS,GENERATIONS,COUNTRY_NAMES,COUNTRIES } from '../lib/utils';

export function BubbleBuckets(data,options) {

	let FIELDNAME="income";

	let nested_data=nestDataByCountry(data,options.group_years);
	let nested_data_year=nestDataByYear(data);
	//console.log(nested_data,nested_data_year)

	nested_data.forEach(d=>{
		let range=nested_data_year.find(y=>y.key===d.key);
		d.range=range.values.map(v=>{
					return {
						year:v.key,
						value:v.values[FIELDNAME]
					}
				}
			)
	})

	if(options.filter) {
		if(options.filter.ages) {
			//console.log(options.filter.ages)
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
						.data(nested_data.sort((a,b)=>(COUNTRIES.indexOf(a.key)-COUNTRIES.indexOf(b.key))))
						.enter()
						.append("div")
							.attr("class","bucket")
							.classed("selected",d=>options.countries.indexOf(d.key)>-1)
							.on("click",(d)=>{
								console.log(d)
								if(options.clickCallback) {
									options.clickCallback(d.key);
								}
							})
	let margins={
			top:10,
			bottom:30,
			left:10,
			right:10
		};
	/*
	let annotations=buckets
		.filter(d=>{
			//console.log(d.key,d.values[0].key)
			d.annotations=options.annotations.filter(a=>{
				return a.country===d.key && a.age===d.values[0].key
			}).map(a=>{
				a.value=data.find(v=>(v.age===a.age && v.Country===a.country));
				return a;
			})
			//d.annotations=annotations;
			//console.log(annotations)
			return d.annotations.length>0;
		})
		.selectAll("div.annotation")
		.data(d=>d.annotations)
		.enter()
			.append("div")
				.attr("class","annotation top")
				.html(d=>{
					return "<p>"+d.text+"</p>";
				})*/

	buckets.append("h3")
				.html(d=>COUNTRY_NAMES[d.key])

	let WIDTH=d3.select(options.container).node().getBoundingClientRect().width;

	let bucket=buckets.append("div")
					.attr("class","chart")
					.each(function(d,i){
						bubble_buckets.push(
							new BubbleBucket(d,{
								container:this,
								extents:extents,
								margins:margins,
								//width:WIDTH/10,
								first:!i,
								ages:options.ages,
								mouseMoveCallback:(year,value)=>{
									bubble_buckets.forEach(d=>{d.update(year,value)})
								}//,
								//annotations:annotations.filter(a=>a.country===d.key)
							})
						);
					})

	

	


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
			//.data(nested_data)
			.data(nested_data.sort((a,b)=>(COUNTRIES.indexOf(a.key)-COUNTRIES.indexOf(b.key))))
				.select("div.chart")
				.each(function(d,i){
					console.log(i,d)
					bubble_buckets[i].updateAge(d,age);
				})

		//bubble_buckets.forEach(d=>{d.updateAge(age)})
	}

	this.selectCountry=(country)=>{
		buckets.classed("selected",d=>(d.key===country));
	}

	new Slider(data,{
		container:options.container,
		dragCallback:(year)=>{
			bubble_buckets.forEach(d=>{d.update(year)})
			
		}
	})	

}
function BubbleBucket(data,options) {

	let FIELDNAME="income";
	//console.log("bubblebucket",data)

	let svg=d3.select(options.container)
				.append("svg");
	if(options.width) {
		svg.style("width",options.width+"px").attr("width",options.width)
	}

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
					value=value.values[FIELDNAME];
					options.mouseMoveCallback(year,value);
				}
				
			}	
		}
	})

	//console.log(data.key,data.values)

	let xscale=d3.scale.ordinal().domain(data.values.map(d=>d.key)).rangePoints([0,WIDTH-(margins.left+margins.right)]),
		sparkline_xscale=d3.scale.linear().domain(options.extents.years).range([0,(WIDTH-(margins.left+margins.right))/1]),
		yscale=d3.scale.linear().domain([0,options.extents.income[1]]).range([HEIGHT-(margins.top+margins.bottom),0]);

	let deviation=svg.append("g")
					.attr("class","deviation")
					.attr("transform","translate("+(margins.left)+","+margins.top+")")

	let axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+(margins.left)+","+margins.top+")")

	let bubbles=svg.append("g")
					.attr("class","bubbles")
					.attr("transform","translate("+(margins.left)+","+margins.top+")")

	let bucket_year=svg.append("g")
					.attr("class","bucket-year")
					.attr("transform","translate("+(WIDTH/2)+","+(HEIGHT-5)+")");

	let range=axes.selectAll("g.range")
					.data(data.values)
					.enter()
					.append("g")
						.datum(d => {
							//console.log(d.values)
							d.extents=d3.extent(d.values.filter(v=>v.values[FIELDNAME]>0),v=>v.values[FIELDNAME])
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
						.attr("class","sparkline "+GENERATIONS[AGES_GENERATIONS[options.ages[0]]].short_name)
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
							y:v.values[FIELDNAME]
						}
					}))
				})

	let bubble=bubbles.selectAll("g.bubble")
					.data(data.values)
					.enter()
					.append("g")
						.attr("class","bubble "+GENERATIONS[AGES_GENERATIONS[options.ages[0]]].short_name)
						.classed("highlight",d => options.ages.indexOf(d.key)>-1)
						.attr("transform",d=>{
							let x=sparkline_xscale(d.values[d.values.length-1].key),//xscale(d.key),
								y=yscale(d.values[d.values.length-1].values[FIELDNAME]);
							return `translate(${x},${y})`;
						})
						.style("opacity",d=>{
							return d.values[0].values[FIELDNAME]===0?0:1;
						})
	bubble.append("circle")
			.attr("cx",0)
			.attr("cy",0)
			.attr("r",d=>{
				return options.ages.indexOf(d.key)>-1?3:2
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

	deviation.append("path")
			.attr("d",()=>{

				let points1=data.range.map(d=>({x:+d.year,y:d.value[0]})),
					points2=data.range.map(d=>({x:+d.year,y:d.value[1]})).reverse();
				
				//console.log("POINTS",points);

				return line(points1.concat(points2));

			})
	deviation.append("path")
			.attr("class","border")
			.attr("d",()=>{
				return line(data.range.map(d=>({x:+d.year,y:d.value[0]})));
			})
	deviation.append("path")
			.attr("class","border")
			.attr("d",()=>{
				return line(data.range.map(d=>({x:+d.year,y:d.value[1]})));
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
				.classed("hidden",1)//d=>(d!==0))
				.attr("x2",(d,i) => {
					return WIDTH
				})
	yaxis.selectAll(".tick")
			.select("text")
				.attr("x",0)
				.attr("y","-7")
	
	/*options.annotations
		.style("left",d=>{
			console.log("annotations",d);
			return (sparkline_xscale(d.year)+margins.left+5)+"px"
		})
		.style("top",d=>{
			console.log("annotations",d);
			return (yscale(d.value[FIELDNAME])-margins.top)+"px"
		})*/


	this.updateAge = (data,age) => {
		updateAge(data,age);
	}

	function updateAge(__data,age) {
		
		data=__data;
		options.ages=[age];

		console.log("---->",options.ages,data)

		CURRENT_YEAR=+data.values[0].values[data.values[0].values.length-1].key

		bucket_year.select("text").text(CURRENT_YEAR);

		bubble.data(data.values);
		bubble
			.attr("class","bubble "+GENERATIONS[AGES_GENERATIONS[options.ages[0]]].short_name)
			.transition()
			.duration(500)
			.delay(250)
			.attr("transform",d=>{
							console.log(CURRENT_YEAR,d)
							//console.log(d.values,d.values.find(d=>{console.log(+d.key,CURRENT_YEAR);return +d.key===CURRENT_YEAR}))
							console.log("VALUES",d.values)
							let x=sparkline_xscale(CURRENT_YEAR),//xscale(d.key),
								y=yscale(d.values.find(d=>{return +d.key===CURRENT_YEAR}).values[FIELDNAME]);
							
							return `translate(${x},${y})`;
						})
			

		sparkline.data(data.values);
		sparkline
			.attr("class","sparkline "+GENERATIONS[AGES_GENERATIONS[options.ages[0]]].short_name)
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
								y:v.values[FIELDNAME]
							}
						}))
					})

		range
			.data(data.values)
			.datum(d => {
				d.extents=d3.extent(d.values.filter(v=>v.values[FIELDNAME]>0),v=>v.values[FIELDNAME])
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

				return value<__value[__value.length-1].values[FIELDNAME];
			})
			.classed("lower",d=>{
				let __value=d.values.filter(v=>{return +v.key<=year});

				if(!__value.length) {
					__value=[d.values[0]];
				}

				return value>__value[__value.length-1].values[FIELDNAME];
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
					y=yscale(value[value.length-1].values[FIELDNAME]);

				return `translate(${x},${y})`;
			})
			.style("opacity",d=>{
				let value=d.values.filter(v=>{return +v.key<=year});

				if(!value.length) {
					value=[d.values[0]];
				}

				let y=value[value.length-1].values[FIELDNAME];

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
 