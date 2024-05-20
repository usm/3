let hello = `hello UMS3 at ${Date()}`

import "https://cdn.plot.ly/plotly-2.27.0.min.js" // loading plotly to the global scope (their choice, not mine :-( )

//import "https://esm.sh/plotly@1.0.6"


class USM {
    constructor(seq='ATTAGCCAGGTATGGTGATGCATGCCTGTAGTCAGAGCTACTCAGGAGGCTAAGGTGGGAGGATCACCTG', seed=0.5, abc, edges) {
        // if seq is a url
        this.created = Date()
        // sequence
        this.seq = cleanSeq(seq)
        this.n = this.seq.length
        // alphabet
        this.abc = abc || [...new Set(seq)].sort()
        this.h = Math.ceil(Math.log2(this.abc.length))
        // edges
        this.edges = edges || edging(this.abc)
        // seed
        //this.seed=seed||"bidirectional"
        this.seed = seed || 1/2
        //original CGR
        if (typeof (this.seed) == 'number') {  // a single number, projected to all dimensions
            this.seed = rep(this.seed, this.h)
        } else if(Array.isArray(seed)){ // exact coordinates for seeding
            this.seed=seed
        }
        if(this.seed=='middle'){ // another way to specify classic CGR
            this.seed = rep(0.5, this.h)
        }
        // Build the USMap
        iteratedMap(this) // this is where all teh work takes place
        this.fcgr=function(size=256,direction){
            return fcgr(this,size,direction)
        }
        // ploting
        this.canvasGray=function(size=256,direction="forward",color=false,rz=1){
            return canvasGray(this,size,direction,color,rz)
        }
        this.plotCanvasGray=function(size=300,direction="forward",color=false,rz=1){
            return plotCanvasGray(this,size,direction,color,rz)
        }
        this.plotACGT=function(div,size=500,direction='forward'){
            return plotACGT(this,div,size,direction)
        }
    }
}

function cleanSeq(seq) {
    // split sequence into array if needed
    if (typeof (seq) == 'string') {
        if (!seq.match(/[\,/\s]/)) {
            // if sequence is provided as a string
            seq = seq.split('')
        } else {
            // if provided as a [,;t] delimited string
            seq = seq.split(/[\,/\s\;\./\t]+/)
        }
    }
    return seq
}

function rep(v=0, n=2) {
    // replicate v n times
    return [...new Array(n)].map(_=>v)
}

