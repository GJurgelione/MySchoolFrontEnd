const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');
const express = require('express');
require('dotenv').config();

// Importuoti Joi ir joi-objectid
const Joi = require('@hapi/joi')
Joi.objectId = require('joi-objectid')(Joi)

const URI = process.env.DB_URI;
const client = new MongoClient(URI);

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

// Sukurti Joi schema mokykloms validuoti
const schoolSchema = Joi.object({
  _id: Joi.objectId(),
  name: Joi.string().max(100),
  type: Joi.string().max(50),
  city: Joi.string().max(50),
  rating: Joi.number().min(1).max(5)
})

app.get("/", async (req, res) => {
  try {
    const con = await client.connect();
    const data = await con.db("my_school").collection("schools_lithuania").find().toArray();
    await con.close();
    return res.send(data);
  } catch (err) {
    res.status(500).send({ error: "An error occurred while fetching data." });
  }
});

app.delete("/delete/:id", async (req, res) => {
  try {
    const con = await client.connect();
    const id = req.params.id;
    // Validuoti id naudojant Joi schema
    const { error, value } = schoolSchema.validate({ _id: id });
    if (error) {
      // Grąžinti blogo užklausos atsakymą, jei id yra neteisingas
      return res.status(400).send({ error: error.message });
    }
    const result = await con.db("my_school").collection("schools_lithuania").deleteOne({ _id: new ObjectId(id) });
    await con.close();

    if (result.deletedCount === 1) {
      res.send("Record deleted successfully");
    } else {
      res.status(404).send("Record not found");
    }
  } catch (err) {
    res.status(500).send({ error: "An error occurred while deleting the record." });
  }
});

app.post("/add", async (req, res) => {
  try {
    // Validuoti duomenis naudojant Joi schema
    const { error, value } = schoolSchema.validate(req.body);
    if (error) {
      // Grąžinti blogo užklausos atsakymą, jei duomenys yra neteisingi
      return res.status(400).send({ error: error.message });
    }

    const con = await client.connect();
    const db = con.db("my_school");
    const collection = db.collection("schools_lithuania");

    const result = await collection.insertOne(value);
    await con.close();

    return res.json(result.ops[0]);
  } catch (err) {
    res.status(500).send({ err });
  }
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
