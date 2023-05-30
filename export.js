let hello = `hello UMS3 at ${Date()}`

class usm {
    constructor(seq='acggctagagctag',abc){
        this.created=Date()
        // sequence
        this.seq = cleanSeq(seq)
        // alphabet
        this.abc = cleanAbc(abc,this.seq)
    } 
}

function cleanSeq(seq){ // split sequence into array if needed
    if(typeof(seq)=='string'){
        if(!seq.match(/[\,/\s]/)){
            seq=seq.split('')
        } else {
            seq=seq.split(/[\,/\s\;\.]+/)
        }
    }
    return seq
}

function cleanAbc(abc,seq){ // assemble alphabet if needed
    if(!abc){
        abc=[...new Set(seq)].sort()
    }
    return abc
}

function rep(v=0,n=2){  // replicate v n times
    return [...new Array(n)].map(_=>v)
}

function int2bin(v,n=Math.floor(Math.log2(v))+1){ // integer to binary as an array of length n
    let bb=rep(0,n<0?0:n)
    for(var i in bb){
        let k = 2**(n-i-1)
        if(v>=k){
            bb[i]=1
            v-=k
        }
    }
    return bb.length>0?bb:[0]
}


export{
    usm,
    hello,
    rep,
    int2bin
}