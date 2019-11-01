
const fs = require('fs');
const _ = require('lodash');

const generateCollection = (source, host, token) => {
    const raw = JSON.parse(fs.readFileSync(source, { encoding: 'utf8' }));
    const entities = _.get(raw, 'log.entries', false);

    const validMethods = ['GET','POST'];
    const validEndpoints = ['/graphql', '/graphql-public'];

    const requests = entities.filter(element => {
            const url = new URL(element.request.url);
            return validMethods.includes(element.request.method) && validEndpoints.includes(url.pathname);
        }
    );

    const collection = {
        info: {
            name: 'test-collection',
            schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
        },
        item: []
    };

    collection.item = requests.map(item => {
        const { request } = item;
        const { method } = request;
        const header = request.headers.filter(header => header.name !== 'authorization').map(header => ({
            key: header.name,
            name: header.name,
            value: header.value,
            type: 'text'
        }));

        header.push({
            key: 'authorization',
            name: 'authorization',
            value: `Bearer ${token}`,
            type: 'text'
        })

        const body = {
            mode: 'raw',
            raw: _.get(request, 'postData.text')
        }

        let name = `${method} request`;

        try {
            const data = _.get(JSON.parse(_.get(request, 'postData.text')), 'operationName', false);
            if (data) name = data;
        } catch (err) {
            console.log("Error: ", err);
        }

        const path = new URL(request.url).pathname;

        return {
            name,
            request: {
                method,
                header,
                body,
                url: `${host}${path}`
            }
        };
    });

    return collection;
}

module.exports = generateCollection;
