export default function LineChart(data,options) {

	//console.log("LineChart",data)

	let svg=options.container
						.append("svg")
							.on("touchstart", function(){
								let coord = d3.touches(this)[0];
								touch(coord);
							})
	        				.on("touchmove", function(){
	        					let coord = d3.touches(this)[0];
								touch(coord);
							});

	if(options.height) {
		svg.attr("height",options.height)
	}



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
		left:10,
		right:0
	};

	let extents=options.extents;
	
	let axes,plot,marker;

	let xscale=d3.scale.linear().domain(extents.x).range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]),
		yscale=d3.scale.linear().domain(extents.y).range([HEIGHT-(margins.top+margins.bottom),0]);

	let line = d3.svg.line()
				    .x(function(d) { return xscale(d.x); })
				    .y(function(d) { return yscale(d.y); })
				    .defined(function(d) { return d.y; })

	let samples=[],
		voronoi,
		cell,
		voronoi_data,
		voronoi_centers,
		quadtree = d3.geom.quadtree().extent([[0, 0], [WIDTH, HEIGHT]])([]);

	var buildVisual = () => {

		axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")

		plot=svg.append("g")
					.attr("class","plots")
							.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")
							.selectAll("g.plot")
							.data(data,d=>d.key)
							.enter()
							.append("g")
								.attr("class","plot")
								.attr("rel",d=>d.key)
								.each(d=>{
									d.values.forEach(v=>{
										samples.push({
												x:xscale(v.date),
												y:yscale(v.value),
												date:v.date
											}
										);
										quadtree.add([xscale(v.date),yscale(v.value)])
									})
								})

		plot.append("path")
				.attr("d",d=>line(d.values.map(v=>({x:v.date,y:v.value}))))

		plot
			.filter(d=>typeof(d.name)!=='undefined')
			.append("text")
				.attr("class","plot-name bg")
				.attr("x",d=>xscale(d.values[0].date))
				.attr("y",d=>yscale(d.values[0].value)+14)
				.text(d=>d.name)
		plot
			.filter(d=>typeof(d.name)!=='undefined')
			.append("text")
				.attr("class","plot-name")
				.attr("x",d=>xscale(d.values[0].date))
				.attr("y",d=>yscale(d.values[0].value)+14)
				.text(d=>d.name)

		marker=plot.append("g")
				.attr("class","markers")
				.selectAll("g.marker")
					.data(d=>d.values)
					.enter()
					.append("g")
						.attr("class","marker")
						.attr("transform",d=>`translate(${xscale(d.date)},${yscale(d.value)})`)
		marker.append("circle")
				.attr("cx",0)
				.attr("cy",0)
				.attr("r",2)

		marker.append("text")
				.attr("class","bg")
				.attr("x",0)
				.attr("y",-6)
				.text(d=>d.date.getFullYear())
		marker.append("text")
				.attr("x",0)
				.attr("y",-6)
				.text(d=>d.date.getFullYear())

		highlightMarker(data[0].values[data[0].values.length-1].date);

		let yAxis = d3.svg.axis()
				    .scale(yscale)
				    .orient("left")
				    //.ticks(options.indicator.ticks || 5)
					//.tickValues((d,i) => {})
					.ticks(options.ticks || 5)
					/*.tickValues(()=>{
						return ([0]).concat(yscale.ticks(2))
					})
				    .tickFormat((d)=>{
				    	//if(!d) return "";
				    	return "$"+d3.format(",.0")(d/1000)+"k";
				    })*/
				    

		let yaxis=axes.append("g")
			      .attr("class", "y axis")
			      //.classed("hidden",!options.first)
			      //.classed("hidden",!options.axis.x)
			      .attr("transform", "translate("+0+"," + 0 + ")")
			      .call(yAxis);

		yaxis.selectAll(".tick")
				//.filter((d,i) => d!==0)
				.select("line")
					//.classed("visible",true)
					.attr("x1",(d,i)=>{
						return -padding.left
					})
					.attr("x2",(d,i) => {
						return xscale.range()[1]
					})
		yaxis.selectAll(".tick")
				.select("text")
					.attr("x",-padding.left)
					.attr("dy","-0.1em")

		voronoi = d3.geom.voronoi()
						.x(function(d) { return d.x; })
						.y(function(d) { return d.y; })
    					.clipExtent([[-2, -2], [WIDTH + 2, HEIGHT + 2]]);

		cell = svg.append("g")
					    .attr("class", "voronoi")
					    .attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")
					  	.selectAll("g");
		
		

		resample();
	}

	buildVisual();

	function resample() {
			
		//console.log(samples)
		voronoi_data=voronoi(samples.filter(function(d){return typeof d !== 'undefined'}));
		voronoi_centers=voronoi_data.map(function(d){return d.point});

		

		cell = cell.data(voronoi_data.filter(function(d){return typeof d !== 'undefined'}));
		cell.exit().remove();
		


		var cellEnter = cell.enter().append("g");

		
		cellEnter
			.on("mouseenter",d=>{
				if(d3.touches(this).length>0) {
					return;
				}

				highlightMarker(d.point.date);
				if(options.mouseOverCallback) {
					options.mouseOverCallback(d.point);
				}
			})
		
			
		
		//cellEnter.append("circle").attr("r", 2);
		cellEnter.append("path");
		
		//cell.select("circle").attr("transform", function(d) { return "translate(" + d.point.x + "," + d.point.y + ")"; });
		cell.select("path").attr("d", function(d) { return "M" + d.join("L") + "Z"; });
	}
	function touch(coord) {
      	//console.log(coord)
      	let point=findClosestCell(coord);
      	highlightMarker(point.date);

		if(options.mouseOverCallback) {
      		options.mouseOverCallback(point);
      	}
    }
    function findClosestCell(pos) {
    	//var pos = d3.mouse(this);
		var closestPoint = [Infinity, Infinity];
		var minDistance = Infinity;

		// search for closest point
		quadtree.visit(function(quad, x1, y1, x2, y2) {

			

			var rx1 = pos[0] - minDistance,
			    rx2 = pos[0] + minDistance,
			    ry1 = pos[1] - minDistance,
			    ry2 = pos[1] + minDistance;
			
			if (p = quad.point) {
				var p,
					dx = pos[0] - p[0],
					dy = pos[1] - p[1],
					d2 = dx * dx + dy * dy,
					d = Math.sqrt(d2);
				if (d < minDistance) {
					closestPoint = p;
					minDistance = d;
				}
			}
			return x1 > rx2 || x2 < rx1 || y1 > ry2 || y2 < ry1; // bounding box outside closest point
		});

		//console.log("CLOSEST POINT",closestPoint,voronoi_centers)
		return voronoi_centers.filter(d=>(Math.abs(d.x-closestPoint[0])<1))[0];
    }
	function highlightMarker(date) {
		marker.select("circle").attr("r",1)
		marker.classed("highlight",d=>(+d.date === +date)).filter(d=>(+d.date === +date)).select("circle").attr("r",3)
	}
	this.highlight=(date)=>{
		highlightMarker(date);
	}
}