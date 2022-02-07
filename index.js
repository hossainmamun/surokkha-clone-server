const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const ObjectId = require('mongodb').ObjectId
const app = express()
require('dotenv').config()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.send(new Date().toDateString('dd/MM/yyy'));
})

// ! mongobd connection

const { MongoClient } = require('mongodb');
const e = require('express');
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_PASS}@cluster0.1ssjj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const registrationCollection = client.db(process.env.DB_NAME).collection(process.env.DB_REGISTRATION);
    const adminCollection = client.db(process.env.DB_NAME).collection(process.env.DB_ADMIN_COLLECTION);

    // ! get vaccine status
    app.get('/vaccine-status/:id', (req, res) => {
        const status = req.params.id;
        registrationCollection.find({ nid: status })
            .toArray((err, vaccineStatus) => {
                if (vaccineStatus) {
                    res.send(vaccineStatus[0])
                }
                else {
                    res.send(err)
                }
            })
    })

    // ! get vaccine registration list
    app.get('/registration-list', (req, res) => {
        registrationCollection.find({})
            .toArray((err, registrations) => {
                res.send(registrations)
            })
    })


    // ! post registration items to mongodb
    app.post('/user-registrations', (req, res) => {
        const registration = req.body;
        registrationCollection.insertOne(registration)
            .then(result => {
                res.send(result)
            })
    })

    // ! get real admin info to access registration list
    app.post('/admin-control', (req, res) => {
        const adminEmail = req.body.email;
        adminCollection.find({ email: adminEmail })
            .toArray((err, admin) => {
                res.send(admin.length > 0)
            })
    })

    // ! post admin info to mongodb
    /* app.post('/adminCollection', (req, res) => {
        const admin = req.body;
        adminCollection.insertOne(admin)
            .then(result => {
                res.send(result)
            })
    }) */

    // ! delete vaccine registration
    app.delete('/delete-registration/:id', (req, res) => {
        const deleteReg = req.params.id;
        registrationCollection.deleteOne({ _id: ObjectId(deleteReg) })
            .then(result => {
                res.send(result)
            })
    })
    console.log('db connected')
});


// !  prot listening
const port = 7777;
app.listen(process.env.PORT || port, () => {
    console.log(`port listen = ${port}`)
})