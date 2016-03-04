import { AGES_GENERATIONS,GENERATIONS,COUNTRY_NAMES } from '../lib/utils';
import { strokeShadow } from '../lib/CSSUtils';
import Voronoi from '../lib/Voronoi';

export default function AgeChart(data,options) {
	
	//console.log("AgeChart",data,options)
	//console.log(options.deviation)

	let FIELDNAME=options.fieldname || "income";

	let SMALL=false;

	let svg=d3.select(options.container)
						.append("svg")

	let defs=svg.append("defs");
		defs.append("marker")
				.attr({
					id:"markerArrowUp",
					markerWidth:13,
					markerHeight:13,
					refX:8,
					refY:6,
					orient:"auto",
					markerUnits:"userSpaceOnUse"
				})
				.append("path")
					.attr("d","M2,1 L2,11 L10,6z")
					.style({
						fill:"#a9af2b",
						stroke:"none"
					})
		defs.append("marker")
				.attr({
					id:"markerArrowDown",
					markerWidth:13,
					markerHeight:13,
					refX:8,
					refY:6,
					orient:"auto",
					markerUnits:"userSpaceOnUse"
				})
				.append("path")
					.attr("d","M2,1 L2,11 L10,6z")
					.style({
						fill:"#dc2a7d",
						stroke:"none"
					})

	if(options.height) {
		svg.attr("height",options.height)
	}

	let number_format=options.number_format || ((d)=>("$"+d3.format(",.0f"))) ;

	let box=svg.node().getBoundingClientRect();
	let WIDTH = options.width || box.width,
		HEIGHT= options.height || box.height;

	SMALL=(WIDTH<=320);
	HEIGHT=SMALL?HEIGHT*0.8:HEIGHT;
	
	let voronoi=false;
	if(options.voronoi) {
		voronoi=new Voronoi(WIDTH,HEIGHT,{
			mouseOverCallback:(d) => {
				highlightAge(d.d.key)
			}
		});
	}
	

	let margins=options.margins || {
		top:20,
		bottom:50,
		left:0,
		right:5
	};

	let padding=options.padding || {
		top:0,
		bottom:0,
		left:0,
		right:0
	};

	let labels=options.labels || {
		y:{
			format:d3.format(",.2"),
			align:"right"
		}
	}

	let country,marker,deviation,axes,label;

	let extents=options.extents;

	//console.log(extents)

	let family_path,other_age;
	//[0,45000]
	let xscale=d3.scale.linear().domain(extents.years).range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]),
		yscale=d3.scale.linear().domain(extents[FIELDNAME]).range([HEIGHT-(margins.top+margins.bottom),0]);

	

	data.forEach(d=>{
		d.markers={};
		d.values.forEach(v=>{

			d.markers[v.year]={
				income:v.income,
				perc:v.perc,
				family:v.family,
				single:v.single,
				year:v.year,
				diff:v.income
			}
			
		})
	})
		

	let line = d3.svg.line()
				    .x(function(d) { return xscale(d.x); })
				    .y(function(d) { return yscale(d.y); })
				    .defined(function(d) { return typeof d.y !== 'undefined'; })

	buildVisual();
	if(options.markers) {
		addMarkers();
		//transition();
	}

	function buildVisual() {
		
		
		
		
		deviation=svg.append("g")
					.attr("class","deviation")
					.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")

		axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")

		country=svg.append("g")
							.attr("class","countries")
							.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")
							.selectAll("g.country")
							.data(data.filter(d => options.countries.indexOf(d.key)>-1),d=>d.year)
							.enter()
							.append("g")
								//.attr("class",d=>(d.key.toLowerCase()+" country "+GENERATIONS[AGES_GENERATIONS[options.age]].short_name))
								.attr("class",d=>{
									//console.log("WHAT COLOR?",d)
									let direction=(d.values[0].perc>d.values[d.values.length-1].perc)?"down":"up";

									return (d.key.toLowerCase()+" country "+direction);

								})
								//.classed("unselected",d=>d.key!==options.selected)
								.attr("rel",d=>{
									//console.log(d)
									return d.key
								})
		


		
		if(options.average) {
			country
				.append("path")
				.attr("class","avg")
				.attr("d",() => {
						let y = yscale(options.average[0][FIELDNAME]);
						return "M"+(-margins.left)+","+y+"L"+(xscale.range()[1]+margins.left+padding.right)+","+y;
						//console.log("AVERAGE",options.average)
						//console.log("AAAAAARGHHHH",options)
						let values=options.average.map(v => {
							return {
								x:v.year,
								y:v[FIELDNAME]
							}
						});
						//console.log("AVERAGE LINE",values)
						return line(values)
					}
				)
			/*country.append("text")
				.attr("class","avg")
				.attr("x",d=>xscale(options.average[d.key==="DE"?3:0].year))
				.attr("y",d=>yscale(options.average[d.key==="DE"?3:0][FIELDNAME])-7)
				.text("Average income")*/
		}

		if(data[0].all) {
			other_age=country.append("g")
					.attr("class","other-ages")
					.selectAll("g.other-age")
					.data(data[0].all,d => d[0].key)
					.enter()
					.append("g")
						/*.attr("class",d=>{							
							return ("other-age "+GENERATIONS[AGES_GENERATIONS[d[0].key]].short_name)
						})*/
						.attr("class",d=>{
							//console.log("WHAT COLOR?",d)
							let direction=(d[0].perc>d[d.length-1].perc)?"down":"up";

							return "other-age "+direction;

						})
						.classed("selected",d=>{
							return options.others.indexOf(d[0].key)>-1
						})

			other_age.append("path")
					.attr("d",d => {
						//console.log("path",d)
						let values=d.map(v => {
							if(voronoi) {
								voronoi.add({
									x:xscale(v.year),
									y:yscale(v[FIELDNAME]),
									d:v
								});	
							}
							
							
							return {
								x:v.year,
								y:v[FIELDNAME]
							}
						});

						return line(values)
					})

			other_age
					.append("text")
					.attr("class","other-line-name bg")
					.attr("x",d=>xscale(d[Math.floor(d.length/4)].year))
					.attr("y",d=>yscale(d[Math.floor(d.length/4)][FIELDNAME]))
					.attr("dy",d=>{
						return 0;
						let d1=d[Math.floor(d.length/4)-1],
							d2=d[Math.floor(d.length/4)+1];

						if(d1[FIELDNAME]>d2[FIELDNAME]) {
							return "-5px";
						}
						return "15px";
					})
					.text(d=>d[Math.floor(d.length/4)].key)
			other_age
					.append("text")
					.attr("class","other-line-name fg")
					.attr("x",d=>xscale(d[Math.floor(d.length/4)].year))
					.attr("y",d=>yscale(d[Math.floor(d.length/4)][FIELDNAME]))
					.attr("dy",d=>{
						return 0;
						let d1=d[Math.floor(d.length/4)-1],
							d2=d[Math.floor(d.length/4)+1];

						if(d1[FIELDNAME]>d2[FIELDNAME]) {
							return "-5px";
						}
						return "15px";
					})
					.text(d=>d[Math.floor(d.length/4)].key)

		}

		if(options.incomes.indexOf("income")>-1) {

			country
				.append("path")
				.attr("class","bg")
				.attr("d",d => {
					//console.log("--------->",d)
					let values=d.values.map(v => {
						//console.log("vvvvvvvvv",v)
						return {
							x:v.year,
							y:v[FIELDNAME]
						}
					});

					return line(values)
				})

			family_path=country
				.append("path")
				.attr("class","family")
				.attr("d",d => {
						//console.log("path",d)
						let values=d.values.map(v => {
							return {
								x:v.year,
								y:v[FIELDNAME]
							}
						});

						return line(values)
					}
				)

			country
				.filter(d=>typeof(d.name)!=='undefined')
					.append("text")
					.attr("class","line-name bg")
					//.attr("x",d=>xscale(d.values[d.values.length-1].year)+14)
					//.attr("y",d=>yscale(d.values[d.values.length-1][FIELDNAME]))
					//.attr("dy","0.25em")
					.attr("x",d=>xscale(d.values[Math.floor(d.values.length*3/4)].year))
					.attr("y",d=>yscale(d.values[Math.floor(d.values.length*3/4)][FIELDNAME]))
					.attr("dy","30px")
					.text(options.age)

			country
				.filter(d=>typeof(d.name)!=='undefined')
					.append("text")
					.attr("class","line-name fg")
					//.attr("x",d=>xscale(d.values[d.values.length-1].year)+14)
					//.attr("y",d=>yscale(d.values[d.values.length-1][FIELDNAME]))
					//.attr("dy","0.25em")
					.attr("x",d=>xscale(d.values[Math.floor(d.values.length*3/4)].year))
					.attr("y",d=>yscale(d.values[Math.floor(d.values.length*3/4)][FIELDNAME]))
					/*.attr("dy",d=>{
						let d1=d.values[Math.floor(d.values.length*3/4)-1],
							d2=d.values[Math.floor(d.values.length*3/4)+1];

						if(d1[FIELDNAME]>d2[FIELDNAME]) {
							return "-10px";
						}
						return "15px";
					})*/
					.attr("dy","30px")
					.text(options.age)
					//.text(d=>d.name)
				
		}

		//if(options.arrow) {
			/*country
				.append("g")
				.attr("class","arrow")
					.datum(d=>{
						let x1=xscale(d.values[0].year),
							x2=xscale(d.values[d.values.length-1].year),
							y1=yscale(d.values[0][FIELDNAME]),
							y2=yscale(d.values[d.values.length-1][FIELDNAME]),
							alpha=Math.atan2()
					})
						.append("line")
						.attr("class","arrow")
						.attr("x1",d=>{
							return xscale(d.values[0].year);
						})
						.attr("y1",d=>{
							return yscale(d.values[0][FIELDNAME]);	
						})
						.attr("x2",d=>{
							return xscale(d.values[d.values.length-1].year);
						})
						.attr("y2",d=>{
							return yscale(d.values[d.values.length-1][FIELDNAME]);	
						})
						.style("marker-end","url(#markerArrow)");*/
		//}
		

		label=country.append("g")
					.attr("class","labels")
					.classed("family",true)
					.selectAll("g.label")
					.data((d,i)=>d.values.map(v=>{
						v.index=i;
						v.length=d.values.length;
						return v;
					}),d=>d.year)
					.enter()
					.append("g")
						.attr("class","label")
						.attr("transform",d=>{
							let x=xscale(d.year),
								y=yscale(d[FIELDNAME])
							return `translate(${x},${y})`
						})
		label.append("circle")
				.attr("class","bg")
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",6)
		label.append("circle")
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",4)
		label.append("text")
				.attr("class","income bg")
				.attr("x",0)
				.attr("y",-10)
				.text((d,i)=>{
					return labels.y.format(d)
				})
		label.append("text")
				.attr("class","income")
				.attr("x",0)
				.attr("y",-10)
				.text((d,i)=>{
					return labels.y.format(d)
				})
		label.append("text")
				.attr("class","year bg")
				.attr("x",0)
				.attr("y",-24)
				.text(d=>d.year)
		label.append("text")
				.attr("class","year")
				.attr("x",0)
				.attr("y",-24)
				.text(d=>d.year)
		

		let yAxis = d3.svg.axis()
				    .scale(yscale)
				    .orient("left")
				    //.ticks(options.indicator.ticks || 5)
					//.tickValues((d,i) => {})
					//.ticks(5)
					.tickValues(()=>{
						return ([0]).concat(yscale.ticks(5))
					})
				    .tickFormat((d,i)=>{

				    	let length=([0]).concat(yscale.ticks(5)).length;
				    	let value={index:i,length:length};
				    	value[FIELDNAME]=d;
				    	return labels.y.format(value)
				    })
				    

		let yaxis=axes.append("g")
			      .attr("class", "y axis")
			      //.classed("hidden",!options.first)
			      .classed("hidden",!options.axis.x)
			      .attr("transform", "translate("+(xscale.range()[1])+"," + 0 + ")")
			      .call(yAxis);

		yaxis.selectAll(".tick")
				//.filter((d,i) => d!==0)
				.select("line")
					//.classed("visible",true)
					.attr("x1",(d,i)=>{
						return padding.right
					})
					.attr("x2",(d,i) => {
						return -WIDTH;
						return xscale.range()[1]
					})
		yaxis.selectAll(".tick")
				.classed("left",labels.y.align==="left")
				.classed("right",labels.y.align==="right")
				.select("text")
					.attr("x",labels.y.align==="left"?(-xscale.range()[1]-margins.left):padding.right)
					.attr("y","-7")
		if(options.axis.zero) {
			yaxis.append("line")
					.attr("class","zero")
					.attr("x1",0)
					.attr("x2",-xscale.range()[1])
					.attr("y1",yscale(0))
					.attr("y2",yscale(0))
		}

		let xAxis = d3.svg.axis()
				    .scale(xscale)
				    .orient("bottom")
				    //.ticks(2)
				    .tickValues(()=>{
				    	//if(SMALL) {
				    		//return extents.years;	
				    	//}
						return xscale.ticks();
					})
				    .tickFormat((d)=>{
				    	let year=d3.format("0d")(d);
				    	if(!SMALL) {
				    		return year;	
				    	}
				    	if(year%1000===0) {
				    		return year;
				    	}
				    	return "'"+year.substr(2)
				    	//return !(d%60)?d/60:self.extents.minute.minute
				    })
				    

		let xaxis=axes.append("g")
			      .attr("class", "x axis")
			      //.classed("hidden",!options.first)
			      .classed("hidden",!options.axis.x)
			      .attr("transform", "translate("+0+"," + yscale.range()[0] + ")")
			      .call(xAxis);

		deviation.append("path")
			.attr("class","bg")
			.attr("d",()=>{
				let points1=options.deviation.map(d=>({x:+d.year,y:d.value[0]})),
					points2=options.deviation.map(d=>({x:+d.year,y:d.value[1]})).reverse();
				
				//console.log("POINTS",points1.concat(points2));

				return line(points1.concat(points2));

			})
			//.style("fill","url(#patternStripe)");

		deviation.append("path")
				.attr("class","border b1")
				.attr("d",()=>{
					return line(options.deviation.map(d=>({x:+d.year,y:d.value[0]})));
				})
		deviation.append("path")
				.attr("class","border b2")
				.attr("d",()=>{
					return line(options.deviation.map(d=>({x:+d.year,y:d.value[1]})));
				})
		if(voronoi) {
			voronoi.setCell(svg.append("g")
							    .attr("class", "voronoi")
							    .attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")
							  	.selectAll("g"));
			voronoi.resample();	
		}
		
	}
	
	function highlightAge(age) {
		//console.log(age)
		if(other_age) {
			other_age
				.classed("selected",false)
				.filter(d=>{
					//console.log(d[0].key,"===",age)
					return (d[0].key === age)
				})
				.classed("selected",true)	
		}
		
	}

	function addMarkers() {

		let markers_data=[data[0].values[0]];//[data[0].values[data[0].values.length-1],data[0].values[0]];
		//console.log(markers_data)

		let markers=svg.append("g")
					.attr("class","markers")
					.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")

		marker=markers.selectAll("g.marker")
					.data(markers_data)
					.enter()
					.append("g")
						//.attr("class","marker "+GENERATIONS[AGES_GENERATIONS[options.age]].short_name)
						.attr("class",d=>{
							//console.log("WHAT COLOR?",data[0].values)
							let direction=(data[0].values[0].perc>data[0].values[data[0].values.length-1].perc)?"down":"up";

							return "marker "+direction;

						})
						.attr("transform",d=>{
							let x=xscale(d.year),
								y=yscale(d[FIELDNAME]);
							return "translate("+x+","+y+")"
						})

		marker.append("circle")
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",10)

		marker.append("text")
				.attr("class","income bg")
				.attr("x",0)
				.attr("y",-15)
				.text(d=>number_format(d[FIELDNAME]))
				//.text(d=>"$"+d3.format(",.0f")(d[FIELDNAME]))

		marker.append("text")
				.attr("class","year bg")
				.attr("x",0)
				.attr("y",-30)
				.text(d=>d.year)

		marker.append("text")
				.attr("class","income")
				.attr("x",0)
				.attr("y",-15)
				.text(d=>number_format(d[FIELDNAME]))
				//.text(d=>"$"+d3.format(",.0f")(d[FIELDNAME]))

		marker.append("text")
				.attr("class","year")
				.attr("x",0)
				.attr("y",-30)
				.text(d=>d.year)
	}

	function updateMarkers() {
		let markers_data=[data[0].values[0]];
		//console.log(markers_data)
		marker
			//.attr("class","marker "+GENERATIONS[AGES_GENERATIONS[options.age]].short_name)
			.attr("class",d=>{
				//console.log("WHAT COLOR?",data[0].values)
				let direction=(data[0].values[0].perc>data[0].values[data[0].values.length-1].perc)?"down":"up";

				return "marker "+direction;

			})
			.data(markers_data)
						.attr("transform",d=>{
							let x=xscale(d.year),
								y=yscale(d[FIELDNAME]);
							return "translate("+x+","+y+")"
						})

		marker.select("text.income")
				.text(d=>number_format(d[FIELDNAME]))
				//.text(d=>d3.format(",.0%")(d[FIELDNAME]))
				//.text(d=>"$"+d3.format(",.0f")(d[FIELDNAME]))

		marker.select("text.year")
				.text(d=>d.year)
	}

	this.update = (__data,__options) => {
		//console.log(__data,__options);

		options.countries=__options.countries;
		options.deviation=__options.deviation;
		options.average=__options.average;
		options.age=__options.age;

		//console.log("options.countries",options.countries)

		data=__data;

		data.forEach(d=>{
			d.markers={};
			d.values.forEach(v=>{
				d.markers[v.year]={
					income:v.income,
					family:v.family,
					single:v.single,
					perc:v.perc,
					year:v.year,
					diff:v.income
				}
			})
		})

		//console.log("data",data)

		update();
		
	}
	function update() {

		country
			.data(data.filter(d => {
				//console.log("{}{}{}{}{}{",d)
				return options.countries.indexOf(d.key)>-1
			}),d=>d.year)
			//.attr("class",d=>(d.key.toLowerCase()+" country "+GENERATIONS[AGES_GENERATIONS[options.age]].short_name))
			.attr("class",d=>{
				//console.log("WHAT COLOR?",d)
				let direction=(d.values[0].perc>d.values[d.values.length-1].perc)?"down":"up";

				return (d.key.toLowerCase()+" country "+direction);

			})
			.attr("rel",d=>d.key)

		
		if(options.incomes.indexOf("income")>-1) {

			country
				.select("path.bg")
				.attr("d",d => {
						let values=d.values.map(v => {
							return {
								x:v.year,
								y:v[FIELDNAME]
							}
						});

						return line(values)
					}
				)

			country
				.select("path.family")
				.attr("d",d => {
						let values=d.values.map(v => {
							return {
								x:v.year,
								y:v[FIELDNAME]
							}
						});

						return line(values)
					}
				)

			

			if(other_age) {
				other_age.data(data[0].all,d => d[0].key)
			
				other_age.select("path")
						.attr("d",d => {
							//console.log("path",d)
							let values=d.map(v => {
								if(voronoi) {
									voronoi.add({
										x:xscale(v.year),
										y:yscale(v[FIELDNAME]),
										d:v
									});
								}

								return {
									x:v.year,
									y:v[FIELDNAME]
								}
							});

							return line(values)
						})
			}
			
			if(voronoi) {
				voronoi.clear();
				voronoi.resample();
			}

			
			/*country
				.select("text.line-name.bg")
					.attr("x",d=>{
						//console.log("LINE-NAME",d,d.values[d.values.length-4])
						return xscale(d.values[d.values.length-4].year)
					})
					.attr("y",d=>yscale(d.values[d.values.length-4][FIELDNAME])-14)*/
			/*country
				.select("text.line-name:not(.bg)")
					.attr("x",d=>{
						return xscale(d.values[d.values.length-4].year)
					})
					.attr("y",d=>yscale(d.values[d.values.length-4][FIELDNAME])-14)*/
			country
				.select("text.line-name.bg")
					//.attr("x",d=>xscale(d.values[d.values.length-1].year)+14)
					//.attr("y",d=>yscale(d.values[d.values.length-1][FIELDNAME]))
					.attr("x",d=>xscale(d.values[Math.floor(d.values.length*3/4)].year))
					.attr("y",d=>yscale(d.values[Math.floor(d.values.length*3/4)][FIELDNAME]))
					.text(d=>d.values[0].key)
			country
				.select("text.line-name.fg")
					//.attr("x",d=>xscale(d.values[d.values.length-1].year)+14)
					//.attr("y",d=>yscale(d.values[d.values.length-1][FIELDNAME]))
					.attr("x",d=>xscale(d.values[Math.floor(d.values.length*3/4)].year))
					.attr("y",d=>yscale(d.values[Math.floor(d.values.length*3/4)][FIELDNAME]))
					.text(d=>d.values[0].key)
					//.text(options.age)
			
			//label=label
			//	.data(data[0].values)

			//console.log("DATA",label.data())

			label=label.data(data[0].values.map((v,i)=>{
					v.index=i;
					v.length=data[0].values.length;
					//console.log(":)",v)
					return v;
				}),d=>d.year)
			
			//console.log("DATA",label.data())

			/*
			//console.log("////////////",data);
			label.datum((d,i)=> {
					//console.log("----->",d)
					return d;
				}
				,d=>d.year)
			*/
			let new_label=label
							.enter()
							.append("g")
								.attr("class","label")
								.attr("rel",d=>d.year+" "+d[FIELDNAME])
								/*.each(d=>{
									//console.log("NEW ",d)
								})*/
								
			new_label.append("circle")
					.attr("class","bg")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",18)
			new_label.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",4)

			new_label.append("text")
					.attr("class","income bg")
					.attr("x",0)
					.attr("y",-10)
			new_label.append("text")
					.attr("class","income")
					.attr("x",0)
					.attr("y",-10)

			new_label.append("text")
					.attr("class","year bg")
					.attr("x",0)
					.attr("y",-24)
			new_label.append("text")
					.attr("class","year")
					.attr("x",0)
					.attr("y",-24)

			label.exit().remove();
					

			label.attr("transform",d=>{
							let x=xscale(d.year),
								y=yscale(d[FIELDNAME])
							return `translate(${x},${y})`
						})
			/*label.each(function(d){
				//console.log("------------------->",d)
			})*/
			label.select("text.income:not(.bg)")
					.text(function(d,i){
						//return "XXX"
						//console.log("D",this,d[FIELDNAME],labels.y.format(d))
						//console.log(d[FIELDNAME],labels.y.format(d))
						return labels.y.format(d)
					})
			label.select("text.income.bg")
					.text(function(d,i){
						return labels.y.format(d)
					})
					
			label.select("text.year.bg")
					.text(d=>d.year)
			label.select("text.year:not(.bg)")
					.text(d=>d.year)

			deviation.select("path.bg")
				.attr("d",()=>{
					let points1=options.deviation.map(d=>({x:+d.year,y:d.value[0]})),
						points2=options.deviation.map(d=>({x:+d.year,y:d.value[1]})).reverse();
					
					//console.log("POINTS",points1.concat(points2));

					return line(points1.concat(points2));

				})
			deviation.select("path.b1")
					.attr("d",()=>{
						return line(options.deviation.map(d=>({x:+d.year,y:d.value[0]})));
					})
			deviation.select("path.b2")
					.attr("d",()=>{
						return line(options.deviation.map(d=>({x:+d.year,y:d.value[1]})));
					})

			if(options.markers) {
				updateMarkers();
				transition();
			}
			
		}

	}
	this.selectOthers= (ages) =>{
		options.others=ages;
		other_age
			.classed("selected",d=>{
				return options.others.indexOf(d[0].key)>-1
			})
	}
	this.addAnnotations=()=>{
		//console.log("!!!!!!!",data[0].values.length-2)
		addAnnotations(1,"bottom");
        addAnnotations(data[0].values.length-3,"bottom");
	}
	this.removeAnnotations=()=>{
		d3.select(options.container).selectAll("div.annotation").remove();
	}
	function addAnnotations(index,position) {
		//console.log(index)
		let __markers=d3.values(data[0].markers),
			values=[__markers[index],__markers[__markers.length-3]],
			year=values[0].year,
			diff=values[0][FIELDNAME]-values[1][FIELDNAME];

		let perc=(values[0][FIELDNAME]-values[1][FIELDNAME])/values[1][FIELDNAME];
		perc=values[0][FIELDNAME];
		let how="similar",
			by="";
		if (perc>=0.1) {
			how="higher";
			by=number_format(Math.abs(perc),true)+" "
		}
		if (perc<=-0.1) {
			how="lower";
			by=number_format(Math.abs(perc),true)+" "
		}

		let country=data[0].values[0].country,
			the=(country==="UK" || country==="US")?"the ":"",
			//text=`In ${the}<b>${COUNTRY_NAMES[country]}</b>, in <b>${year}</b> the ${options.age} age group had a <b>${by}${how}</b> disposable income`;
			text=`In ${the}<b>${COUNTRY_NAMES[country]}</b>, in <b>${year}</b> the ${options.age} age group had a <b>${by}${how}</b> disposable income`;


		//console.log(text)

		let annotation=d3.select(options.container)
							.append("div")
							.datum({

							})
							.attr("class","annotation "+position)
							.style("left",d=>{
								let left=xscale(year);
								return (margins.left+padding.left+left)+"px"
							})
							.style("top",d=>{
								let top=yscale(values[0][FIELDNAME])+10
								return (margins.top+padding.top+top)+"px"
							})
							.append("p")
								//.style("text-shadow","none")
								.html(text)

		strokeShadow(annotation.node())
	}
	this.transition = () => {
		transition();
	}
	function transition() {
	  	family_path
	  		.transition()
			.duration(5000)
			//.attrTween("transform", translateAlong(family_path.node()))
			.attrTween("stroke-dasharray", tweenDash)
			//.each("end", transition);
	}

	function tweenDash(path) {
		return function(t) {
			let path=family_path.node();

			let l=path.getTotalLength();

			let interpolate = d3.interpolateString("0," + l, l + "," + l);
			//console.log(interpolate)
			//console.log(t,l)
			let p = path.getPointAtLength(t * l);
			//console.log(t,p,l)
            //Move the marker to that point
            marker
            	.attr("transform", "translate(" + p.x + "," + p.y + ")")

            let year=Math.round(xscale.invert(p.x));
            if(data[0].markers[year]) {
            	//console.log(p.x,year)
            	marker.select("text.year:not(.bg)")
	            		.text(year)
	            
	            marker.select("text.income:not(.bg)")
	            		.text(d=>number_format(data[0].markers[year][FIELDNAME]))
	            		//.text("$"+d3.format(",.0f")(data[0].markers[year][FIELDNAME]));

	            marker.select("text.year.bg")
	            		.text(year)
	            
	            marker.select("text.income.bg")
	            		.text(d=>number_format(data[0].markers[year][FIELDNAME]))
	            		//.text("$"+d3.format(",.0f")(data[0].markers[year][FIELDNAME]));
            }
            
            

            //console.log(interpolate(t))
            return interpolate(t);
		}
	}
	// Returns an attrTween for translating along the specified path element.
	function translateAlong(path) {
	  	var l = path.getTotalLength();
	  	return function(d, i, a) {
		    return function(t) {
		      var p = path.getPointAtLength(t * l);
		      return "translate(" + p.x + "," + p.y + ")";
		    };
	  	};
	}
	
}
/*d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};*/