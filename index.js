const express=require('express');
const cors=require('cors');
const app=express();
require('dotenv').config();
const port=process.env.PORT||4000;
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = `mongodb+srv://${process.env.SECRET_User}:${process.env.SECRET_PASS}@cluster11.cpm08j1.mongodb.net/?retryWrites=true&w=majority`;
const uri = 'mongodb+srv://EcommerceSite:xfcyMbY6VWNB6ET5@cluster11.cpm08j1.mongodb.net/?retryWrites=true&w=majority';
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
    // await client.connect();
    // Send a ping to confirm a successful connection

    const products = client.db('emaJohnDB').collection('products');
    const users = client.db('emaJohnDB').collection('users');
    const userProducts=client.db('emaJohnDB').collection('userProducts')
    app.get('/products', async (req, res) => {
      const result = await products.find().toArray();
      res.send(result);
    })
    
    app.get('/products/:category', async (req, res) => {
      const category = req.params.category;
      console.log(category);
      const query = { category: category };
      const result = await products.find(query).toArray();
      res.send(result);
    })

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const result = await products.findOne({ _id:new ObjectId(id) });
      res.send(result);
  })
  app.post('/products',async(req,res)=>{
    const product=req.body;
    const result= await products.insertOne(product);
    res.send(result);
  })
  app.post('/users',async(req,res)=>{
    const user = req.body;
      const result = await users.insertOne(user);
      res.send(result);
  })

  app.get('/users',async(req,res)=>{
    const result=await users.find().toArray();
    res.send(result);
  })


  app.post('/userProducts',async(req,res)=>{
    const product=req.body;
    const result= await userProducts.insertOne(product);
    res.send(result);
  })
  app.get('/userProducts',async(req,res)=>{
    const result=await userProducts.find().toArray();
    res.send(result);
  })

  app.delete('/userProducts/:id',async(req,res)=>{
    const id=req.params.id;
    const query={_id:new ObjectId(id)}
    const result=await userProducts.deleteOne(query);
    res.send(result);
  })

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{

    res.send('server is running');
})
app.listen(port,()=>{
    console.log(`The server port number is ${port}`);
})


