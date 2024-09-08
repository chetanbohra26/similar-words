const { default: axios } = require("axios");

const PAGE_URL = 'https://www.thesaurus.com';

const call = async (url) => {
    try {
        const res = await axios({
            method: 'GET',
            url: `${PAGE_URL}${url}`,
            timeout: 60000,
        });
        return res?.data;
    } catch (err) {
        console.log(err.message, err.status);
        if (err.status !== 404) return call(url);
        else console.log("missed", url);
    }
}

module.exports.call = call;