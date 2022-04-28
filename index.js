const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());

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

    app.post("/book", async (req, res) => {
      const book = req.body;
      await booksCollection.insertOne(book);
      res.send(book);
    });

    // API to Update a Book

    app.put("/books/:id", async (req, res) => {
      const id = req.params.id;
      const book = req.body;
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = { $set: book };
      const result = await booksCollection.updateOne(filter, updateDoc, option);
      res.send(result);
    });

    // API to Delete a book

    app.delete("/books/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await booksCollection.deleteOne(filter);
      res.send(result);
    });
  } finally {
    // client.close();
  }
};

run().catch(console.dir);

app.listen(port, () => console.log(`Listening on port ${port}`));
