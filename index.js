const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  // origin: ['http://localhost:5173'],
  origin: ['https://splendid-liger-0924ed.netlify.app'],
  credentials: true
}));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xgaxesu.mongodb.net/?retryWrites=true&w=majority`;

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

    const taskCollection = client.db('todoDB').collection('tasks')

    app.get('/tasks', async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result)
    })

    app.get('/tasks/:email', async (req, res) => {
      const email = req.params.email;
      const query = { user: email }
      const result = await taskCollection.find(query).toArray();
      res.send(result)
    })

    app.post('/tasks', async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result)
    })

    app.put('/tasks/:id', async (req, res) => {
      const updatedTask = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true }
      const updateDoc = {
        $set: {
          ...updatedTask
        }
      }
      const result = await taskCollection.updateOne(filter, updateDoc, option);
      res.send(result)
    })

    app.patch('/tasks/:id', async (req, res) => {
      const updatedTask = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          status: updatedTask.status
        }
      }
      const result = await taskCollection.updateOne(filter, updateDoc);
      res.send(result)
    })

    app.delete('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(query);
      res.send(result)
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('ToDo Server is Running')
})

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`)
})