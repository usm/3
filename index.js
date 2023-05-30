console.log(`USM3 index.js loaded \n${Date()}`);

(async function(){
    USM3 = await import('./export.js')
    if(typeof(define)!='undefined'){ // in the odd chance someone is still using require ...
        define(usm3)
    }
    u = new USM3.usm
    console.log(u)
})()


