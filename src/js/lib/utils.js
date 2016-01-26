import d3 from 'd3';

const AGES=([
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
    "80 years and over"
]).reverse();

const country_fix={
    "United Kingdom":"UK",
    "United States":"US"
}
const age_fix={
    "80 years and over":"&ge;80 years",
    "14 and Under":"&le;14 years"
}
export function loadData(callback,options) {

    let data=[];
    
    let dataSrc = options.assetPath+"/assets/data/data.csv";

    d3.csv(dataSrc,
            (d)=>{
                d.Country=(country_fix[d.Country] || d.Country);
                d.year=+d.Year;
                d.family=+d["Head.or.Spouse_EDHIW"];
                d.single=+d["Single.Person_EDHIW"];
                return d;
            }, 
            (csv) => {
    
                //console.log(csv)

                if(callback) {
                    callback(csv.filter(d=>AGES.indexOf(d.Age)>-1)) 
                }

            }
    );

}

export function nestData(data) {

    let nested=d3.nest()
        .key(d => d.Country)
        .key(d => (age_fix[d.Age] || d.Age))
        .rollup(leaves => {
            return leaves.map(d=>{
                //console.log(d)
                return {
                    family:d.family,
                    single:d.single,
                    age:d.Age,
                    year:d.year
                }
            }).sort((a,b)=>(a.year-b.year))
        })
        .entries(data);

    return nested;
}
export function nestDataByAgeGroup(data,years,ages,countries) {
    let group_years=years || 5;
    let nested=d3.nest()
        .key(d => {
            let year=+d.Age.split(" ")[0];
            year=(year - year%group_years);
            return year+" to "+(year+group_years);
        })//(age_fix[d.Age] || d.Age).replace(/years/gi,""))
        .key(d => d.Country)
        .key(d => d.year)
        .rollup(leaves => {
            return {
                family:d3.mean(leaves,d=>d.family),
                single:d3.mean(leaves,d=>d.single)
            }
        })
        .entries(
            data.filter(d=>{
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
        );

    return nested;
}
export function nestDataByCountry(data,years,ages,countries) {
    let group_years=years || 5;
    let nested=d3.nest()
        .key(d => d.Country)
        .key(d => {
            let year=+d.Age.split(" ")[0];
            year=(year - year%group_years);
            return year+" to "+(year+group_years);
        })//(age_fix[d.Age] || d.Age).replace(/years/gi,""))
        .key(d => d.year)
        .rollup(leaves => {
            return {
                family:d3.mean(leaves,d=>d.family),
                single:d3.mean(leaves,d=>d.single)
            }
        })
        .entries(
            data.filter(d=>{
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
        );

    return nested;
}
export function nestData2(data) {

    let nested=d3.nest()
        .key(d => d.Country)
        .key(d => d.year)
        .rollup(leaves => {
            return leaves.map(d=>{
                //console.log(d)
                return {
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