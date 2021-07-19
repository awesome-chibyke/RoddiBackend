const fetch = require('node-fetch');

exports.GetRequest = (url) => {

    return new Promise(function (resolve, reject) {

        fetch(url)
            .then(res => res.json())
            .then(json => {
                resolve(json)
            })
            .catch(err => {
                reject(err)
            });

    });

}

exports.PostRequest = (url, body = {}) => {

    return new Promise(function (resolve, reject) {

        fetch(url, {
            method: 'post',
            body:    JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => res.json())
            .then(json => {resolve(json)})
            .catch(err => {
                reject(err)
            });

    });

}
