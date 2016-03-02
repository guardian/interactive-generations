import d3 from 'd3';

export const AGES=([
    //"14 and Under",
    //"15 to 19 years",
    "20 to 24 years",
    "25 to 29 years",
    "30 to 34 years",
    "35 to 39 years",
    "40 to 44 years",
    "45 to 49 years",
    "50 to 54 years",
    "55 to 59 years",
    "60 to 64 years",
    "65 to 69 years",
    "70 to 74 years",
    "75 to 79 years",
    "80 years and over",
    "TOTAL"
]);
export const AGES10=([
    //"14 and Under",
    //"15 to 19 years",
    "20 to 29 years",
    "30 to 39 years",
    "40 to 49 years",
    "50 to 59 years",
    "60 to 69 years",
    "70 to 79 years",
    "80 years and over"//,
    //"TOTAL"
]);
export const AGES_GENERATIONS={
    //"14 and Under",
    //"15 to 19 years",
    "20 to 24 years":"Gen Y",
    "25 to 29 years":"Gen Y",
    "30 to 34 years":"Gen Y",
    "35 to 39 years":"Gen X",
    "40 to 44 years":"Gen X",
    "45 to 49 years":"Gen X",
    "50 to 54 years":"Baby boomers",
    "55 to 59 years":"Baby boomers",
    "60 to 64 years":"Baby boomers",
    "65 to 69 years":"Baby boomers",
    "70 to 74 years":"Over 70s",
    "75 to 79 years":"Over 70s",
    "80 years and over":"Over 70s",
    "TOTAL":"average"
};
export const AGES_GENERATIONS10={
    //"14 and Under",
    //"15 to 19 years",
    "20 to 29 years":"Gen Y",
    "30 to 39 years":"Gen X",
    "40 to 49 years":"Gen X",
    "50 to 59 years":"Baby boomers",
    "60 to 69 years":"Baby boomers",
    "70 to 79 years":"Over 70s",
    "80 years and over":"Over 70s",
    "TOTAL":"average"
};
export const GENERATIONS={
    "Gen Y":{
        name:"Gen Y",
        short_name:"gen-y",
        ages:[  "20 to 24 years",
                "25 to 29 years",
                "30 to 34 years",
                "20 to 29 years"
            ]
    },
    "Gen X":{
        name:"Gen X",
        short_name:"gen-x",
        ages:[  ,
                "35 to 39 years",
                "40 to 44 years",
                "45 to 49 years",
                "30 to 39 years",
                "40 to 49 years"
            ]
    },
    "Baby boomers":{
        name:"Baby boomers",
        short_name:"baby-boomers",
        ages:[  "50 to 54 years",
                "55 to 59 years",
                "60 to 64 years",
                "65 to 69 years",
                "50 to 59 years",
                "60 to 69 years"
            ]
    },
    "Over 70s":{
        name:"Over 70s",
        short_name:"over-70s",
        ages:[  "70 to 74 years",
                "75 to 79 years",
                "80 years and over",
                "70 to 79 years"
            ]
    },
    "average":{
        name:"National Average",
        short_name:"average",
        ages:[  "TOTAL" ]  
    }
};
const country_fix={
    "United Kingdom":"UK",
    "United States":"US"
}

export const COUNTRY_NAMES={
    "AU":"Australia",
    "UK":"UK",
    "IT":"Italy",
    "US":"US",
    "ES":"Spain",
    "FR":"France",
    "DE":"Germany",
    "CA":"Canada",
    "NO":"Norway",
    "SE":"Sweden"
}
export const COUNTRIES=(["UK","FR","DE","IT","ES","US","CA","AU"]);//"NO","SE",

export const age_fix={
    "80 years and over":"80+",
    "14 and Under":"&le;14 years"
}
export function loadData(callback,options) {

    let data=[];
    
    let dataSrc = options.assetPath+"/assets/data/data2.csv";

    d3.csv(dataSrc,
            (d)=>{



                d.Country=(country_fix[d.Country] || d.Country).toUpperCase();
                d.year=+d.Year;
                d.income=+d["EDHIW"];
                d.perc_csv=+d["perc"];
                d.family=+d["Head.or.Spouse_EDHIW"];
                d.single=+d["Single.Person_EDHIW"];
                

                if(options.medians && d.Age!=="TOTAL") {
                    d.median=options.medians[d.Country.toUpperCase()][d.Year];
                    d.perc=(d.income-d.median)/d.median;
                }
                return d;
            }, 
            (csv) => {
                if(callback) {
                    callback(csv.filter(d=>AGES.indexOf(d.Age)>-1).filter(d=>COUNTRIES.indexOf(d.Country)>-1)) 
                }

            }
    );

}

