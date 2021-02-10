const express = require('express');
const mongoose = require('mongoose');
const scrap = require('./scraper');
const Company = require('./models/Company')

const app = express();
const {MONGODB} = require('./config.js');

mongoose
    .connect(MONGODB, {useNewUrlParser: true})
    .then(client => {
        console.log(`Database is connected !`);

        app.get('/companies', (req, res) => {

            let start = req.query.start;
            let end = req.query.end;
            scrap({start, end}).then(response => {
                console.log( 'finished')
            })
            res.send('started')
        })
        app.get('/list', async (req, res) => {
            const list = await Company.find()
            res.send(list)
        })
        app.listen(8081, () => {
            console.log(`Server is running 8081`)
        })
    })