// blue_red colormap
let cmap = [[0,0,127],[0,0,131],[0,0,135],[0,0,139],[0,0,143],[0,0,147],[0,0,151],[0,0,155],[0,0,159],[0,0,163],[0,0,167],[0,0,171],[0,0,175],[0,0,179],[0,0,183],[0,0,187],[0,0,191],[0,0,195],[0,0,199],[0,0,203],[0,0,207],[0,0,211],[0,0,215],[0,0,219],[0,0,223],[0,0,227],[0,0,231],[0,0,235],[0,0,239],[0,0,243],[0,0,247],[0,0,251],[0,0,255],[0,3,255],[0,7,255],[0,11,255],[0,15,255],[0,19,255],[0,23,255],[0,27,255],[0,31,255],[0,35,255],[0,39,255],[0,43,255],[0,47,255],[0,51,255],[0,55,255],[0,59,255],[0,63,255],[0,67,255],[0,71,255],[0,75,255],[0,79,255],[0,83,255],[0,87,255],[0,91,255],[0,95,255],[0,99,255],[0,103,255],[0,107,255],[0,111,255],[0,115,255],[0,119,255],[0,123,255],[0,127,255],[0,131,255],[0,135,255],[0,139,255],[0,143,255],[0,147,255],[0,151,255],[0,155,255],[0,159,255],[0,163,255],[0,167,255],[0,171,255],[0,175,255],[0,179,255],[0,183,255],[0,187,255],[0,191,255],[0,195,255],[0,199,255],[0,203,255],[0,207,255],[0,211,255],[0,215,255],[0,219,255],[0,223,255],[0,227,255],[0,231,255],[0,235,255],[0,239,255],[0,243,255],[0,247,255],[0,251,255],[0,255,255],[3,255,251],[7,255,247],[11,255,243],[15,255,239],[19,255,235],[23,255,231],[27,255,227],[31,255,223],[35,255,219],[39,255,215],[43,255,211],[47,255,207],[51,255,203],[55,255,199],[59,255,195],[63,255,191],[67,255,187],[71,255,183],[75,255,179],[79,255,175],[83,255,171],[87,255,167],[91,255,163],[95,255,159],[99,255,155],[103,255,151],[107,255,147],[111,255,143],[115,255,139],[119,255,135],[123,255,131],[127,255,127],[131,255,123],[135,255,119],[139,255,115],[143,255,111],[147,255,107],[151,255,103],[155,255,99],[159,255,95],[163,255,91],[167,255,87],[171,255,83],[175,255,79],[179,255,75],[183,255,71],[187,255,67],[191,255,63],[195,255,59],[199,255,55],[203,255,51],[207,255,47],[211,255,43],[215,255,39],[219,255,35],[223,255,31],[227,255,27],[231,255,23],[235,255,19],[239,255,15],[243,255,11],[247,255,7],[251,255,3],[255,255,0],[255,251,0],[255,247,0],[255,243,0],[255,239,0],[255,235,0],[255,231,0],[255,227,0],[255,223,0],[255,219,0],[255,215,0],[255,211,0],[255,207,0],[255,203,0],[255,199,0],[255,195,0],[255,191,0],[255,187,0],[255,183,0],[255,179,0],[255,175,0],[255,171,0],[255,167,0],[255,163,0],[255,159,0],[255,155,0],[255,151,0],[255,147,0],[255,143,0],[255,139,0],[255,135,0],[255,131,0],[255,127,0],[255,123,0],[255,119,0],[255,115,0],[255,111,0],[255,107,0],[255,103,0],[255,99,0],[255,95,0],[255,91,0],[255,87,0],[255,83,0],[255,79,0],[255,75,0],[255,71,0],[255,67,0],[255,63,0],[255,59,0],[255,55,0],[255,51,0],[255,47,0],[255,43,0],[255,39,0],[255,35,0],[255,31,0],[255,27,0],[255,23,0],[255,19,0],[255,15,0],[255,11,0],[255,7,0],[255,3,0],[251,0,0],[247,0,0],[243,0,0],[239,0,0],[235,0,0],[231,0,0],[227,0,0],[223,0,0],[219,0,0],[215,0,0],[211,0,0],[207,0,0],[203,0,0],[199,0,0],[195,0,0],[191,0,0],[187,0,0],[183,0,0],[179,0,0],[175,0,0],[171,0,0],[167,0,0],[163,0,0],[159,0,0],[155,0,0],[151,0,0],[147,0,0],[143,0,0],[139,0,0],[135,0,0],[131,0,0],[127,0,0]]

function int2bin(v, n=Math.floor(Math.log2(v)) + 1) {
    // integer to binary as an array of length n
    let bb = rep(0, n < 0 ? 0 : n)
    for (var i in bb) {
        let k = 2 ** (n - i - 1)
        if (v >= k) {
            bb[i] = 1
            v -= k
        }
    }
    return bb.length > 0 ? bb : [0]
}

function edging(abc) {
    // determine compact edges of an alphabet
    const n = Math.ceil(Math.log2(abc.length))
    // dimensions needed for compact notation
    const edges = {}
    abc.forEach((a,i)=>{
        edges[a] = int2bin(i, n)
        if (edges[a].length == 0) {
            edges[a] = [0]
        }
    })
    return edges
}