export function updateExtents(data) {  
        
    let extents={
        born:[1900,2015],
        years:[1978,2013],///d3.extent(data,d=>d.year),
        income:[d3.extent(data.filter(d=>d.income>0),d=>d.income)[0],50000],
        perc:d3.extent(data.filter(d=>(typeof d.perc!=='undefined' && d.perc!=="100.00" && d.income>0)),d=>{
            //console.log(d.perc)
            return d.perc
        }),
        family:d3.extent(data.filter(d=>d.family>0),d=>d.family),
        single:d3.extent(data.filter(d=>d.single>0),d=>d.single),
        age:d3.set(data.map(d=>d.Age)).values()
    }
    let max_perc=d3.max(extents.perc,d=>Math.abs(d));
    extents.perc=[-max_perc,max_perc];

    return extents;
}
export function nestData(data) {

    let nested=d3.nest()
        .key(d => d.Country)
        //.key(d => (age_fix[d.Age] || d.Age))
        .key(d => d.Age)
        .rollup(leaves => {
            return leaves.map(d=>{
                //console.log(d)
                return {
                    income:d.income,
                    family:d.family,
                    single:d.single,
                    perc:d.perc,
                    age:d.Age,
                    year:d.year
                }
            }).sort((a,b)=>(a.year-b.year))
        })
        .entries(data);

    return nested;
}
export function getShortAgeGroup(age) {
    if(age==="TOTAL") {
        return age;
    }
    if(age_fix[age]) {
        return age_fix[age];
    }
    return age.replace(/(\d{2})\sto\s(\d{2})\syears/gi,"$1-$2");

}
export function getAgeGroups(group_years) {
    return AGES.map(d=>({
        age:d,
        age_short:d
    }))
    /*
    return AGES.map(d=>{
        let year=+d.split(" ")[0];
            year=(year - year%group_years);
        return {
            age:d,
            age_short:year+" to "+(year+group_years)    
        }
        
    });*/
}
export function nestDataByAgeGroup(data,years=[],ages=[],countries=[]) {
    let group_years=years || 5;

    //console.log("!!!!!!",years,ages,countries)

    let nested=d3.nest()
        /*.key(d => {
            let year=+d.Age.split(" ")[0];
            year=(year - year%group_years);
            return year+" to "+(year+group_years);
        })*/ //(age_fix[d.Age] || d.Age).replace(/years/gi,""))
        /*.key(d => {
            console.log(d,d.Age,age_fix)
            return (age_fix[d.Age] || d.Age).replace(/years/gi,""); 
        })*/
        .key(d => d.Age)
        .key(d => d.Country)
        .key(d => d.year)
        .rollup(leaves => {
            //console.log("!!!!!!!!!!!!!!!!!!!!!",leaves);
            if(leaves[0].Age==="TOTAL") {
                leaves[0].perc=0;
            }
            return leaves[0];
        })
        /*.rollup(leaves => {
            return {
                family:d3.mean(leaves,d=>d.family),
                single:d3.mean(leaves,d=>d.single)
            }
        })*/
        .entries(
            data
                .filter(d=>(d.Age!=="TOTAL" || ages.indexOf("TOTAL")!==-1))
                .filter(d=>d.income>0)
                .filter(d=>{
                    if(!countries || countries.length===0) {
                        return 1;
                    }
                    return countries.indexOf(d.Country)>-1;
                })
                .filter(d=>{
                    //console.log(ages,d)
                    if(!ages.length || !ages) {
                        return 1;
                    }
                    
                    return ages.indexOf(d.age)>-1;
                })
                .sort((a,b)=>(a.year-b.year))
        );

    return nested;
}
export function nestDataByYear(data,ages,countries) {
    let nested=d3.nest()
        .key(d => d.Country)
        .key(d => d.year)
        .rollup(leaves => {
            return {
                income:d3.extent(leaves,d=>d.income),
                perc:d3.extent(leaves,d=>d.perc),
                family:d3.extent(leaves,d=>d.family),
                single:d3.extent(leaves,d=>d.single)
            }
        })
        .entries(
            data
            .filter(d=>(d.Age!=="TOTAL"))
            .filter(d=>d.income>0)
            .filter(d=>{
                if(!countries) {
                    return 1;
                }
                return countries.indexOf(d.Country)>-1;
            })
            .filter(d=>{
                //console.log(ages,d)
                if(!ages) {
                    return 1;
                }
                
                return ages.indexOf(d.age)>-1;
            })
            .sort((a,b)=>(a.year-b.year))
        );

    return nested;
}
export function nestDataByCountry(data,years,ages,countries) {
    let group_years=years || 5;
    let nested=d3.nest()
        .key(d => d.Country)
        /*.key(d => {
            let year=+d.Age.split(" ")[0];
            year=(year - year%group_years);
            return year+" to "+(year+group_years);
        })*/ 
        /*.key(d=>{
            return (age_fix[d.Age] || d.Age).replace(/years/gi,""); 
        })*/
        .key(d => d.Age)
        .key(d => d.year)
        .rollup(leaves => {
            return {
                income:d3.mean(leaves,d=>d.income),
                perc:d3.mean(leaves,d=>d.perc),
                family:d3.mean(leaves,d=>d.family),
                single:d3.mean(leaves,d=>d.single)
            }
        })
        .entries(
            data
            .filter(d=>(d.Age!=="TOTAL"))
            .filter(d=>{
                if(!countries) {
                    return 1;
                }
                return countries.indexOf(d.Country)>-1;
            })
            .filter(d=>{
                if(!ages) {
                    return 1;
                }
                return ages.indexOf(d.age)>-1;
            })
            .sort((a,b)=>(a.year-b.year))
        );

    return nested;
}
export function nestDataByCountryAgeYearsRanking(data,countries) {
    let nested=d3.nest()
            .key(d=>d.Country)
            //.key(d=>d.age)
            .key(d=>d.year)
            .key(d=>d.age)
            .rollup(leaves => {
                return leaves.map(d=>({
                    age:d.age,
                    country:d.Country,
                    income:d.income,
                    perc:d.perc,
                    year:d.year
                }))[0]
            })
            .entries(
                data
                    .filter(d=>(d.Age!=="TOTAL"))
                    .filter(d=>{
                        if(!countries) {
                            return 1;
                        }
                        return countries.indexOf(d.Country)>-1;
                    })
                    /*.filter(d=>{
                        if(!ages) {
                            return 1;
                        }
                        return ages.indexOf(d.age)>-1;
                    })*/
                    .sort((a,b)=>(a.year-b.year))
            );
    let flat=[];
    nested.forEach(country=>{
        country.ages=[];
        country.values.forEach(year=>{




            year.values=year.values.sort((a,b)=>(a.values.income - b.values.income))
            let stacked=0;
            year.values.forEach(d=>{
                d.values.stacked_value=stacked;
                stacked+=d.values.income;
                flat.push(d.values);
            })
            /*
            let age=country.ages.find(d=>d.age===year.key);
            if(!age) {
                country.ages.push({
                    age:year.key,
                    values:[]
                })
                age=country.ages[country.ages.length-1];
            }
            */
        })
    })
    //console.log(flat)

    nested=d3.nest()
                .key(d=>d.country)
                .key(d=>d.age)
                .key(d=>d.year)
                    .rollup(leaves => {
                        return leaves[0];
                    })
                    .entries(flat.sort((a,b)=>(a.stacked - b.stacked)))

    /*nested.forEach(country=>{
        country.values=country.values.sort((a,b)=>(AGES.indexOf(a.key)-AGES.indexOf(b.key)))
    })*/

    return flat.sort((a,b)=>(a.stacked - b.stacked));
}
export function nestData2(data) {

    let nested=d3.nest()
        .key(d => d.Country)
        .key(d => d.year)
        .rollup(leaves => {
            return leaves.map(d=>{
                //console.log(d)
                return {
                    income:d.income,
                    family:d.family,
                    single:d.single,
                    age:d.Age
                }
            }).sort((a,b)=>(AGES.indexOf(a.age)-AGES.indexOf(b.age)))
        })
        .entries(data);

    return nested;
}

export function createPeople(data) {
    console.log(data)
    let people=[];
    data.forEach(d => {
        let age_group=+d.Age.split(" ")[0];
        let born=d.year - age_group;
        //console.log(born)
        /*if(!people[age]) {
            people[age]=[];
        }*/
        //console.log(d)
        people.push({
            born:born,
            age_group:age_group,
            year:d.year,
            income:d.income,
            family:d.family,
            single:d.single,
            country:d.Country
        })
        //people[born].sort((a,b)=>a.year-b.year)
    })
    //console.log(people)
    let nested=d3.nest()
                    .key(d=>{
                        //console.log(d)
                        return d.country
                    })
                    .key(d=>{
                        let born=+d.born;
                        return born-born%5;
                        //return Math.round(+d.born/10)*10;
                    })
                    //.key(d=>d.age_group)
                    .rollup(leaves=>{
                        return leaves.map(d=>{
                            //console.log(d)
                            return {
                                income:d.income,
                                family:d.family,
                                single:d.single,
                                born:d.born,
                                //age_group:d.age_group,
                                country:d.country,
                                year:d.year
                            }
                        }).sort((a,b)=>(a.year-b.year))
                    })
                    .entries(people)

    //console.log(nested)
    return nested;
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}