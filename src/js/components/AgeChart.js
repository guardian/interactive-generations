import { AGES_GENERATIONS,GENERATIONS } from '../lib/utils';
export default function AgeChart(data,options) {
	
	//console.log("AgeChart",data)
	//console.log(options.deviation)

	let FIELDNAME="income";

	let SMALL=false;

	let svg=d3.select(options.container)
						.append("svg")
	if(options.height) {
		svg.attr("height",options.height)
	}

	let defs=svg.append("defs");

	defs.append("pattern")
			.attr({
				id:"patternStripe",
				width:5,
				height:5,
				patternUnits:"userSpaceOnUse",
				patternTransform:"rotate(45)"
			})
			.append("rect")
				.attr({
					width:1, 
					height:5,
					transform:"translate(0,0)"
				})
				.style({
					fill:"#000",
					"fill-opacity":0.1
				})

	let box=svg.node().getBoundingClientRect();
	let WIDTH = options.width || box.width,
		HEIGHT= options.height || box.height;
	//console.log(HEIGHT)
	
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

	let country,marker,deviation,axes,label;

	let extents=options.extents;

	let family_path,single_path;

	let xscale=d3.scale.linear().domain(extents.years).range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]),
		yscale=d3.scale.linear().domain([0,extents.income[1]]).range([HEIGHT-(margins.top+margins.bottom),0]);

	

	data.forEach(d=>{
		d.markers={};
		d.values.forEach(v=>{
			d.markers[v.year]={
				income:v.income,
				family:v.family,
				single:v.single,
				year:v.year
			}
		})
	})

	let line = d3.svg.line()
				    .x(function(d) { return xscale(d.x); })
				    .y(function(d) { return yscale(d.y); })
				    .defined(function(d) { return d.y; })

	buildVisual();
	if(options.markers) {
		addMarkers();
		transition();
	}

	/*d3.select(options.container)
		.on("mouseenter",()=>{
			d3.select(options.container).selectAll(".axis").classed("hidden",false)
		})
		.on("mouseleave",()=>{
			d3.select(options.container).selectAll(".axis").classed("hidden",true)
		})*/

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
								.attr("class",d=>(d.key.toLowerCase()+" country "+GENERATIONS[AGES_GENERATIONS[options.age]].short_name))
								//.classed("unselected",d=>d.key!==options.selected)
								.attr("rel",d=>d.key)
		


		
		if(options.average) {
			country
				.append("path")
				.attr("class","avg")
				.attr("d",d => {
						//console.log("AVERAGE",options.average)
						let values=options.average.map(v => {
							return {
								x:v.year,
								y:v[FIELDNAME]
							}
						});

						return line(values)
					}
				)
		}

		if(options.incomes.indexOf("income")>-1) {

			country
				.append("path")
				.attr("class","bg")
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

			family_path=country
				.append("path")
				.attr("class","family")
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
				
		}

		

		label=country.append("g")
					.attr("class","labels")
					.classed("family",true)
					.selectAll("g.label")
					.data(d=>d.values)
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
				.attr("r",18)
		label.append("circle")
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",4)
		label.append("text")
				.attr("class","income")
				.attr("x",0)
				.attr("y",-10)
				.text(d=>"$"+d3.format(",.0f")(d.family))
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
						return ([0]).concat(yscale.ticks(2))
					})
				    .tickFormat((d)=>{
				    	//if(!d) return "";
				    	return "$"+d3.format(",.0")(d/1000)+"k";
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
				.select("text")
					.attr("x",padding.right)
					.attr("y","-7")

		let xAxis = d3.svg.axis()
				    .scale(xscale)
				    .orient("bottom")
				    //.ticks(2)
				    .tickValues(()=>{
				    	if(SMALL) {
				    		return extents.years;	
				    	}
						return xscale.ticks();
					})
				    .tickFormat((d)=>{
				    	let year=d3.format("0d")(d);
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
	}

	function addMarkers() {

		let markers_data=[data[0].values[0]];//[data[0].values[data[0].values.length-1],data[0].values[0]];
		console.log(markers_data)

		let markers=svg.append("g")
					.attr("class","markers")
					.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")

		marker=markers.selectAll("g.marker")
					.data(markers_data)
					.enter()
					.append("g")
						.attr("class","marker "+GENERATIONS[AGES_GENERATIONS[options.age]].short_name)
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
				.attr("class","income")
				.attr("x",0)
				.attr("y",-15)
				.text(d=>"$"+d3.format(",.0f")(d[FIELDNAME]))
		marker.append("text")
				.attr("class","year")
				.attr("x",0)
				.attr("y",-30)
				.text(d=>d.year)
	}

	function updateMarkers() {
		let markers_data=[data[0].values[0]];
		console.log(markers_data)

		marker
			.attr("class","marker "+GENERATIONS[AGES_GENERATIONS[options.age]].short_name)
			.data(markers_data)
						.attr("transform",d=>{
							let x=xscale(d.year),
								y=yscale(d[FIELDNAME]);
							return "translate("+x+","+y+")"
						})

		marker.select("text.income")
				.text(d=>"$"+d3.format(",.0f")(d[FIELDNAME]))

		marker.select("text.year")
				.text(d=>d.year)
	}

	this.update=function(__data,__options) {
		console.log(__data,__options);

		options.countries=__options.countries;
		options.deviation=__options.deviation;
		options.average=__options.average;
		options.age=__options.age;

		console.log("options.countries",options.countries)

		data=__data;

		data.forEach(d=>{
			d.markers={};
			d.values.forEach(v=>{
				d.markers[v.year]={
					income:v.income,
					family:v.family,
					single:v.single,
					year:v.year
				}
			})
		})

		console.log("data",data)

		update();
		
	}
	function update() {

		country
			.data(data.filter(d => options.countries.indexOf(d.key)>-1),d=>d.year)
			.attr("class",d=>(d.key.toLowerCase()+" country "+GENERATIONS[AGES_GENERATIONS[options.age]].short_name))
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
			
			label=label
				.data(data[0].values)

			let new_label=label
							.enter()
							.append("g")
								.attr("class","label")
								.attr("rel",d=>d.year+" "+d[FIELDNAME])
								.each(d=>{
									console.log("NEW ",d)
								})
								
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
					.attr("class","income")
					.attr("x",0)
					.attr("y",-10)
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
			
			label.select("text.income")
					.text(d=>"$"+d3.format(",.0f")(d[FIELDNAME]))
			label.select("text.year")
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

		if(options.average) {
			country
				.select("path.avg")
				.attr("d",d => {
						console.log("AVERAGE",options.average)
						let values=options.average.map(v => {
							return {
								x:v.year,
								y:v[FIELDNAME]
							}
						});

						return line(values)
					}
				)
		}
	}

	this.addAnnotations=function() {
		//console.log("!!!!!!!",data[0].values.length-2)
		addAnnotations(1,"bottom");
        addAnnotations(data[0].values.length-3,"bottom");
	}
	this.removeAnnotations=function() {
		d3.select(options.container).selectAll("div.annotation").remove();
	}
	function addAnnotations(index,position) {
		console.log(index)
		let __markers=d3.values(data[0].markers),
			values=[__markers[index],__markers[__markers.length-1]],
			year=values[0].year,
			diff=values[0][FIELDNAME]-values[1][FIELDNAME];

		let perc=(values[0][FIELDNAME]-values[1][FIELDNAME])/values[1][FIELDNAME];

		let how="similar",
			by="";
		if (perc>=0.1) {
			how="higher";
			by=d3.format(",.2%")(Math.abs(perc))+" "
		}
		if (perc<=-0.1) {
			how="lower";
			by=d3.format(",.2%")(Math.abs(perc))+" "
		}

		let text=`In ${data[0].values[0].country}, in ${year} in the <b>${options.age}</b> years range had a ${by}${how} disposable income`;


		console.log(text)

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
								.html(text);
	}

	function transition() {
	  	family_path
	  		.transition()
			.duration(10000)
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
			var p = path.getPointAtLength(t * l);
			//console.log(t,p,l)
            //Move the marker to that point
            marker
            	.attr("transform", "translate(" + p.x + "," + p.y + ")")
            marker.select("text.income")
            		.html(function(d){
            			let year=Math.round(xscale.invert(p.x));
            			if(data[0].markers[year]) {
            				return "$"+d3.format(",.0f")(data[0].markers[year][FIELDNAME]);
            			}
            			return this.innerHTML;
            		})
            marker.select("text.year")
            		.html(function(d){
            			let year=Math.round(xscale.invert(p.x));
            			if(data[0].markers[year]) {
            				return year;
            			}
            			return this.innerHTML;
            		})

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