console.log(`USM3 index.js loaded \n${Date()}`);

(async function(){
    USM = (await import('./usm.mjs')).USM
    if(typeof(define)!='undefined'){ // in the odd chance someone is still using require ...
        define(USM)
    }
    u = new USM
    console.log(u)
})()

/* Notes

# TP53 variants
## literature reference
https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8516647/
## Database
https://tp53.isb-cgc.org


# COVID-19 SARS-2
https://gisaid.org/wiv04

*/


