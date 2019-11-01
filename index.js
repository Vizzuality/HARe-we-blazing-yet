const _ = require('lodash');
const generateCollection = require("./collectionGenerator");
const runCollection = require("./collectionRunner");

const params = {};
const validParamsKeys = ["count","host","token","source"];

process.argv.forEach(item => {
    const keyValue = item.split("=");
    if (keyValue.length > 1 && validParamsKeys.includes(keyValue[0])) {
        params[keyValue[0]] = keyValue[1]
    }
});

const defaultTestSource = "./session.har";

const source = (params.source) ? params.source : defaultTestSource;
const host = (params.host) ? params.host : 'http://localhost:3000';
const count = (params.count) ? parseInt(params.count, 10) : 1;
const { token } = params;

const collection = generateCollection(source, host, token);

runCollection(collection, count).then(result => {
    result.forEach(item => {
        const print = item.run.executions.map(execution => {

            const method = _.get(execution, 'request.method');
            const name = _.get(execution, 'item.name');
            const status = _.get(execution, 'response.status');
            const code = _.get(execution, 'response.code');
            const error = _.get(execution, 'requestError.code', false);
            const time = _.get(execution, 'response.responseTime');
            const size = _.get(execution, 'response.responseSize');

            let result = { method, name };

            if (error) result.error = error;
            else result = { ...result, status, code }

            result = { ...result, time, size};
            return result
        });

        console.table(print);
    })
})