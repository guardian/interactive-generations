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
//import annotations from '../assets/data/annotations.json!json';

export function init(el, context, config, mediator) {
    

    let queries=window.location.search.replace("?","").split("&"),
        selected_age=25,
        selected_country="UK";
    console.log(queries)
    
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
        country:"UK"
    }

    el.innerHTML = mainHTML.replace(/%assetPath%/g, config.assetPath);
    //document.querySelector(".country-text h2").innerHTML=selected_age+" to "+(selected_age+group_years)+" years old in "+selected_country;

    let frameRequest = requestAnimationFrame(function checkInnerHTML(time) {
        //console.log(time)
        var b=document.querySelector("#myAge");
        if(b && b.getBoundingClientRect().height) {
            cancelAnimationFrame(checkInnerHTML);

            
            
            
            loadData((data) => {

                

                
                    
                //console.log(data)
                
                /*new Generations(data,{
                    container:"#generations",
                    countries:["US"],//,"Italy","US","UK"],
                    selected:"Australia"
                })*/

                
                data.forEach(d=>{
                    d.age=d.Age;//(age_fix[d.Age] || d.Age).replace(/years/gi,""); 
                });
                
                console.log("--->",data);

                
                

               

                new InlineSelector(getAgeGroups(5).map(d=>({name:d.age,shortname:d.age_short})),{
                    container:"#myAgeGroup",
                    selected:status.age,
                    changeCallback:(age)=>{

                        bubbleBuckets.updateAge(age);
                        //return;

                        status.age=age;
                        myAge.update(status);
                        d3.selectAll(".person-profile form.fancy-selector").attr("class","fancy-selector "+GENERATIONS[AGES_GENERATIONS[age]].short_name)

                        myAge.removeAnnotations();
                        myAge.addAnnotations();


                    }
                })

                let country_selector=new InlineSelector(COUNTRIES.map(d=>({name:COUNTRY_NAMES[d],shortname:d})),{
                    container:"#myCountry",
                    selected:status.country,
                    changeCallback:(country)=>{
                        status.country=country;
                        myAge.update(status);
                        
                        bubbleBuckets.selectCountry(country);
                        
                        myAge.removeAnnotations();
                        myAge.addAnnotations();
                    }
                })

                /*new InlineSelector(getAgeGroups(5).map(d=>({name:d.age,shortname:d.age_short})),{
                    container:"#myAgeGroup2",
                    selected:status.age,
                    changeCallback:(age)=>{

                        bubbleBuckets.updateAge(age);
                        return;

                        status.age=age;
                        myAge.update(status);
                        d3.selectAll(".person-profile form.fancy-selector").attr("class","fancy-selector "+GENERATIONS[AGES_GENERATIONS[age]].short_name)

                        myAge.removeAnnotations();
                        myAge.addAnnotations();


                    }
                })*/

                let myAge=new Age(data,{
                    container:"#myAge",
                    countries:[status.country],
                    ages:[status.age],
                    incomes:["income"],
                    markers:true,
                    group_years:group_years
                })
                myAge.addAnnotations();
                
                
                let bubbleBuckets=new BubbleBuckets(data,{
                    container:"#buckets",
                    countries:[status.country],
                    filter:{
                        ages:[status.age]
                    },
                    ages:[status.age],
                    incomes:["income"],
                    group_years:group_years,
                    clickCallback:(country)=>{
                        /*status.country=country;
                        myAge.update(status);
                        myAge.removeAnnotations();
                        myAge.addAnnotations();*/
                        bubbleBuckets.selectCountry(country);
                        country_selector.selectOption(country);
                    }
                    //,
                    //annotations:annotations
                })

                
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

                
                COUNTRIES.forEach(d=>{
                    new BubbleChart(data.filter(d=>(d.Age!=="TOTAL")),{
                            container:"#bubbles",
                            countries:[d],
                            ages:AGES.filter(d=>(d!=="TOTAL")),
                            incomes:["income"],
                            group_years:group_years,
                            selected_ages:["20 to 24 years","40 to 44 years","75 to 79 years","50 to 54 years"]
                    })    
                })
                
                
                
                new Ages(data.filter(d=>(d.Age!=="TOTAL")),{
                    container:"#ages",
                    countries:COUNTRIES,
                    incomes:["income"],//,"single"],
                    selected:"Australia",
                    group_years:10
                })
            },{assetPath:config.assetPath,medians:medians});

            return; 
        }
        frameRequest = requestAnimationFrame(checkInnerHTML);
    });


}
