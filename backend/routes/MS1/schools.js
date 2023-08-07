const express = require('express');
const mongoose = require('mongoose');
const Joi = require('joi');

const router = express.Router();

// Connect to MongoDB database
mongoose.connect('mongodb://localhost:/my_school', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Define pet schema and model
const schoolSchema = new mongoose.Schema({
  name: String,
  type: String,
  city: String
});

const School = mongoose.model('School', schoolSchema);

// Define input validation schema
const inputSchema = Joi.object({
  name: Joi.string().alphanum().trim().required(),
  type: Joi.string().alphanum().trim().required(),
  city: Joi.string().alphanum().trim().required(),
});

router.get('/', async (req, res) => {
  try {
    // Find all non-archived schools and limit the results
    const data = await School.find();
    return res.send(data);
  } catch (err) {
    console.log(err);
    return res.status(500).send({ err: 'Server error. Please try again.' });
  };
});

// router.post('/', async (req, res) => {
//   let userInput = req.body;

//   try {
//     userInput = await inputSchema.validateAsync(userInput);
//   } catch (err) {
//     console.log(err);
//     return res.status(400).send({ err: 'Incorrect data passed' });
//   }

//   try {
//     // Create a new pet document and save it to the database
//     const data = await Pet.create(userInput);
//     return res.send(data);
//   } catch (err) {
//     console.log(err);
//     return res.status(500).send({ err: 'Server error. Please try again.' });
//   }
// });

// router.delete('/:id', async (req, res) => {
//   try {
//     // Update the pet document with the given id and set archived to true
//     const data = await Pet.updateOne({ _id: req.params.id }, { archived: true });
//     return res.send(data);
//   } catch (err) {
//     console.log(err);
//     return res.status(500).send({ err: 'Server error. Please try again.' });
//   }
// });

module.exports = router;