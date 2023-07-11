const express = require('express');
const cors = require('cors');
const jwt=require('jsonwebtoken');

const app = express();
require('dotenv').config();
const port = process.env.PORT || 4000;
app.use(cors());
app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const uri = `mongodb+srv://${process.env.SECRET_User}:${process.env.SECRET_PASS}@cluster11.cpm08j1.mongodb.net/?retryWrites=true&w=majority`;
const uri = 'mongodb+srv://EcommerceSite:xfcyMbY6VWNB6ET5@cluster11.cpm08j1.mongodb.net/?retryWrites=true&w=majority';
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const jwtToken='6bb5a74f2c2ad905f90d721c1b9def672fc53622532530057f24d08a64e791e4d8f56453dfe8c2d249711a098c6a860ef8bf75ecd4db2a87da11abd5610c5256';
const stripe=require('stripe')('sk_test_51NEmG3IxzytApYUlezdVCVvSiGKYTMPRcizhPcJbk70FNEUHtQQ4Zo6Oypdn7Jmpir3PLHlhMOx0zLRuvL0dzqhA00ZSSQyNYP')
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// require('crypto').randomBytes(64).toString('hex')

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const products = client.db('emaJohnDB').collection('products');
    const users = client.db('emaJohnDB').collection('users');
    const userProducts = client.db('emaJohnDB').collection('userProducts')



    // jwt system use

    app.post('/jwt',async(req,res)=>{
      const user=req.body;
      console.log(user);
      const token=jwt.sign(user,jwtToken,{expiresIn:'1h'})
      res.send({token});
    })

    const verifyJwt=(req,res,next)=>{
      const authorization=req.headers.authorization;
      if(!authorization){
        return res.status(401).send({error:true,message:'unauthorized access'})
      }
      const token=authorization.split(' ')[1]
      jwt.verify(token,jwtToken,(error,decoded)=>{
        if(error){
          return res.status(401).send({error:true,message:'unauthorized access'})
        }
        req.decoded=decoded;
        next()
      })
    }

    
    app.get('/products', async (req, res) => {
      const result = await products.find().toArray();
      res.send(result);
    })

    app.get('/products/:category', async (req, res) => {
      const category = req.params.category;
      // console.log(category);
      const query = { category: category };
      const result = await products.find(query).toArray();
      res.send(result);
    })

    app.get('/products/selected/:id', async (req, res) => {
      const searchQuery = req.params.id;
      // console.log(searchQuery)
      try {
        const result = await products.find({ category: { $regex: new RegExp(searchQuery, 'i') } }).toArray();
        res.send(result);
      } catch (error) {
        console.error('Error querying MongoDB:', error);
        res.status(500).send('Internal Server Error');
      }
    });


    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const result = await products.findOne({ _id: new ObjectId(id) });
      res.send(result);
    })
    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await products.insertOne(product);
      res.send(result);
    })
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await users.insertOne(user);
      res.send(result);
    })

    app.get('/users', async (req, res) => {
      const result = await users.find().toArray();
      res.send(result);
    })


    app.post('/userProducts', async (req, res) => {
      const product = req.body;
      const result = await userProducts.insertOne(product);
      res.send(result);
    })
    app.get('/userProducts', async (req, res) => {
      const result = await userProducts.find().toArray();
      res.send(result);
    })

    app.delete('/userProducts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userProducts.deleteOne(query);
      res.send(result);
    })

    app.patch('/userProducts/payment/:id',async(req,res)=>{
      const id=req.params.id;
      const userProduct=req.body;
      console.log(id,userProduct.paymentHistory.id)
      const filter={_id: new ObjectId(id)}
      const option={upsert:true}
      const updateStudent={
        $set:{
          status:userProduct.paymentHistory.id,
        }
      }
      const result=await userProducts.updateOne(filter,updateStudent,option);
      res.send(result);
    })
    app.post('/create-payment-intent',async(req,res)=>{
      const {price}=req.body;
      const amount=price*100;
      const paymentIntent=await stripe.paymentIntents.create({
          amount:amount,
          currency:'usd',
          payment_method_types:['card']
      })
      res.send({
          clientSecret:paymentIntent.client_secret
      })
  })



  // const paymentHistory = client.db('emaJohnDB').collection('paymentHistory');
  // app.post('/paymentHistory',async(req,res)=>{
  //   const history=req.body;
  //   const result=await paymentHistory.insertOne(history);
  //   res.send(result);
  // })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {

  res.send('server is running');
})
app.listen(port, () => {
  console.log(`The server port number is ${port}`);
})


