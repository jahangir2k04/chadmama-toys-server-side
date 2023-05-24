const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wx1xaqv.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await 
    client.connect();


    const gallery = client.db('chadmamatoysDB').collection('gallery');
    const toys = client.db('chadmamatoysDB').collection('toys');

    app.get('/gallery', async (req, res) => {
      const result = await gallery.find().toArray();
      res.send(result);
    });

    app.post('/toys', async (req, res) => {
      const newToy = req.body;
      const result = await toys.insertOne(newToy);
      res.send(result);
    })

    app.get('/all-toys', async (req, res) => {
      const page = parseInt(req.query.page) || 0;
      const limit = parseInt(req.query.limit) || 20;
      const skip = page * limit;
      const result = await toys.find().skip(skip).limit(limit).toArray();
      res.send(result);
    })

    app.get('/category', async (req, res) => {
      let query = {};
      if (req.query?.name) {
        query = { subCategory: req.query?.name }
      }
      const options = {
        projection: { name: 1, photo: 1, price: 1, rating: 1 }
      }
      const result = await toys.find(query, options).toArray();
      res.send(result);
    })

    app.get('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toys.findOne(query);
      res.send(result);
    })

    app.get('/my-toys', async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { sellerEmail: req.query?.email }
      }

      const result = await toys.find(query).toArray();
      res.send(result);
    })

    // filtering section
    app.get('/totalToys', async (req, res) => {
      const result = await toys.estimatedDocumentCount();
      res.send({ totalToys: result });
    })

    app.patch('/update-toy/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upset: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          quantity: updatedToy.quantity,
          price: updatedToy.price,
          description: updatedToy.description
        }
      };
      const result = await toys.updateOne(filter, toy, options);
      res.send(result);
    })

    app.delete('/toy/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toys.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Chadmama Toys is running');
})

app.listen(port, () => {
  console.log(`Chadmama Toys is running on port : ${port}`);
})