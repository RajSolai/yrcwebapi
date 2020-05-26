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
      res.send(
        "YRC WEB API , all events are found in /events , limited events are in /recents , all volunteers in /volunteers , request for blood in /bldreq , all donors in /bldonors"
      );
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
    // get limited events
    app.get("/recents", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      getEvents_limited(8).then((data) => res.json(data));
    });
    // get all volunteers
    app.get("/volunteers", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      getVols().then((data) => res.json(data));
    });
    // post a request for blood
    app.post("/bldreq", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      addBldrequest(
        req.body.name,
        req.body.contact,
        req.body.email,
        req.body.bldgrp,
        req.body.hospitalname,
        req.body.relationtopatient
      )
        .then((succ) => res.sendStatus(200).send("ok"))
        .catch((err) => console.dir(err));
    });
    // add a blood donor
    app.post("/bldonors", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      addDonor(
        req.body.name,
        req.body.age,
        req.body.work,
        req.body.bldgrp,
        req.body.pdh,
        req.body.weight,
        req.body.medical_history
      )
        .then((succ) => res.sendStatus(200).send("ok"))
        .catch((err) => console.dir(err));
    });
    // get all donors
    app.get("/bldonors", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      getDonors().then((data) => res.json(data));
    });
    // post an volunteers
    app.post("/volunteers", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      addVolunteer(
        req.body.avatarurl,
        req.body.name,
        req.body.contact,
        req.body.dept,
        req.body.year
      )
        .then((succ) => res.sendStatus(200).send("ok"))
        .catch((err) => console.dir(err));
    });
    // post an event
    app.post("/events", (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      addEvents(
        req.body.uploaddate,
        req.body.title,
        req.body.imgurl,
        req.body.imgtag,
        req.body.desc,
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

const getDonors = async () => {
  let donors;
  await client
    .db(DB_ID)
    .collection("blood_donors")
    .find({})
    .toArray()
    .then((data) => {
      donors = data;
    });
  return donors;
};

const getEvents_limited = async (limit) => {
  let events;
  await client
    .db(DB_ID)
    .collection("yrcevents")
    .find({})
    .limit(limit)
    .toArray()
    .then((data) => {
      events = data;
    });
  return events;
};

const getVols = async () => {
  let vols;
  await client
    .db(DB_ID)
    .collection("yrc_vols")
    .find({})
    .toArray()
    .then((data) => {
      vols = data;
    });
  return vols;
};

const addEvents = async (
  uploaddate,
  title,
  imgurl,
  imgtag,
  desc,
  story,
  links
) => {
  let dataModel = {
    uploaddate: uploaddate,
    title: title,
    imgurl: imgurl,
    imgtag: imgtag,
    story: story,
    desc: desc,
    links: links,
  };
  await client.db(DB_ID).collection("yrcevents").insertOne(dataModel);
};

const addVolunteer = async (avatarurl, name, contact, dept, year) => {
  let dataModel = {
    avatarurl: avatarurl,
    name: name,
    contact: contact,
    dept: dept,
    year: year,
  };
  await client.db(DB_ID).collection("yrc_vols").insertOne(dataModel);
};

const addDonor = async (
  name,
  age,
  work,
  blood_group,
  pre_donation_history,
  weight,
  medical_history
) => {
  let dataModel = {
    name: name,
    age: age,
    work: work,
    bldgrp: blood_group,
    pdh: pre_donation_history,
    weight: weight,
    medical_history: medical_history,
  };
  await client.db(DB_ID).collection("blood_donors").insertOne(dataModel);
};

const addBldrequest = async (
  name,
  contact,
  email,
  bldgrp,
  hospitalname,
  rtop
) => {
  let dataModel = {
    name: name,
    contact: contact,
    email: email,
    bldgrp: bldgrp,
    hospitalname: hospitalname,
    relationtopatient: rtop,
  };
  await client.db(DB_ID).collection("blood_req").insertOne(dataModel);
};

app.listen(process.env.PORT || 3000, (err) => {
  if (!err) {
    console.log("server running on port 3000");
  }
});

main().catch((err) => console.log("Error occurred" + err));
