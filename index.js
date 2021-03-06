const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (req, res) => res.send("healthcheck"));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"]
  }
});

const memberMap = {};

io.on("connection", socket => {
  let name = socket.handshake.query.name;
  memberMap[socket.handshake.query.uid] = name;
  console.log(`User: ${name}, connected`);
  io.emit("member_update", memberMap);
  socket.on("offer", msg => {
    socket.broadcast.emit("offer", msg);
  });
  socket.on("answer", msg => {
    socket.broadcast.emit("answer", msg);
  });
  socket.on("disconnecting", err => {
    delete memberMap[socket.handshake.query.uid];
    io.emit("member_update", memberMap);
    console.log(`User: ${name}, disconnected`);
  });
});

server.listen(4000, "0.0.0.0", () => {
  console.log("listening on 0.0.0.0:4000");
});
