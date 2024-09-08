const fs = require('fs');
const cheerio = require("cheerio");
const { call } = require('./apiCall');

const wordSet = new Set();

const looper = async () => {
    for (let i = 97; i <= 122; i++) {
        const char = String.fromCharCode(i);
        // console.log(char);
        await getWordsOnPage(char);
    }
    console.log(wordSet.size);
    fs.writeFile('set_total_arr.txt', JSON.stringify([...wordSet]), (err) => {
        if (err) throw err;
        console.log('file written')
    })
}

const getWordsOnPage = async (char) => {
    try {
        console.log('char:', char);
        let page = 1;
        const res = await call(`/list/${char}/${page}`);
        const $ = cheerio.load(res);

        const max = $('#content > div.cs30rl9RI3fBcNDr3Hhc > ul:nth-child(3) > li:nth-child(2) > a')?.attr()?.href || `/list/${char}/1`;
        const maxCount = +(/[0-9]+/g).exec(max)[0];
        console.log("Number of pages:", maxCount);

        const fetchWordsForCharPromise = [];

        for (let i = 1; i <= maxCount; i++) {
            fetchWordsForCharPromise.push(new Promise(async (resolve) => {
                const pageRes = await call(`/list/${char}/${i}`);
                let wordOnPage = 1;
                const localArr = [];
                const $ = cheerio.load(pageRes);
                let found = $(`#content > div.dDeYl3zUalQgXsSgFtAi > ul > li:nth-child(${wordOnPage++})`).text();
                while (found) {
                    localArr.push(found);
                    found = $(`#content > div.dDeYl3zUalQgXsSgFtAi > ul > li:nth-child(${wordOnPage++})`).text()
                }

                // console.log(localArr);
                resolve(localArr);
            }))
        }

        const wordsForChar = await Promise.all(fetchWordsForCharPromise);
        console.log('fetched data for', wordsForChar.length, 'pages');

        for (let i = 0; i < wordsForChar.length; i++) {
            const pageItems = wordsForChar[i];
            // console.log(pageItems.length);
            for (j = 0; j < pageItems.length; j++) {
                wordSet.add(pageItems[j]);
            }
        }

        console.log('set size', wordSet.size);
    } catch (err) {
        console.log(err.message);
    }
}

looper();