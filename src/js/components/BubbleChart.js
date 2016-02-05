import { updateExtents,nestDataByAgeGroup,getShortAgeGroup,AGES_GENERATIONS,GENERATIONS,COUNTRY_NAMES } from '../lib/utils';
import LineChart from "./LineChart";

export default function BubbleChart(data,options) {

	let FIELDNAME="income";

	let nested_data=nestDataByAgeGroup(data,options.group_years,options.ages,options.countries);
	console.log("NESTED_DATA",nested_data)

	console.log(options.medians)

	let row=d3.select(options.container)
				.append("div")
					.attr("class","row");
	let description=row.append("div")
						.attr("class","description");
	description
		.append("h2")
			.text(COUNTRY_NAMES[options.countries[0]])
	description
		.append("p")
			.text("Well, the way they make shows is, they make one show. That show's called a pilot. Then they show that show to the people who make shows, and on the strength of that one show they decide if they're going to make more shows.")

	let medianChart=new LineChart([{key:"median",values:options.medians}],{
		container:description
						.append("div")
						.attr("class","median-chart"),
		extents:{
			y:[10000,35000],
			x:[new Date(1978,0,1),new Date(2013,0,1)]
		},
		ticks:3,
		margins:{
			top:15,
			bottom:10,
			left:0,
			right:10
		},
		mouseOverCallback:(d)=>{
			highlightBubbles(d.date.getFullYear());
		}
	});
	


	let chart=row
					.append("div")
					.attr("class","bubbleChart");

	



	let svg=chart
				.append("svg")
	if(options.height) {
		svg.attr("height",options.height)
	}

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
		left:40,
		right:0
	};

	let samples=[],
		voronoi,
		cell,
		voronoi_centers;

	let age_timeline,bubble,axes;

	//let extents=options.extents;
	
	let extents=updateExtents(data);

	extents.local_years=nested_data[0].values[0].values.map(d=>+d.key)
	extents.local_income=d3.extent(data.filter(d=>(d.income>0 && options.countries.indexOf(d.Country)>-1)),d=>d.income)
	extents.local_income=extents.income;
	console.log(extents)
	let family_path,single_path;

	//let xscale=d3.scale.linear().domain([extents.income[0],35000]).range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]),
	let xscale=d3.scale.ordinal().domain(options.ages).rangePoints([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]),
		yscale=d3.scale.linear().domain(extents.perc).range([HEIGHT-(margins.top+margins.bottom),0]),
		rscale=d3.scale.sqrt().domain(extents.local_income).range([2,(WIDTH-(margins.left+margins.right+padding.left+padding.right))/options.ages.length/2]);


	let line = d3.svg.line()
				    .x(function(d) { return xscale(d.x); })
				    .y(function(d) { return yscale(d.y); })
				    .defined(function(d) { return d.y; })

	buildVisual();

	function buildVisual() {

		svg.on("mouseout",()=>{
			highlightBubbles();
		})

		axes=svg.append("g")
					.attr("class","axes")
					.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")

		age_timeline=svg.append("g")
							.attr("class","ages-timelines")
							.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")
							.selectAll("g.age-timeline")
							.data(nested_data,(d)=>(d.key))
							.enter()
							.append("g")
								.attr("class",d=>{
									//console.log(d.key,AGES_GENERATIONS,GENERATIONS)
									return "age-timeline "+GENERATIONS[AGES_GENERATIONS[d.key]].short_name
								})
								//.classed("selected",d=>(options.selected_ages.indexOf(d.key)>-1))
								//.classed("unselected",d=>(options.selected_ages.indexOf(d.key)===-1))								
								.attr("rel",d=>d.key)
								.attr("transform",d=>{
									//console.log(d)
									return (`translate(${xscale(d.key)},0)`)
								})

		bubble=age_timeline.selectAll("g.bubble")
					.data(d=>{
						let values=d.values[0].values.map(v=>v.values);
						return values.map(v=>{
							v.max=values.length;
							return v;
						});
					})
					.enter()
						.append("g")
							.attr("class","bubble")
							.attr("rel",d=>d.year)
							.classed("highlight",d=>(d.year===extents.local_years[extents.local_years.length-1]))
							.classed("hidden",d=>(d.year!==extents.local_years[extents.local_years.length-1]))
							.attr("transform",d=>{
								//console.log(d.year,extents.local_years)
								//if(d.perc===-1) {
									//console.log(d.perc,yscale(d.perc),yscale(d.perc)>HEIGHT,d)	
								//}
								

								samples.push({
									x:xscale(d.age),
									y:yscale(d.perc),
									year:d.year}
								);
								return (`translate(0,${yscale(d.perc)})`)
							})
		bubble.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",d=>rscale(d.income))

		bubble.append("text")
					.attr("x",0)
					.attr("y",d=>rscale(d.income)+13)
					.text(d=>d.year)

		addXAxis();
		addYAxis();
		

		voronoi = d3.geom.voronoi()
						.x(function(d) { return d.x; })
						.y(function(d) { return d.y; })
    					.clipExtent([[-2, -2], [WIDTH + 2, HEIGHT + 2]]);

		cell = svg.append("g")
					    .attr("class", "voronoi")
					    .attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")
					  	.selectAll("g");

		resample(1);
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
				    .tickFormat((d)=>{
				    	return getShortAgeGroup(d);
				    	//if(!d) return "";
				    	//return "$"+d3.format(",.0")(d/1000)+"k";
				    })
				    

		let xaxis=axes.append("g")
			      .attr("class", "x axis")
			      //.classed("hidden",!options.first)
			      //.classed("hidden",!options.axis.x)
			      .attr("transform", "translate("+0+"," + yscale.range()[0] + ")")
			      .call(xAxis);

		xaxis.selectAll(".tick")
				.select("line")
					//.classed("visible",true)
					.attr("y1",(d,i)=>{
						return 0
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
				    	return d3.format("+%")(d);//"$"+d3.format(",.0")(d/1000)+"k";
				    })
				    

		let yaxis=axes.append("g")
			      .attr("class", "y axis")
			      .attr("transform", "translate("+(-padding.left)+"," + 0 + ")")
			      .call(yAxis);

		yaxis.selectAll(".tick")
				//.filter((d,i) => d!==0)
				.classed("zero",d=>d===0)
				.select("line")
					//.classed("visible",true)
					.attr("x1",(d,i)=>{
						return -10
					})
					.attr("x2",(d,i) => {
						//return WIDTH;
						return WIDTH-(margins.right);//xscale.range()[1]
					})
		yaxis.selectAll(".tick")
				.select("text")
					//.attr("x",padding.right)
					.attr("y","-7")
	}
	function highlightBubbles(__year) {
		
		let year=__year || extents.local_years[extents.local_years.length-1];

		bubble
			.classed("hidden",d=>(d.year!==year))
			.classed("highlight",d=>(d.year===year))
			.filter(d=>(d.year===year))
				.moveToFront();
	}
	function resample(samplesPerSegment) {
			
		
		var voronoi_data=voronoi(samples.filter(function(d){return typeof d !== 'undefined'}));
		voronoi_centers=voronoi_data.map(function(d){return d.point});

		

		cell = cell.data(voronoi_data.filter(function(d){return typeof d !== 'undefined'}));
		cell.exit().remove();
		
		var cellEnter = cell.enter().append("g");

		
		cellEnter
			.on("mouseenter",function(d){
				highlightBubbles(d.point.year);
				medianChart.highlight(new Date(d.point.year,0,1))
			})
		
			
		
		//cellEnter.append("circle").attr("r", 2);
		cellEnter.append("path");
		
		//cell.select("circle").attr("transform", function(d) { return "translate(" + d.point.x + "," + d.point.y + ")"; });
		cell.select("path").attr("d", function(d) { return "M" + d.join("L") + "Z"; });
	}
}