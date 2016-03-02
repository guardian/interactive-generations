import mainHTML from './text/main.html!text'
import medians from '../assets/data/medians.json!json'
import { getAgeGroups,loadData,AGES,COUNTRIES,age_fix,AGES_GENERATIONS,GENERATIONS,COUNTRY_NAMES } from './lib/utils';
import Generations from './components/Generations';
import {Ages,Age} from './components/Ages';
import {BubbleBuckets} from './components/BubbleBuckets';
import { requestAnimationFrame, cancelAnimationFrame } from './lib/request-animation-frame-shim';
import AgeSelector from './components/AgeSelector';
import InlineSelector from './components/InlineSelector';
import BubbleChart from './components/BubbleChart';
import ActiveQueue from './lib/ActiveQueue';
import FettuccineChart from './components/FettuccineChart';
import ArrowScatterplot from './components/ArrowScatterplot';
//import annotations from '../assets/data/annotations.json!json';

export function init(el, context, config, mediator) {
    


    let queries=window.location.search.replace("?","").split("&"),
        selected_age=25,
        selected_country="US";
    //console.log(queries)
    
    let group_years=5;

    queries.forEach(q => {
      let query=q.split("=");

      if(query[0]==="a") {
          selected_age= +query[1];
      }
      if(query[0]==="c") {
          selected_country=query[1];
      }  
    })

    let status={
        age:"25 to 29 years",
        country:"US"
    }

    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);
    //document.querySelector(".country-text h2").innerHTML=selected_age+" to "+(selected_age+group_years)+" years old in "+selected_country;

    //let frameRequest = requestAnimationFrame(function checkInnerHTML(time) {
        
        var b=document.querySelector("#myAge");
        if(b && b.getBoundingClientRect().height) {
           // cancelAnimationFrame(checkInnerHTML);

            
            
            
            loadData((data) => {

                
                

                let totals=data.filter(d=>d.Age==="TOTAL")

                let nested_totals=d3.nest()
                    .key(d=>d.Country)
                    .key(d=>d.Year)
                    .entries(totals);

                console.log(nested_totals)
                let obj_totals={};
                nested_totals.forEach(c=>{
                    if(!obj_totals[c.key]) {
                        obj_totals[c.key]={};
                    }
                    c.values.forEach(y=>{
                        if(!obj_totals[c.key][y.key]) {
                            obj_totals[c.key][y.key]=y.values[0].income;
                        }
                    })
                })
                console.log(obj_totals)

                data.forEach(d=>{
                    //d.perc=d.income - obj_totals[d.Country][d.Year];
                })

                console.log(data);
                //return;
                
                    
                //console.log(data)
                
                /*new Generations(data,{
                    container:"#generations",
                    countries:["US"],//,"Italy","US","UK"],
                    selected:"Australia"
                })*/

                
                data.forEach(d=>{
                    d.age=d.Age;//(age_fix[d.Age] || d.Age).replace(/years/gi,""); 
                });
                
                //console.log("--->",data);

                
                /*COUNTRIES.forEach((d,i)=>{
                    new FettuccineChart(data,{
                        container:"#fettuccine",
                        country:d,
                        index:i
                    })    
                })
                
                return;*/
                /*COUNTRIES.forEach((d,i)=>{
                    new ArrowScatterplot(data,{
                        container:"#scatter",
                        ages:AGES,
                        incomes:["income"],
                        countries:d,
                        group_years:group_years,
                        selected_ages:[status.age]
                    })    
                });*/
                

                //return;

                new InlineSelector(getAgeGroups(5).map(d=>({name:d.age,shortname:d.age_short})),{
                    container:"#myAgeGroup",
                    selected:status.age,
                    changeCallback:(age)=>{

                        status.age=age;
                        myAge.update(status);
                        //myAge.removeAnnotations();
                        //myAge.addAnnotations();

                        bubbleBuckets.updateAge(age);
                        

                        
                        d3.selectAll(".person-profile form.fancy-selector").attr("class","fancy-selector "+GENERATIONS[AGES_GENERATIONS[age]].short_name)
                        
                    }
                })



                let country_selector=new InlineSelector(COUNTRIES.map(d=>({name:COUNTRY_NAMES[d],shortname:d})),{
                    container:"#myCountry",
                    selected:status.country,
                    changeCallback:(country)=>{
                        status.country=country;
                        myAge.update(status);
                        //myAge.removeAnnotations();
                        //myAge.addAnnotations();
                        myAge.updateDescription("Well, the way they make shows is, they make one show. That show's called a pilot. Then they show that show to the people who make shows, and on the strength of that one show they decide if they're going to make more shows.");
                        
                        bubbleBuckets.selectCountry(country);

                        
                    }
                })
                
                let myAge,bubbleBuckets;

                let queue=new ActiveQueue();
                //console.log(medians)
                
                queue.add({
                    id:"age",
                    f: () => {
                        myAge=new Age(data,{
                            container:"#myAge",
                            countries:[status.country],
                            ages:[status.age],
                            incomes:["income"],
                            fieldname:"perc",
                            markers:true,
                            group_years:group_years,
                            medians:d3.entries(medians[status.country]).map(d=>({date:new Date(+d.key,0,1),value:d.value}))
                        })
                        
                        //myAge.addAnnotations();
                        setTimeout(()=>{queue.setNext("bb");},150)
                        
                    }
                })
                
                queue.add({
                    id:"bb",
                    f: () => {
                        bubbleBuckets=new BubbleBuckets(data,{
                            container:"#buckets",
                            countries:[status.country],
                            filter:{
                                ages:[status.age]
                            },
                            ages:[status.age],
                            incomes:["income"],
                            fieldname:"perc",
                            group_years:group_years,
                            clickCallback:(country)=>{
                                
                                bubbleBuckets.selectCountry(country);
                                country_selector.selectOption(country);
                            }
                            //,
                            //annotations:annotations
                        });

                        setTimeout(()=>{queue.setNext("bubbles");},500)
                    }
                })
                
                queue.add({
                    id:"bubbles",
                    f: () => {
                        COUNTRIES.forEach(d=>{
                            new BubbleChart(data.filter(d=>(d.Age!=="TOTAL")),{
                                    container:"#bubbles",
                                    countries:[d],
                                    ages:AGES.filter(d=>(d!=="TOTAL")),
                                    incomes:["income"],
                                    group_years:group_years,
                                    selected_ages:["20 to 24 years","40 to 44 years","75 to 79 years","50 to 54 years"],
                                    medians:d3.entries(medians[d]).map(d=>({date:new Date(+d.key,0,1),value:d.value}))
                            })    
                        });
                        
                        setTimeout(()=>{queue.setNext("ages");},250)
                    }
                })
                
                queue.add({
                    id:"ages",
                    f: () => {

                        new Ages(data.filter(d=>(d.Age!=="TOTAL")),{
                            container:"#ages",
                            countries:COUNTRIES,
                            incomes:["income"],//,"single"],
                            fieldname:"perc",
                            selected:"Australia",
                            group_years:5
                        })

                        setTimeout(()=>{queue.setNext("transition");},50)
                        //setTimeout(()=>{queue.setNext("scatter");},50)
                    }
                })
                
                

                //console.log(queue.getList())
                /*
                queue.add({
                    id:"scatter",
                    f: () => {
                        COUNTRIES.forEach((d,i)=>{
                            new ArrowScatterplot(data,{
                                container:"#scatter",
                                ages:AGES,
                                incomes:["income"],
                                countries:d,
                                group_years:group_years,
                                selected_ages:[status.age]
                            })    
                        });

                        setTimeout(()=>{queue.setNext("fettuccine");},50)
                    }
                })
                */
                /*
                queue.add({
                    id:"fettuccine",
                    f: () => {
                        COUNTRIES.forEach((d,i)=>{
                            new FettuccineChart(data,{
                                container:"#fettuccine",
                                country:d,
                                index:i
                            })    
                        })

                        setTimeout(()=>{queue.setNext("transition");},50)
                    }
                })
                */
                queue.add({
                    id:"transition",
                    f: () => {
                        myAge.transition();
                    }
                })
                
                queue.start("age");



                return;
                
                /*
                AgeSelector(getAgeGroups(group_years),{
                    age:selected_age+" to "+(selected_age+group_years),
                    changeCallback:(age)=>{
                        bubbleBuckets.updateAge(age)
                    }
                })
                */
                
                
                /*
                new BubbleBuckets(data,{
                    container:"#buckets",
                    ages:[selected_age+" to "+(selected_age+group_years)],
                    incomes:["income"],
                    group_years:group_years
                })
                */
                //return;
                
                
                
                //return;
                
                
                
                
            },{assetPath:config.assetPath,medians:medians});

            return; 
        }
        //frameRequest = requestAnimationFrame(checkInnerHTML);
    //});


}
