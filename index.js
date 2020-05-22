const express = require("express");
require("dotenv").config();
const { MongoClient } = require("mongodb");
const bodyparser = require("body-parser");
const cors = require("cors");
const app = express();

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(cors());

const driverurl =
  "mongodb+srv://solai_client:" +
  process.env.PASSWD +
  "@cluster0-udyz3.mongodb.net/test?retryWrites=true&w=majority";

const DB_ID = "yrcsrmvec";

const client = new MongoClient(driverurl, {
  useUnifiedTopology: true,
});

const main = async () => {
  try {
    await client.connect();
    // default end point
      app.get("/", (req, res) => {
           res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
        res.send("YRC WEB API , all events are found in /events");
      });
    // get all events
    app.get("/events", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      getEvents().then((data) => res.json(data));
    });
    // add one event
    app.post("/events", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      addEvents(
        req.body.title,
        req.body.imgurl,
        req.body.story,
        req.body.links
      ).then((succ) => res.sendStatus(200).send("ok"));
      
    });
  } catch (error) {
    console.dir(error);
  }
};

const getEvents = async () => {
  let events;
  await client
    .db(DB_ID)
    .collection("yrcevents")
    .find({})
    .toArray()
    .then((data) => {
      events = data;
    });
  return events;
};

const addEvents = async (title, imgurl, story, links) => {
  let dataModel = {
    title: title,
    imgurl: imgurl,
    story: story,
    links: links,
  };
  await client.db(DB_ID).collection("yrcevents").insertOne(dataModel);
};

app.listen(process.env.PORT || 3000, (err) => {
  if (!err) {
    console.log("server running on port 3000");
  }
});

main().catch((err) => console.log("Error occurred" + err));
