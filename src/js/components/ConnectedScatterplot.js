import { updateExtents,nestDataByAgeGroup,AGES_GENERATIONS,GENERATIONS } from '../lib/utils';
import { appendShadow } from '../lib/CSSUtils';

export default function ConnectedScatterplot(data,options) {

	let FIELDNAME="income";

	let nested_data=nestDataByAgeGroup(data,options.group_years,options.ages,options.countries);
	console.log("NESTED_DATA",nested_data)

	let svg=d3.select(options.container)
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
		left:0,
		right:0
	};

	let age_timeline,axes;

	//let extents=options.extents;
	
	let extents=updateExtents(data);
	console.log(extents)
	let family_path,single_path;

	let xscale=d3.scale.linear().domain([15000,45000]).range([0,WIDTH-(margins.left+margins.right+padding.left+padding.right)]),
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

		age_timeline=svg.append("g")
							.attr("class","ages-timelines")
							.attr("transform","translate("+(margins.left+padding.left)+","+margins.top+")")
							.selectAll("g.age-timeline")
							.data(nested_data,(d)=>(d.key))
							.enter()
							.append("g")
								.attr("class",d=>("age-timeline "+GENERATIONS[AGES_GENERATIONS[d.key]].short_name))
								.classed("selected",d=>(options.selected_ages.indexOf(d.key)>-1))
								.classed("unselected",d=>(options.selected_ages.indexOf(d.key)===-1))
								.attr("rel",d=>d.key)
		age_timeline.filter(d=>(options.selected_ages.indexOf(d.key)>-1))
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


		let marker=age_timeline.selectAll("g.marker")
					.data(d=>{
						let values=d.values[0].values.map(v=>v.values);
						return values.map(v=>{
							v.max=values.length;
							return v;
						});
					})
					.enter()
						.append("g")
							.attr("class","marker")
							.classed("hidden",(d,i)=>{
								return (i>0 && i<d.max-1);
							})
							.attr("transform",d=>{
								//console.log(d)
								return (`translate(${xscale(d.income)},${yscale(d.perc)})`)
							})
		
		marker.append("text")
					.attr("class","bg")
					.attr("x",0)
					.attr("y",-8)
						.text(d=>d.year)
		marker.append("text")
					.attr("x",0)
					.attr("y",-8)
						.text(d=>d.year)
		marker.append("circle")
					.attr("cx",0)
					.attr("cy",0)
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
				    .tickFormat((d)=>{
				    	//if(!d) return "";
				    	return "$"+d3.format(",.0")(d/1000)+"k";
				    })
				    

		let xaxis=axes.append("g")
			      .attr("class", "x axis")
			      //.classed("hidden",!options.first)
			      //.classed("hidden",!options.axis.x)
			      .attr("transform", "translate("+0+"," + yscale.range()[0] + ")")
			      .call(xAxis);
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
				    	return d+"%";//"$"+d3.format(",.0")(d/1000)+"k";
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
	}

}