async function getSeq(seq='https://www.ncbi.nlm.nih.gov/sviewer/viewer.fcgi?id=399923581&db=nuccore&report=fasta&extrafeat=null&conwithfeat=on&hide-cdd=on&retmode=html&withmarkup=on&tool=portal&log$=seqview') {
    let res = {
        seq: seq
    }
    if (seq.match(/^http[s]*:\/\//)) {
        // if it is a url
        res.url = seq
        res.seq = await (await fetch(seq)).text()
    }
    if (res.seq.match(/^>[^\n\r]*/)) {
        // if fastA
        res.name = res.seq.match(/^>[^\n\r]*/)[0]
        res.seq = res.seq.replace(/^>[^\n\r]*/, '').replace(/[\n\r]/g, '')
    }
    if (Object.keys(res).length == 1) {
        // raw unnanotated sequence, no fastA
        res = res.seq
    }
    return res
}

// iterate the USM map

function iteratedMap(u) {
    u.seqEdge = [...Array(u.h)].map(_=>[...Array(u.n)].map(_=>0))
    u.forward = [...Array(u.h)].map(_=>[...Array(u.n)].map(_=>0))
    u.backward = [...Array(u.h)].map(_=>[...Array(u.n)].map(_=>0))
    u.seqEdge.forEach((d,j)=>{
        // find the edge for each dimention, j, for each ith sequence unit 
        u.seqEdge[j] = u.seqEdge[j].map((_,i)=>u.edges[u.seq[i]][j])
        // and replace it by the iterated map coordinate
        if (typeof (u.seed) == 'string') { // this is one of the named iterated seeding methods
            let ctMax=1000 // infinite looping cutoff
            let ct = 0 // count
            if(u.seed=='circular'){
                console.log(`-------- circular mapping dimension ${j+1} --------`)
                // first pass - FORWARD
                iterateForward(u,j)
                // tie tail back to the beginning
                let tail = u.forward[j][u.n-1]
                // second pass
                iterateForward(u,j,tail)
                // keep going
                ct=0
                while((tail!=u.forward[j][u.n-1])&(ct<ctMax)){
                    ct++
                    console.log(`forward (${ct}):${j}`,tail,u.forward[j][u.n-1])
                    tail = u.forward[j][u.n-1]
                    iterateForward(u,j,tail)
                }
                console.log(`forward:${j}`,tail,u.forward[j][u.n-1])
                
                // first pass - BACWARD
                iterateBackward(u,j)
                // tie head back to the end
                let head = u.backward[j][0]
                // second pass
                iterateBackward(u,j,head)
                // keep going
                ct=0
                while((head!=u.backward[j][0])&(ct<ctMax)){
                    ct++
                    console.log(`backward (${ct}):${j}`,head,u.backward[j][0])
                    head = u.backward[j][0]
                    iterateBackward(u,j,head)
                }
                console.log(`backward:${j}`,head,u.backward[j][0])
                
            } else if(u.seed=='bidirectional'){
                console.log(`-------- bidirectional mapping dimension ${j+1} --------`)
                // first pass - FORWARD+BACWARD
                iterateForward(u,j)
                iterateBackward(u,j)
                // tie heads
                let head = u.backward[j][0]
                let tail = u.forward[j][u.n-1]
                // second pass
                iterateForward(u,j,head)
                iterateBackward(u,j,tail)
                // keep going
                console.log(`forward head:${j}`,head,u.backward[j][0],`backward tail:${j}`,tail,u.forward[j][u.n-1])
                ct=0
                while(((head!=u.backward[j][0])||(tail!=u.forward[j][u.n-1]))&(ct<ctMax)){
                    ct++
                    head = u.backward[j][0]
                    tail = u.forward[j][u.n-1]
                    iterateForward(u,j,head)
                    iterateBackward(u,j,tail)
                    console.log(`(${ct}) forward head:${j}`,head,u.backward[j][0],`backward tail:${j}`,tail,u.forward[j][u.n-1])
                }               
            } else {               
                console.log(`mapping seed "${u.seed}" not recognized`)
            }
            
        } else {
            // this has a fixed seed and is the reference for iterated seeding
            if(j==0){ // no need to repeat for each dimension
                console.log(`mapping with fixed numerical seed ${JSON.stringify(u.seed)}`)
            }
            u.forward[j].forEach((ufi,i)=>{
                if (i == 0) {
                    u.forward[j][i] = u.seed[j] + (u.seqEdge[j][i]-u.seed[j])/2
                }else{
                    u.forward[j][i] = u.forward[j][i-1]+(u.seqEdge[j][i]-u.forward[j][i-1])/2
                    //console.log(j,i,u.seqEdge[j][i],u.forward[j][i])
                }
            })
            u.backward[j].forEach((ufi,i)=>{
                i=u.n-i-1 // going backward
                if (i == u.n-1) {
                    u.backward[j][i] = u.seed[j] + (u.seqEdge[j][i]-u.seed[j])/2
                }else{
                    u.backward[j][i] = u.backward[j][i+1]+(u.seqEdge[j][i]-u.backward[j][i+1])/2
                    //console.log(j,i,u.seqEdge[j][i],u.backward[j][i])
                }
            })
        }
    })
}

function iterateForward(u,j=0,i0=0.5){ // jth dimension
    u.forward[j].forEach((ufi,i)=>{
        if (i == 0) {
            u.forward[j][i] = i0 + (u.seqEdge[j][i]-i0)/2
        }else{
            u.forward[j][i] = u.forward[j][i-1]+(u.seqEdge[j][i]-u.forward[j][i-1])/2
        }
        //console.log(j,i,u.seqEdge[j][i],u.forward[j][i])
    })
}

function iterateBackward(u,j=0,i0=0.5){  // jth dimension
    u.backward[j].forEach((ufi,i)=>{
        i=u.n-i-1 // going backward
        if (i == u.n-1) {
            u.backward[j][i] = i0 + (u.seqEdge[j][i]-i0)/2
        }else{
            u.backward[j][i] = u.backward[j][i+1]+(u.seqEdge[j][i]-u.backward[j][i+1])/2
        }
        //console.log(j,i,u.seqEdge[j][i],u.backward[j][i])
    })
}

function fcgr(u,size=2**8,direction="forward"){
    size=Math.round(size) // to avoid the numeric edge of integers (JS ...) 
    let fr = [...Array(size)].map(_=>([...Array(size)].map(_=>0))) // FCGR
    let xy=u[direction]
    xy[0].forEach((_,i)=>{ // count FCGR
        let x=Math.floor(xy[0][i]*size)
        let y=Math.floor(xy[1][i]*size)
        //fr[x][y]+=1 // normal tabular (top-down) row order
        fr[size-x-(x<size)][y-(y==size)]+=1 // carthesian order
    })
    return fr
}

function fcgrACGT(u,size=2**8,direction="forward"){
    size=Math.round(size) // to avoid the numeric edge of integers (JS ...) 
    let fr = [...Array(size)].map(_=>([...Array(size)].map(_=>0))) // FCGR
    let xy=u[direction]
    xy[0].forEach((_,i)=>{ // count FCGR
        let x=Math.floor(xy[0][i]*size)
        let y=Math.floor(xy[1][i]*size)
        fr[x][y]+=1 // normal tabular (top-down) row order
        //fr[size-x-(x<size)][y-(y==size)]+=1 // carthesian order
    })
    /*
    if(!u.lastFCGR){
        u.lastFCGR=[]
    }
    u.lastFCGR[direction]=fr
    */
    return fr
}

// Plotting

function canvasGray(u,size=200,direction="forward",color=false,rz=1){
    size=Math.round(size) // just in case
    if(document.querySelector('#plotSize')){
        if(document.querySelector('#resizeCheckbox')){
            if(document.querySelector('#resizeCheckbox').checked){
                // rz describes the resize factor needed to fit all quadrants in the assigned size
                let fixedSize = parseInt(document.querySelector('#plotSize').value)
                let size = parseInt(document.querySelector('#numQuadrants').value)
                rz = fixedSize/size
                if(direction=='forward'){
                    console.log(`resize factor = ${rz}`)
                }
            }
        }
    }
    let cv = document.createElement('canvas')
    cv.width=cv.height=size
    cv.style.border="1px solid black" //border
    let ctx = cv.getContext('2d')
    ctx.fillStyle = 'rgb(255, 255, 255)' // white
    ctx.fillRect(0,0,size,size) // white background
    /*
    let fcgr = [...Array(size)].map(_=>([...Array(size)].map(_=>0))) // FCGR
    let xy=u[direction]
    xy[0].forEach((_,i)=>{ // count FCGR
        let x=Math.floor(xy[0][i]*size)
        let y=Math.floor(xy[1][i]*size)
        fcgr[x][y]+=1
    })
    */
    let fcgr = u.fcgr(size/rz,direction)
    if(!u.lastFCGR){u.lastFCGR={}}
    u.lastFCGR[direction]=fcgr  // keep last fw/bk fcgr in memory
    let fcgrMax = Math.log10(fcgr.map(row=>row.reduce((a,b)=>Math.max(a,b))).reduce((a,b)=>Math.max(a,b))+1) // note all empty, 0, will default to fcgrMax=1
    // sz = scale between sizes
    //console.log('resize scale:',rz)
    //size=size*rz
    if(color){
        fcgr.map((c,j)=>c.forEach((r,i)=>{
            let val = Math.round(255*(Math.log10(fcgr[j][i]+1))/fcgrMax)
            let rgb=cmap[val] //.map(x=>(255-x))
            ctx.fillStyle = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})` // black map points
            //ctx.fillRect(size-i*rz-rz, size-j*rz-rz, rz, rz);
            ctx.fillRect(i*rz, j*rz, rz, rz);
        }))
    }else{  // gray
        fcgr.map((c,j)=>c.forEach((r,i)=>{
            let val = 255-Math.round(255*(Math.log10(fcgr[j][i]+1))/fcgrMax)
            ctx.fillStyle = `rgb(${val},${val},${val})` // black map points
            //ctx.fillRect(size-i-1, size-j-1, 1, 1);
            //ctx.fillRect(size-i*rz-rz, size-j*rz-rz, rz, rz);
            ctx.fillRect(i*rz, j*rz, rz, rz);
        }))
    }
    //ctx.fillStyle = 'rgba(255,0,0,0.5)'
    //let sz = size
    //ctx.fillRect(sz,sz,-sz,-sz)
    //console.log(direction,cv,parseFloat(rz))
    return cv
}

/*
function plotCanvas(u,size=200,direction="forward"){
    size=Math.round(size) // just in case
    let spc = 15 // marginal space
    let sg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sg.setAttribute('width',size+2*spc+2)
    sg.setAttribute('height',size+2*spc+2)
    let fobj = document.createElementNS('http://www.w3.org/2000/svg','foreignObject')
    fobj.setAttribute("x",spc-1)
    fobj.setAttribute("y",spc-1)
    fobj.setAttribute("width",size+2)
    fobj.setAttribute("height",size+2)
    sg.appendChild(fobj)
    let cv = canvasGray(u,size,direction)
    fobj.appendChild(cv)
    // edge labels
    Object.keys(u.edges).forEach((edj,i)=>{
        let txt = document.createElementNS('http://www.w3.org/2000/svg','text')
        let x = u.edges[edj][0] //(u.edges[edj][0])*(size+spc+1)+10
        let y = u.edges[edj][1]//(u.edges[edj][1])*(size+spc+1)+10
        if(x*y){
            x=size+spc+2;
            y=size+spc*2-1;
        } else {
            if(x){
                x=size+spc+2
                y=spc-1
            }else if(y){
                x=2
                y=size+spc*2-1
            }else{
                x=2
                y=spc-1
            }
        }
        txt.setAttribute("x",x)
        txt.setAttribute("y",y)
        4
        txt.textContent=edj
        txt.style.alignContent='left'
        //txt.style.verticalAlign="top"
        sg.appendChild(txt)
    })
    return sg
}
*/

function plotCanvasGray(u,size=200,direction="forward",color,rz=1){
    rz=rz||1
    size=Math.round(size*rz) // just in case
    let spc = 15 // marginal space
    let sg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    sg.setAttribute('width',size+2*spc+2)
    sg.setAttribute('height',size+2*spc+2)
    let fobj = document.createElementNS('http://www.w3.org/2000/svg','foreignObject')
    fobj.setAttribute("x",spc-1)
    fobj.setAttribute("y",spc-1)
    fobj.setAttribute("width",size+2)
    fobj.setAttribute("height",size+2)
    sg.appendChild(fobj)
    let cv = canvasGray(u,size,direction,color)
    fobj.appendChild(cv);
    // edge labels
    Object.keys(u.edges).forEach((edj,i)=>{
    // ['C','G','A','T'].forEach((edj,i)=>{
        let txt = document.createElementNS('http://www.w3.org/2000/svg','text')
        let x = u.edges[edj][0] //(u.edges[edj][0])*(size+spc+1)+10
        let y = u.edges[edj][1]//(u.edges[edj][1])*(size+spc+1)+10
        if(x*y){
            x=size+spc+2;
            y=size+spc*2-1;
        } else {
            if(x){
                x=size+spc+2
                y=spc-1
            }else if(y){
                x=2
                y=size+spc*2-1
            }else{
                x=2
                y=spc-1
            }
        }
        txt.setAttribute("x",x)
        txt.setAttribute("y",y)
        let carthesianEdge={
            'A':'C',
            'C':'T',
            'G':'A',
            'T':'G'
        }
        txt.textContent=carthesianEdge[edj]
        txt.style.alignContent='left'
        //txt.style.verticalAlign="top"
        sg.appendChild(txt)
    })
    return sg
}

function canvas(u,size=200,direction="forward"){
    let cv = document.createElement('canvas')
    cv.width=cv.height=size
    cv.style.border="1px solid black"
    let ctx = cv.getContext('2d')
    ctx.fillStyle = 'rgb(255, 255, 255)'
    ctx.fillRect(0,0,size,size) // white background
    ctx.fillStyle = 'rgb(0, 0, 0)' // black map points
    let xy=u[direction]
    xy[0].forEach((_,i)=>{
        ctx.fillRect(Math.floor(xy[0][i]*size), Math.floor(xy[1][i]*size), 1, 1);
        //debugger
    })
    //debugger
    return cv
}

function plotACGT(u=this,div,size=500,direction='forward',seed=0.5){
    if(!div){
        div = document.createElement('div')
        document.body.appendChild(div)
        //div.innerHTML='ploting ...'
    }
    // prepare text labels, depending on the encoding
    let txt = u.seq
    /*
    if(typeof(u.seed)=='object'){ // traditional CGR
        if(direction=='forward'){
            
        }
    }else{
        txt= u.seq
    }
    */

    let lengthColors=[...Array(u.n)].map((_,i)=>{
        let red = parseInt((i/u.n)*100)
        let green = 100-red
        return `rgba(${red+200},${green+200},255,0.75)` 
    })
    
    let trace = {
        x:u[direction][0],
        y:u[direction][1],
        mode: 'lines+markers+text',
        type: 'scatter',
        line:{
            width:1,
            color:'silver'
        },
        marker:{
            //color:'rgba(255,255,0,0.5)',
            color:lengthColors,
            line:{
                color:'navy',
                width:1
            },
            size:18
        },
        text:txt,
        showlegend: false
    }
    let gridTrace={
        x:[1/4,1/4,undefined,1/2,1/2,undefined,3/4,3/4,undefined,0,1,undefined,0,1,undefined,0,1],
        y:[0,1,undefined,0,1,undefined,0,1,undefined,1/4,1/4,undefined,1/2,1/2,undefined,3/4,3/4],
        showlegend: false,
        mode:'lines',
        type:'scatter',
        line:{
            color:'silver',
        }
    }
    let gridCross={
        y:[1/2,1/2,undefined,0,1],
        x:[0,1,undefined,1/2,1/2],
        showlegend: false,
        mode:'lines',
        type:'scatter',
        line:{
            color:'gray',
        }
    }
    //let edges={
    //    x:[-0.01,0,1,1],
    //    y:[-0.01,1,0,1],
    //    mode:'text',
    //    text:['A','C','G','T'],
    //    showlegend: false
    //}
    
    // red-green start-finish
    let traceRedGreen = {
        x:[u[direction][0][0],u[direction][0][u.n-1]],
        y:[u[direction][1][0],u[direction][1][u.n-1]],
        mode: 'markers',
        type: 'scatter',
        marker:{
            line:false,
            color:['rgba(0,255,0,0.5)','rgba(255,0,0,0.5)'],
            size:20
        },
        showlegend: false
    }
    let traces = [gridTrace,gridCross,trace,traceRedGreen]
    let layout = {
        title:`USM ${direction} coordinates<br>${(typeof(u.seed)=='string')? u.seed : JSON.stringify (u.seed)} seed, n=${u.n}, h=${u.h}`,
        xaxis: {
            range: [0, 1],
            fixedrange: true,
            linecolor: 'black',
            linewidth: 1,
            mirror: 'all',
            ticks: 'outside',
            tick0: 0,
            tickvals:[...Array(17)].map((_,i)=>i/16),
            ticktext:['0','','','','1/4','','','','1/2','','','','3/4','','','','1']
          },
        yaxis: {
            range: [0, 1],
            fixedrange: true,
            linecolor: 'black',
            linewidth: 1,
            ticks: 'outside',
            tick0: 0,
            mirror: 'all',
            tickvals:[...Array(17)].map((_,i)=>i/16),
            ticktext:['0','','','','1/4','','','','1/2','','','','3/4','','','','1']
        },
        margin: {
            pad: 0
        },
        //plot_bgcolor: 'rgba(0,0,0,0)',
        //paper_bgcolor: 'rgba(0,0,0,0)',
        annotations:[
            {x:0,y:0,ax:-15,ay:15,text:'A',font:{size: 16}},
            {x:0,y:1,ax:-15,ay:-15,text:'C',font:{size: 16}},
            {x:1,y:1,ax:15,ay:-15,text:'T',font:{size: 16}},
            {x:1,y:0,ax:15,ay:15,text:'G',font:{size: 16}}
        ],
        width:size,
        height:size
    }
    Plotly.newPlot(div,traces,layout)
    //debugger
    return div
    //console.log(u)
    
}

// e-Utils
// txt query --(eSearch)--> UIDs
// UIDs --(eSummary)--> record eSummary
// UIDs --(eFetch)--> full reccord
// UIDs in db A --(eLink)--> UIDs in db B
// UIDs --(ePost)--> temporary storage

async function eFetch(id='NM_000546', db='nucleotide', retmode='text') {
    let seq = await (await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=${db}&id=${id}&rettype=fasta&retmode=${retmode}`))[`${retmode}`]()
    let seqLines = seq.split(/\n/)
    console.log(seqLines[0])
    return seqLines.slice(1).join('')
}

async function eSearch(term='TP53', db='nuccore', retmax=100) {
    return await (await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=${db}&term=${term}&retmax=${retmax}&retmode=json`)).json()
}

async function eInfo(db='') {
    // empty query will return list
    return await (await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/einfo.fcgi?db=${db}&retmode=json`)).json()
}

