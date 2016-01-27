import mainHTML from './text/main.html!text'
import { getAgeGroups,loadData } from './lib/utils';
import Generations from './components/Generations';
import {Ages,Age} from './components/Ages';
import {BubbleBuckets} from './components/BubbleBuckets';
import { requestAnimationFrame, cancelAnimationFrame } from './lib/request-animation-frame-shim';
import AgeSelector from './components/AgeSelector';

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
                    let year=+d.Age.split(" ")[0];
                    year=(year - year%group_years);
                    d.age= year+" to "+(year+group_years);
                    //console.log(d.age,d.Age)
                });
                
                console.log(data)
                let bubbleBuckets=new BubbleBuckets(data,{
                    container:"#buckets",
                    filter:{
                        ages:[selected_age+" to "+(selected_age+group_years)]
                    },
                    ages:[selected_age+" to "+(selected_age+group_years)],
                    incomes:["family"],
                    group_years:group_years
                })

                AgeSelector(getAgeGroups(group_years),{
                    changeCallback:(age)=>{
                        bubbleBuckets.updateAge(age)
                    }
                })
            
                
                /*
                new BubbleBuckets(data,{
                    container:"#buckets",
                    ages:[selected_age+" to "+(selected_age+group_years)],
                    incomes:["family"],
                    group_years:group_years
                })
                */

                /*
                let myAge=new Age(data,{
                    container:"#myAge",
                    countries:[selected_country],
                    ages:[selected_age+" to "+(selected_age+group_years)],
                    incomes:["family"],
                    markers:true,
                    group_years:group_years
                })
                myAge.addAnnotations();
                */
                
                new Ages(data,{
                    container:"#ages",
                    countries:["Australia","UK","Italy","US","UK","Spain","France","Germany","Canada","Norway","Sweden"],
                    incomes:["family"],//,"single"],
                    selected:"Australia",
                    group_years:group_years
                })
            },{assetPath:config.assetPath});

            return; 
        }
        frameRequest = requestAnimationFrame(checkInnerHTML);
    });


}
