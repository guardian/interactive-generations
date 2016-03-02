export default function Voronoi(WIDTH,HEIGHT,options={}) {

	let samples=[],
		cell,
		voronoi_data,
		voronoi_centers;
	
	//let quadtree = d3.geom.quadtree().extent([[0, 0], [WIDTH, HEIGHT]])([]);

	let voronoi = d3.geom.voronoi()
						.x(function(d) { return d.x; })
						.y(function(d) { return d.y; })
    					.clipExtent([[-2, -2], [WIDTH + 2, HEIGHT + 2]]);


	this.add = (d) => {
		//console.log(d)
		samples.push(d);
		//quadtree.add(d)
	};
	this.clear = () => { samples=[]; };
	this.setCell = (d) => { cell = d; };

	this.resample = () => { resample(); };

	function resample() {
			
		console.log(samples)
		voronoi_data=voronoi(samples.filter(function(d){return typeof d !== 'undefined'}));
		voronoi_centers=voronoi_data.map(function(d){return d.point});

		

		cell = cell.data(voronoi_data.filter(function(d){return typeof d !== 'undefined'}));
		cell.exit().remove();
		


		let cellEnter = cell.enter().append("g");

		
		cellEnter
			.on("mouseenter",d=>{
				if(d3.touches(this).length>0) {
					return;
				}
				//console.log(d)
				if(options.mouseOverCallback) {
					options.mouseOverCallback(d.point);
				}
			})
		
			
		
		//cellEnter.append("circle").attr("r", 2);
		cellEnter.append("path");
		
		//cell.select("circle").attr("transform", function(d) { return "translate(" + d.point.x + "," + d.point.y + ")"; });
		cell.select("path").attr("d", function(d) { return "M" + d.join("L") + "Z"; });
	}

	
}