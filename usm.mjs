let hello = `hello UMS3 at ${Date()}`

class USM {
    constructor(seq='ATTAGCCAGGTATGGTGATGCATGCCTGTAGTCAGAGCTACTCAGGAGGCTAAGGTGGGAGGATCACCTG', abc, seed, edges) {
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
        this.seed = seed || 1 / 2
        //original CGR
        if (typeof (this.seed) == 'number') {
            this.seed = rep(this.seed, this.h)
        }
        // Build the USMap
        iteratedMap(this)
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
        if (typeof (u.seed) == 'string') {
            // this is one of the iterated methods
            4
            // not developed yet
        } else {
            // this has a fixed seed
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

export {USM, hello, rep, int2bin, edging, getSeq, eFetch, eSearch, eInfo, eSummary, eLink}
