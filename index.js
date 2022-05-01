const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
// app.use(cors());
app.use(bodyParser.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });
}

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hb9h8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
const run = async () => {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    const db = client.db("booksDb");
    const booksCollection = db.collection("booksCollection");
    const userAddItemCollection = db.collection("userAddItemCollection");
    const userStockUpdateCollection = db.collection(
      "userStockUpdateCollection"
    );
    const blogsCollection = db.collection("blogs");

    //Authentication API

    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // API to Run Server
    app.get("/", async (req, res) => {
      res.send("Warehouse Server Running");
    });

    // API to get List of All Books

    app.get("/books", async (req, res) => {
      const query = {};
      const books = await booksCollection.find(query).toArray();
      res.send(books);
    });

    // API to get single Book by Id

    app.get("/books/:id", async (req, res) => {
      const bookId = req.params.id;
      const query = { _id: ObjectId(bookId) };
      const book = await booksCollection.findOne(query);
      res.send(book);
    });

    // API to Post a Book

    app.post("/book", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
      const book = req.body;
      await booksCollection.insertOne(book);
      res.send(book);
      } else {
        res.send("You are not authorized to add a book");
      }
    });


    //API to post User Info who is posting the book

    app.post("/user", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
      const user = req.body;
      console.log(user);
      await userAddItemCollection.insertOne(user);
      res.send(user);
      } else {
        res.send("You are not authorized to add a user");
      }
    });

    //API to get all User Info who is posting the book

    app.get("/users", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
        const query = {};
        const users = await userAddItemCollection.find(query).toArray();
        res.send(users);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    //API to get single User Info who is posting the book

    app.get("/users/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
        const userId = req.params.id;
        const query = { _id: ObjectId(userId) };
        const user = await userAddItemCollection.findOne(query);
        res.send(user);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    //API to get User Info who is posting the book

    app.get("/user", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      const queryEmail = req.query.email;
      if (email === decodedEmail) {
        const query = { email: queryEmail };
        // console.log(query);
        const user = await userAddItemCollection.find(query).toArray();
        res.send(user);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    //API to delete user info who is posting the book

    app.delete("/users/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
        const id = req.params.id;
        const filter = { _id: ObjectId(id) };
        const result = await userAddItemCollection.deleteOne(filter);
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    //API to update user info who is posting/updating stock of the book

    app.put("/users/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
        const id = req.params.id;
        console.log(id);
        const filter = { _id: ObjectId(id) };
        const user = req.body;
        console.log(user);
        const updateDoc = { $set: user };
        const options = { upsert: true };
        const result = await userAddItemCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    //API to post user info who update Stock of a Book

    app.post("/userStockUpdate", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
      const user = req.body;
      await userStockUpdateCollection.insertOne(user);
      res.send(user);
      } else {
        res.send("You are not authorized to add a user");
      }
    });

    //API to get user info who update Stock of a Book

    app.get("/userStockUpdate", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
      const user = await userStockUpdateCollection.find(query).toArray();
      res.send(user);
      } else {
        res.send("You are not authorized to add a user");
      }
    });

    // API to Update a Book

    app.put("/inventory/:id", verifyJWT,async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
      const id = req.params.id;
      console.log(id);
      const book = req.body;
      console.log(book);
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = { $set: book };
      const result = await booksCollection.updateOne(filter, updateDoc, option);
      res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    // API to Delete a book

    app.delete("/books/:id", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.headers.email;
      if (email === decodedEmail) {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await booksCollection.deleteOne(filter);
      res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    //API to get blogs

    app.get("/blogs", async (req, res) => {
      const query = {};
      const blogs = await blogsCollection.find(query).toArray();
      res.send(blogs);
    });
  } finally {
    // client.close();
  }
};

run().catch(console.dir);

app.listen(port, () => console.log(`Listening on port ${port}`));
