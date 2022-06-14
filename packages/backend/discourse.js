import axios from "axios";

const server = "https://cors-anywhere.herokuapp.com/https://gov.gitcoin.co/";
// "https://gov.gitcoin.co/posts/{id}.json";

const requestConfig = {
  headers: {
    "Api-Key": "d51045979bec5317b4c3b628320a47d0186e6156d0d9aac1313c1dfadb12a60e",
    "Api-Username": "All Users",
    "Access-Control-Allow-Origin": "*",
    Accept: "application/json",
  },
};

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const apiPort = 4001;

app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(cors());
app.use(bodyParser.json());

app.get("/api", (req, res) => {
  res.send({ name: "GTC Govrnance API", version: "v1.0" });
  console.log("root path working");
});

app.get("/api/posts/", (req, res) => {
  const params = new URLSearchParams([["id", id]]);
  try {
    const res = await axios.get(server + "posts/", requestConfig, { params });
    console.log(res);
    return res;
  } catch (e) {
    console.error(e);
  }
  console.log("Returning Post: ");
});

app.listen(process.env.PORT || apiPort, () => {
  console.log(`Server running on port ${apiPort}`);
  console.log("");
});
