const newman = require('newman'); 

const run = async (collectionData, count) => {
    const promises = [];

    for (let i=0; i<count; i++) {
        promises.push(new Promise((resolve, reject) => {
            newman.run({
                collection: collectionData
            }, (err, summary) => {
                if (err) { reject(err) }
                resolve(summary);
            });
        }));
    }

    return await Promise.all(promises);
}

module.exports = run;