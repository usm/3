console.log(`USM3 index.js loaded \n${Date()}`);

(async function(){
    usm = await import('./export.js')
    if(typeof(define)!='undefined'){ // in the odd chance someone is still using require ...
        define(usm3)
    }
})()


