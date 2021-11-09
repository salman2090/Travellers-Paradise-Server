const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ncbah.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true}));

client.connect((err) => {
    const servicesCollection = client.db("travellersParadise").collection("services");
    const bookingsCollection = client.db("travellersParadise").collection("bookings");
    
    // add service
    app.post("/addService", async(req, res) => {
        const result = await servicesCollection.insertOne(req.body);
        res.send(result);
    }); 

    // get services
    app.get("/services", async (req, res) => {
        const result = await servicesCollection.find({}).toArray();
        res.send(result);
    });

    // get single service
    app.get("/singleService/:id", async(req, res) => {
        const result = await servicesCollection
            .find({_id: ObjectId(req.params.id)})
            .toArray();
        res.send(result[0]);
    });

    // confirm order
    app.post("/confirmOrder", async(req, res) => {
        const result = await bookingsCollection.insertOne(req.body);
        res.send(result);
    });

    // myOrder confirmation
    app.get("/myOrder/:email", async (req, res) => {
        const result = await bookingsCollection
            .find({ email: req.params.email })
            .toArray();
            res.send(result); 
    });

    // delete order
    app.delete("/deleteOrder/:id", async (req, res) => {
        const result = await bookingsCollection.deleteOne({_id: ObjectId(req.params.id)});
        const result1 = await servicesCollection.deleteOne({_id: ObjectId(req.params.id)});
        res.send(result1);
    });

    //all order
    app.get("/allOrders", async(req, res) => {
        const result = await bookingsCollection.find({}).toArray();
        res.send(result);
    });

    //update status
    app.put("/updateStatus/:id", (req, res) => {
        const id = req.params.id;
        const updateStatus = req.body.status;
        const filter = { _id: ObjectId(id)};
        console.log(updateStatus);
        bookingsCollection.updateOne(filter, {
            $set: {status: updateStatus},
        })
        .then(result => {
            res.send(result);
        });

    })
});

app.get('/', (req, res)=> {
    res.send("Traveller's Paradise server is running.");
});

app.listen(port, () => {
    console.log("Running Traveller's Paradise server on port", port)
});