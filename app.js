const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');


const port = process.env.PORT || 80;
const data = fs.readFileSync(`${(__dirname)}/dev_data/data.json`);
const dataArr = JSON.parse(data).services;
let cardsUrlArr = [];

dataArr.forEach(element => {
    cardsUrlArr.push(element.alias)
});



/////TEMPLATES

const mainTemp = fs.readFileSync(`${(__dirname)}/static/index.html`, 'utf-8');
const cardTemp = fs.readFileSync(`${(__dirname)}/templates/cardTemp.html`, 'utf-8');
const productTemp = fs.readFileSync(`${(__dirname)}/templates/productTemp.html`, 'utf-8');
const errorPage = fs.readFileSync(`${(__dirname)}/templates/error.html`, 'utf-8');


const sendRes = function (url, contentType, res) {
    let file = path.join(__dirname + '/static/', url);
    fs.readFile(file, (err, content) => {
        if (err) {
            res.writeHead(400);
            console.log(`file ${file} not found 404`);
            res.end(errorPage);
        } else {
            res.writeHead(200, {
                'Content-Type': contentType
            });
            console.log(`file ${file} 200 OK`);
            res.end(content);
        }
    })
};




const getContentType = function (url) {
    switch (path.extname(url)) {
        case '.css':
            return contentType = 'text/css';
        case '.html':
            return contentType = 'text/html';
        case '.js':
            return contentType = 'text/javascript';
        case '.json':
            return contentType = 'application/json';
        case '.png':
            return contentType = 'image/png';
        default:
            return contentType = 'application/octet-stream';
    }
};

const writeTemplate = function (template, product) {
    let output = template.replace(/{%ALIAS%}/g, product.alias);
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%TITLE%}/g, product.title);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%TAGS%}/g, writeTags(product.properties));
    return output;
};

const writeTags = function (properties) { //properties is array of obj
    return properties.map(({
        title,
        value
    }) => {
        return `<a href="#" title=${title} class="btn btn-outline-primary btn-sm m-1" role="button">${value}</a>`;
    }).join('');


};

const detectCard = function (productAlias) {
    let product = dataArr.filter(function (el) {
        if (el.alias === productAlias) {
            return el;
        }
    })
    return product[0];

};



///////SERVER

const server = http.createServer((req, res) => {
    let reqParams = url.parse(req.url, true);
    const {
        pathname
    } = reqParams;

    if (pathname === '/' || pathname === '/main') {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        const cardsHtml = dataArr.map(el => writeTemplate(cardTemp, el)).join('');
        const output = mainTemp.replace('{%PRODUCT_CARD%}', cardsHtml);
        res.end(output);
        // sendRes('./index.html', {
        //     'Content-Type': 'text/html'
        // }, res);
    } else if (cardsUrlArr.includes(`${pathname.slice(1)}`)) {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        const productAlias = pathname.slice(1);
        const product = detectCard(productAlias);
        const productHtml = writeTemplate(productTemp, product);
        const output = mainTemp.replace('{%PRODUCT_CARD%}', productHtml);
        //path = dataArr[query.alias];
        res.end(output);
    } else {
        sendRes(req.url, getContentType(req.url), res);
    }

});

server.listen(port, () => {
    console.log(`Server working on port ${port}!`);
})