async function eSummary(id='2606992112', db='nuccore') {
    // summary for UID
    return await (await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=${db}&id=${id}&retmode=json`)).json()
}

async function eLink(id='2606992112', db='nuccore') {
    // summary for UID
    return await (await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?db=${db}&id=${id}&retmode=json`)).json()
}

/*
function scaleCanvas(cv,size){
    const newCanvas = document.createElement('canvas');
    const scaleFactor = size/cv.width // maybe update to allow independent x,y scaling 
    newCanvas.width = cv.width * scaleFactor;
    newCanvas.height = cv.height * scaleFactor;
    const originalContext = cv.getContext('2d');
    const newContext = newCanvas.getContext('2d');
    newContext.scale(scaleFactor, scaleFactor);
    newContext.drawImage(cv, 0, 0)
    return newCanvas 
}

function scaleFCGR(u,direction='forward',n=20){
    let scalled = [...Array(n)]
        .map((x,i)=>[])
        .map((x,j)=>[...Array(n)]
        .map(x=>0))

    let coord = u[direction]
    for(let i=0;i<u.n;i++){
        let x = Math.round(coord[0][i]*n)
        let y = Math.round(coord[1][i]*n)
        try{
            scalled[y][x]+=1
        }catch(err){
            debugger
        }
        
    }
    return scalled
}
*/

export {
    USM,
    hello,
    rep,
    int2bin,
    edging,
    getSeq,
    eFetch,
    eSearch,
    eInfo,
    eSummary,
    eLink,
    plotACGT,
    //scaleCanvas,
    //scaleFCGR
}
