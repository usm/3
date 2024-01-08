console.log(`USM3 index.js loaded \n${Date()}`);

(async function(){
    U = (await import('./usm.mjs'))
    if(typeof(define)!='undefined'){ // in the odd chance someone is still using require ...
        define(U)
    }
    //u = new U.USM('ATTAGCCAGGTATGGTGATGCATGCCTGTAGTCAGAGCTACTCAGGAGGCTAAGGTGGGAGGATCACCTG','circular')
    //u = new U.USM('GATACA','circular')
    //  = new U.USM('GATACAGATA','circular')
    //u = new U.USM('GATACA')
    u = new U.USM('GATACA','circular')
    console.log(u)
    //debugger
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


