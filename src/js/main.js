import mainHTML from './text/main.html!text'
import headerHTML from './text/header.html!text'
import medians from '../assets/data/medians.json!json'
import { getAgeGroups,loadData,AGES,COUNTRIES,age_fix,AGES_GENERATIONS,GENERATIONS,COUNTRY_NAMES } from './lib/utils';

import {Ages,Age} from './components/Ages';
import {BubbleBuckets} from './components/BubbleBuckets';
import { requestAnimationFrame, cancelAnimationFrame } from './lib/request-animation-frame-shim';
import AgeSelector from './components/AgeSelector';
import InlineSelector from './components/InlineSelector';

import ActiveQueue from './lib/ActiveQueue';

import {Q1,Q2,Q3,Q4} from './components/Answers';

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
        parents_age:"50 to 54 years",
        country:"US",
        parents_country:"US"
    }

    //adds header
    let header = document.querySelectorAll('.content__head,.article__header');

    if(header.length == 0){
        el.innerHTML = headerHTML;
    } else {
        el.innerHTML = '';
        header[0].innerHTML = headerHTML;
    }


    el.innerHTML += mainHTML.replace(/%assetPath%/g, config.assetPath);
    //document.querySelector(".country-text h2").innerHTML=selected_age+" to "+(selected_age+group_years)+" years old in "+selected_country;

    //let frameRequest = requestAnimationFrame(function checkInnerHTML(time) {
        
        var b=document.querySelector("#myAge");
        if(b && b.getBoundingClientRect().height) {
           // cancelAnimationFrame(checkInnerHTML);

            
            
            
            loadData((data) => {

            
                data.forEach(d=>{
                    d.age=d.Age;//(age_fix[d.Age] || d.Age).replace(/years/gi,""); 
                });
                

                let q1=new Q1(data,{
                        container:"#q1"
                    }),
                    q2=new Q2(data,{
                        container:"#q2"
                    }),
                    q3=new Q3(data,{
                        container:"#q3"
                    }),
                    q4=new Q4(data,{
                        container:"#q4"
                    });

                new InlineSelector(getAgeGroups(5).map(d=>({name:d.age,shortname:d.age_short})),{
                    container:"#myAgeGroup",
                    selected:status.age,
                    changeCallback:(age)=>{

                        status.age=age;
                        
                        myAge.update(status);
                        q1.update(status.age,status.country);
                        q2.update(status.age,status.country);
                        q3.update(status.age,status.country,status.parents_age);
                        q4.update(status.age,status.country);

                        parentsAge.selectOthers([status.age]);
                        //myAge.removeAnnotations();
                        //myAge.addAnnotations();
                        //console.log(COUNTRIES)
                        bubbleBuckets.updateAge(status.age);
                        
                        ages.select(status.age,status.country);
                        
                        d3.selectAll(".my-profile form.fancy-selector").attr("class","fancy-selector "+GENERATIONS[AGES_GENERATIONS[age]].short_name)
                        
                    }
                })



                let country_selector=new InlineSelector(COUNTRIES.map(d=>({name:COUNTRY_NAMES[d],shortname:d})),{
                    container:"#myCountry",
                    selected:status.country,
                    changeCallback:(country)=>{
                        status.country=country;
                        status.parents_country=country;
                        myAge.update(status);
                        q1.update(status.age,status.country);
                        q2.update(status.age,status.country);
                        q3.update(status.age,status.country,status.parents_age);
                        q4.update(status.age,status.country);

                        parentsAge.update({
                            age:status.parents_age,
                            country:status.parents_country
                        });
                        parentsAge.selectOthers([status.age]);

                        ages.select(status.age,status.country);

                        
                        //myAge.removeAnnotations();
                        //myAge.addAnnotations();
                       // myAge.updateDescription("Well, the way they make shows is, they make one show. That show's called a pilot. Then they show that show to the people who make shows, and on the strength of that one show they decide if they're going to make more shows.");
                        
                        bubbleBuckets.selectCountry(country);

                        
                    }
                })

                new InlineSelector(getAgeGroups(5).map(d=>({name:d.age,shortname:d.age_short})),{
                    container:"#parentsAgeGroup",
                    selected:status.parents_age,
                    changeCallback:(age)=>{

                        status.parents_age=age;

                        q3.update(status.age,status.country,status.parents_age);

                        parentsAge.update({
                            age:status.parents_age,
                            country:status.parents_country
                        });
                        //myAge.removeAnnotations();
                        //myAge.addAnnotations();

                        bubbleBuckets.updateAge(age);
                        
                        

                        
                        d3.selectAll(".parents-profile form.fancy-selector").attr("class","fancy-selector "+GENERATIONS[AGES_GENERATIONS[age]].short_name)
                        
                    }
                })
                
                let myAge,parentsAge,bubbleBuckets,ages;

                let queue=new ActiveQueue();
                //console.log(medians)
                
                queue.add({
                    id:"age",
                    f: () => {

                        q1.update(status.age,status.country);
                        q2.update(status.age,status.country);
                        q3.update(status.age,status.country,status.parents_age);
                        q4.update(status.age,status.country);

                        myAge=new Age(data,{
                            container:"#myAge",
                            countries:[status.country],
                            ages:[status.age],
                            incomes:["income"],
                            fieldname:"perc",
                            markers:true,
                            group_years:group_years,
                            medians:d3.entries(medians[status.country]).map(d=>({date:new Date(+d.key,0,1),value:d.value})),
                            y:{
                                format:(d)=>{
                                            //console.log("---->",d)
                                            if(d["perc"]===0) {
                                                return "";//"Average";
                                            }
                                            return ((d.index===d.length-1)?"distance from average ":"")+""+d3.format("+,.0%")(d["perc"]);
                                        }
                            }
                        })
                        
                        //myAge.addAnnotations();
                        setTimeout(()=>{queue.setNext("parents_age");},150)
                        
                    }
                })

                queue.add({
                    id:"parents_age",
                    f: () => {
                        parentsAge=new Age(data,{
                            container:"#parentsAge",
                            countries:[status.country],
                            ages:[status.parents_age],
                            incomes:["income"],
                            fieldname:"perc",
                            markers:true,
                            group_years:group_years,
                            others:[status.age],
                            y:{}
                        })
                        
                        //myAge.addAnnotations();
                        setTimeout(()=>{queue.setNext("bb");},150)
                        
                    }
                })
                
                queue.add({
                    id:"bb",
                    f: () => {
                        bubbleBuckets=new BubbleBuckets(data.filter(d=>(d.Age!=="TOTAL")),{
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
                                
                                //bubbleBuckets.selectCountry(country);
                                //country_selector.selectOption(country);
                            }
                            //,
                            //annotations:annotations
                        });

                        setTimeout(()=>{queue.setNext("ages");},500)
                    }
                })

                queue.add({
                    id:"ages",
                    f: () => {

                        ages=new Ages(data.filter(d=>(d.Age!=="TOTAL")),{
                            container:"#ages",
                            countries:COUNTRIES,
                            incomes:["income"],//,"single"],
                            fieldname:"perc",
                            country:status.country,
                            age:status.age,
                            group_years:5
                        })

                        ages.select(status.age,status.country);

                        setTimeout(()=>{queue.setNext("transition");},50)
                        //setTimeout(()=>{queue.setNext("scatter");},50)
                        //setTimeout(()=>{queue.setNext("scatter");},50)
                    }
                })
                
                queue.add({
                    id:"transition",
                    f: () => {
                        myAge.transition();
                        parentsAge.transition();
                    }
                })
                
                queue.start("age");



                return;
                
                
                
                
                
                
            },{assetPath:config.assetPath,medians:medians});

            return; 
        }
        //frameRequest = requestAnimationFrame(checkInnerHTML);
    //});


}
