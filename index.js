const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))

const Customer = require("./models/Customer");
const Transfer = require("./models/Transfer");

mongoose.connect('mongodb://pooji:poojitha@cluster0-shard-00-00.wlm68.mongodb.net:27017,cluster0-shard-00-01.wlm68.mongodb.net:27017,cluster0-shard-00-02.wlm68.mongodb.net:27017/test?ssl=true&replicaSet=atlas-yzwu50-shard-0&authSource=admin&retryWrites=true&w=majority',{  useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
    console.log("Connected");
});
mongoose.set('useFindAndModify', false);

app.get('/', (req,res) => {
    res.render('home');
});

app.get('/customers', async (req,res) => {
    try {
        const customers = await Customer.find();
        res.render('customers', {customersdata : customers});
    } catch (error) {
        res.json({message: err});
    }
});

app.get('/transfers', async (req,res) => {
    try {
        const transfers = await Transfer.find().sort({ _id : -1});
        res.render('transfer', {transfersdata : transfers})
    } catch (error) {
        res.json({message: err});
    }
});

app.get('/customers/:name', async (req,res) => {
    const customers = await Customer.find().sort({ _id : -1});
    
    const selfUser = req.params.name;
    
    const filteredCustomers = customers.filter((item) => item.name !== selfUser);
    
    res.render('user', {username  : req.params.name, customersdata : filteredCustomers});
});

app.post('/customers/:name', async (req,res) => {
    try {
        const transfer = new Transfer({
            from : req.params.name,
            to : req.body.rrr,
            amount: 100
        });
        await transfer.save();
        await Customer.findOneAndUpdate({name: req.params.name},{$inc: {balance: -100}});
        await Customer.findOneAndUpdate({name: req.body.rrr},{$inc: {balance: 100}})
        const transfers = await Transfer.find().sort({ _id : -1});
        res.render('transfer', {username  :req.params.name, transfersdata : transfers, from: req.params.name, to: req.body.rrr})
    } catch (error) {
        res.redirect('/');
    }  
});

app.listen(process.env.PORT||3000);