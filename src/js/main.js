import mainHTML from './text/main.html!text'
import { getAgeGroups,loadData,AGES,COUNTRIES,age_fix } from './lib/utils';
import Generations from './components/Generations';
import {Ages,Age} from './components/Ages';
import {BubbleBuckets} from './components/BubbleBuckets';
import { requestAnimationFrame, cancelAnimationFrame } from './lib/request-animation-frame-shim';
import AgeSelector from './components/AgeSelector';
import InlineSelector from './components/InlineSelector';
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
        var b=document.querySelector("#ages");
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
                    /*
                    let year=+d.Age.split(" ")[0];
                    year=(year - year%group_years);
                    d.age= year+" to "+(year+group_years);
                    */

                    d.age=d.Age;//(age_fix[d.Age] || d.Age).replace(/years/gi,""); 
        

                });
                
                console.log("--->",data)
                /*
                let bubbleBuckets=new BubbleBuckets(data,{
                    container:"#buckets",
                    filter:{
                        ages:[selected_age+" to "+(selected_age+group_years)]
                    },
                    ages:[selected_age+" to "+(selected_age+group_years)],
                    incomes:["family"],
                    group_years:group_years//,
                    //annotations:annotations
                })

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
                    incomes:["family"],
                    group_years:group_years
                })
                */

                new InlineSelector(getAgeGroups(5).map(d=>({name:d.age,shortname:d.age_short})),{
                    container:"#myAgeGroup",
                    selected:status.age,
                    changeCallback:(age)=>{
                        status.age=age;
                        myAge.update(status);
                    }
                })

                new InlineSelector(COUNTRIES.map(d=>({name:d,shortname:d})),{
                    container:"#myCountry",
                    selected:status.country,
                    changeCallback:(country)=>{
                        status.country=country;
                        myAge.update(status);
                    }
                })
            
                let myAge=new Age(data,{
                    container:"#myAge",
                    countries:[status.country],
                    ages:[status.age],
                    incomes:["family"],
                    markers:true,
                    group_years:group_years
                })
                //myAge.addAnnotations();
                
                return;
                new Ages(data,{
                    container:"#ages",
                    countries:COUNTRIES,
                    incomes:["family"],//,"single"],
                    selected:"Australia",
                    group_years:10
                })
            },{assetPath:config.assetPath});

            return; 
        }
        frameRequest = requestAnimationFrame(checkInnerHTML);
    });


}
