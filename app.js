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

    const resUpdate = await client.query(text2, values2);
    const update = resUpdate.rows;
    res.send(update);
  } catch (err) {
    console.log(err);
  } finally {
    client.release();
  }
});

app.listen(PORT);
