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

	let medianChart=new LineChart([{key:"median",name:"Average income",values:options.medians}],{
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
			left:5,
			right:15
		},
		mouseOverCallback:(d)=>{
			highlightBubbles(null,d.date.getFullYear());
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
	let defs=svg.append("defs");
	defs.append("marker")
			.attr({
				id:"markerArrow",
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
					fill:"#bbb",
					stroke:"none"
				})

	let box=svg.node().getBoundingClientRect();
	let WIDTH = options.width || box.width,
		HEIGHT= options.height || box.height;
	//console.log(HEIGHT)
	
	let margins=options.margins || {
		top:30,
		bottom:35,
		left:15,
		right:20
	};

	let padding=options.padding || {
		top:0,
		bottom:0,
		left:10,
		right:35
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
		rscale=d3.scale.sqrt().domain(extents.local_income).range([2,(WIDTH-(margins.left+margins.right+padding.left+padding.right))/options.ages.length*0.5]);


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
									year:d.year,
									age:d.age
								});
								return (`translate(0,${yscale(d.perc)})`)
							})
		bubble.append("circle")
					.attr("cx",0)
					.attr("cy",0)
					.attr("r",d=>rscale(d.income))

		bubble.append("text")
					.attr("class","bg")
					.attr("x",0)
					.attr("y",d => -rscale(d.income)-3)
					.text(d=>d3.format("+%")(d.perc))

		bubble.append("text")
					.attr("class","perc")
					.attr("x",0)
					.attr("y",d => -rscale(d.income)-3)
					.text(d=>d3.format("+%")(d.perc))

		bubble.append("text")
					.attr("class","bg")
					.attr("x",0)
					.attr("y",d=>rscale(d.income)+13)
					.text(d=>d.year)
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
				    	return "";
				    	let age=getShortAgeGroup(d),
				    		split_age=age.split("-");

				    	return split_age.map(a=>"<tspan>"+a+"</tspan>").join();
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
		xaxis.selectAll(".tick")
				.select("text")
					.attr("transform","translate(0,4)")
					.selectAll("tspan")
					.data(d=>{
						let age=getShortAgeGroup(d),
				    		split_age=age.split("-");
				    	if(split_age.length===1) {
				    		return split_age;
				    	}
				    	return [split_age[0],"\u25BE",split_age[1]];
					})
					.enter()
					.append("tspan")
						.attr("x",0)
						.attr("y",(d,i)=>{
							if(!i) {
								return 0;
							}
							if(i===1) {
								return 17;
							}
							return 28;
						})
						.text(d=>d)
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
				    	if(d===0) {
				    		return "Average"
				    	}
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
					.attr("x", WIDTH-(margins.right))
					.attr("y","-8")


		let better_text="Better than average",
			worse_text="Worse than average";
		yaxis.append("text")
				.attr("class","bg yaxis-note")
				.attr("x",-margins.left)
				.attr("y",padding.top)
				.text(better_text)
		yaxis.append("text")
				.attr("class","bg yaxis-note")
				.attr("x",-margins.left)
				.attr("y",yscale.range()[0]-18)
				.text(worse_text)

		yaxis.append("text")
				.attr("class","yaxis-note")
				.attr("x",-margins.left)
				.attr("y",padding.top)
				.text(better_text)
		yaxis.append("text")
				.attr("class","yaxis-note")
				.attr("x",-margins.left)
				.attr("y",yscale.range()[0]-18)
				.text(worse_text)
		
		yaxis.append("line")
				.attr("class","yaxis-arrow")
				.attr("x1",xscale("20 to 24 years")+padding.left)
				.attr("x2",xscale("20 to 24 years")+padding.left)
				.attr("y1",yscale(0.18))
				.attr("y2",yscale(0.36))
				.style("marker-end","url(#markerArrow)");

		yaxis.append("line")
				.attr("class","yaxis-arrow")
				.attr("x1",xscale("20 to 24 years")+padding.left)
				.attr("x2",xscale("20 to 24 years")+padding.left)
				.attr("y1",yscale(-0.18))
				.attr("y2",yscale(-0.36))
				.style("marker-end","url(#markerArrow)");
	}
	function highlightBubbles(__age,__year) {
		
		let year=__year || extents.local_years[extents.local_years.length-1],
			age=__age || options.ages[0];
		//console.log(year,age)
		bubble
			.classed("hidden",d=>(d.year!==year))
			.classed("highlight",d=>(d.year===year))
			.classed("highlight-text",d=>(d.year===year && d.age===age))
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
				highlightBubbles(d.point.age,d.point.year);
				medianChart.highlight(new Date(d.point.year,0,1))
			})
		
			
		
		//cellEnter.append("circle").attr("r", 2);
		cellEnter.append("path");
		
		//cell.select("circle").attr("transform", function(d) { return "translate(" + d.point.x + "," + d.point.y + ")"; });
		cell.select("path").attr("d", function(d) { return "M" + d.join("L") + "Z"; });
	}
}