const fs = require('fs');
const cheerio = require("cheerio");

const { call } = require('./apiCall');

const CHUNK_SIZE = 25;
const globalArr = [];

const looper = async () => {
    const data = JSON.parse(
        fs.readFileSync('set_total_arr.txt', { encoding: 'utf-8' })
    );
    console.log(data.length);

    let items = [];
    for (let i = 0; i < data.length; i++) {
        const search = data[i];

        items.push(getSimilarWordsForWord(search));
        // const set = await getSimilarWordsForWord(search);
        // const entry = [data[i], ...set].join(',');
        // console.log("Similar for", data[i], ":", entry.length);
        // globalArr.push(entry);
        if (items.length === CHUNK_SIZE) {
            console.log('Chunking from i:', i);
            const setArr = await Promise.all(items);
            for (let j = 0; j < setArr.length; j++) {
                const set = setArr[j];
                const entry = [...set].join(',');
                globalArr.push(entry);
            }
            items = [];
        }
    }

    if (items.length > 0) {
        const setArr = await Promise.all(items);
        for (let j = 0; j < setArr.length; j++) {
            const set = setArr[j];
            const entry = [...set].join(',');
            globalArr.push(entry);
        }
    }



    // console.log(globalArr);
    fs.writeFile('synonyms.txt', globalArr.join('\n'), (err => {
        if (err) throw err;
        console.log('File created');
    }))
}

const getCleanWord = (wordInput) => {
    const filtered = wordInput
        .replace(/[~`!@#$%^&*()+{}\[\];:<>.\\\?\'\"_]/g, '')
        .replace(/[ \/]/g, '-');
    console.log("input:", wordInput, "filtered:", filtered);
    return filtered;
}

const getSimilarWordsForWord = async (word) => {
    // console.log('searching for', word);
    const filtered = getCleanWord(word);
    const res = await call(`/browse/${filtered}`);
    // console.log(res);
    const $ = cheerio.load(res);
    const set = new Set();
    const strongest = $('a.Bf5RRqL5MiAp4gB8wAZa').toArray().map(x => $(x).text()) || [];
    const strong = $('a.CPTwwN0qNO__USQgCKp8').toArray().map(x => $(x).text()) || [];
    const weak = $('a.u7owlPWJz16NbHjXogfX').toArray().map(x => $(x).text()) || [];

    for (let item of [word, ...strongest, ...strong, ...weak]) {
        set.add(item);
        // console.log(item);
    }

    return set;
}

looper();
// getSimilarWordsForWord('eat, sleep, and breathe');