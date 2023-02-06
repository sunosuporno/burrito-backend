const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const Pool = require("pg").Pool;
require("dotenv").config();
const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

const user = process.env.DATABASE_USER;
const password = process.env.PASSWORD;
const host = process.env.HOST;
const database = process.env.DATABASE;
const port = process.env.DATABASE_PORT;

const pool = new Pool({
  user: user,
  password: password,
  host: host,
  database: database,
  port: port,
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

// getall Miners at endpoint /getMiners

app.get("/getMiners", (req, res) => {
  pool.query("SELECT * FROM miner", (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results.rows);
  });
});

// get miner by name at endpoint /getMinerByName/:name

app.get("/getMinerByName/:name", (req, res) => {
  const name = req.params.name;
  pool.query(
    "SELECT * FROM miner WHERE miner_id = $1",
    [name],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      res.send(results.rows);
    }
  );
});

// insert stakeAmount for a miner at endpoint /insertStakeAmount/:name/:stakeAmount
app.post("/insertStakeAmount/:name/:stakeAmount", async (req, res) => {
  const name = req.params.name;
  const stakeAmount = req.params.stakeAmount;
  let newStakeAmount;
  const client = await pool.connect();
  try {
    const text = "SELECT * FROM miner WHERE miner_id = $1";
    const values = [name];

    const resStakeAmount = await client.query(text, values);
    const prevStakeAmount = resStakeAmount.rows[0];
    console.log(prevStakeAmount);
    newStakeAmount =
      Math.floor(stakeAmount) + Math.floor(prevStakeAmount.stake_amount);
    console.log(stakeAmount);
    const text2 = "UPDATE miner SET stake_amount = $1 WHERE miner_id = $2";
    const values2 = [newStakeAmount, name];

    await client.query(text2, values2);
    const resUpdatedData = await client.query(text, values);
    const updatedData = resUpdatedData.rows;
    res.send(updatedData);
  } catch (err) {
    console.log(err);
  } finally {
    client.release();
  }
});

// get miner with highest stake amount at endpoint /getMinerWithHighestStakeAmount

app.get("/getMinerWithHighestStakeAmount", (req, res) => {
  pool.query(
    "SELECT * FROM miner ORDER BY stake_amount DESC LIMIT 1",
    (err, results) => {
      if (err) {
        console.log(err);
      }
      res.send(results.rows);
    }
  );
});

// get miner with stake amount greater than given amount at endpoint /getMinerWithStakeAmountGreaterThan/:stakeAmount

app.get("/getMinerWithStakeAmountGreaterThan/:stakeAmount", (req, res) => {
  const stakeAmount = req.params.stakeAmount;
  pool.query(
    "SELECT * FROM miner WHERE stake_amount > $1",
    [stakeAmount],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      res.send(results.rows);
    }
  );
});

// get miners with a rating greater than given rating at endpoint /getMinerWithRatingGreaterThan/:rating

app.get("/getMinerWithRatingGreaterThan/:rating", (req, res) => {
  const rating = req.params.rating;
  pool.query(
    "SELECT * FROM miner WHERE rating > $1",
    [rating],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      res.send(results.rows);
    }
  );
});

//get miners with rating as 10 at endpoint /getMinerWithRating10

app.get("/getMinerWithRating10", (req, res) => {
  pool.query("SELECT * FROM miner WHERE rating = 10", (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results.rows);
  });
});

// get miners with rating and stake amount greater than given amount at endpoint /getMinerWithReputation/:rating/:stakeAmount

app.get("/getMinerWithReputation/:rating/:stakeAmount", (req, res) => {
  const rating = req.params.rating;
  const stakeAmount = req.params.stakeAmount;
  pool.query(
    "SELECT * FROM miner WHERE rating > $1 AND stake_amount > $2",
    [rating, stakeAmount],
    (err, results) => {
      if (err) {
        console.log(err);
      }
      res.send(results.rows);
    }
  );
});

// get miners in descending order of stake amount at endpoint /getMinersInDescendingOrderOfStakeAmount

app.get("/getMinersInDescendingOrderOfStakeAmount", (req, res) => {
  pool.query(
    "SELECT * FROM miner ORDER BY stake_amount DESC",
    (err, results) => {
      if (err) {
        console.log(err);
      }
      res.send(results.rows);
    }
  );
});

// get miners in descending order of rating at endpoint /getMinersInDescendingOrderOfRating

app.get("/getMinersInDescendingOrderOfRating", (req, res) => {
  pool.query("SELECT * FROM miner ORDER BY rating DESC", (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results.rows);
  });
});

// get miners in ascending order of stake amount at endpoint /getMinersInAscendingOrderOfStakeAmount

app.get("/getMinersInAscendingOrderOfStakeAmount", (req, res) => {
  pool.query(
    "SELECT * FROM miner ORDER BY stake_amount ASC",
    (err, results) => {
      if (err) {
        console.log(err);
      }
      res.send(results.rows);
    }
  );
});

// get miners in ascending order of rating at endpoint /getMinersInAscendingOrderOfRating

app.get("/getMinersInAscendingOrderOfRating", (req, res) => {
  pool.query("SELECT * FROM miner ORDER BY rating ASC", (err, results) => {
    if (err) {
      console.log(err);
    }
    res.send(results.rows);
  });
});

app.listen(PORT);
