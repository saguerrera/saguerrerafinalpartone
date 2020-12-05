//SARA AGOSTINI-GUERRERA || FINAL PROJECT - PART ONE
//11-29-20
const express = require("express");
const app = express();
const listener = app.listen(process.env.PORT || 3000) 
// => { console.log("Your app is listening on port " + listener.address().port); });

let bodyParser = require("body-parser");
app.use(bodyParser.raw({ type: "*/*" }));

let morgan = require("morgan");
app.use(morgan("combined"));

let cors = require("cors");
app.use(cors());

let passwords = new Map();
let tokens = new Map();
let tokenID = 1011024;
let channels = new Map();
let usersBanned = new Map();
let usersJoined = new Map();
let messages = new Map();

//SOURCECODE ENDPOINT
app.get("/sourcecode", (req, res) => {
  res.send(
    require("fs")
      .readFileSync(__filename)
      .toString()
  );
});

// SIGNUP ENDPOINT
app.post("/signup", (req, res) => {
  let parsed = JSON.parse(req.body);
  let username = parsed.username;
  let password = parsed.password;

  console.log("password", password);

  if (passwords.has(username)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Username exists"
      })
    );
    return;
  }

  if (password == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "password field missing"
      })
    );
    return;
  }

  if (username == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "username field missing"
      })
    );
    return;
  }

  passwords.set(username, password);
  res.send(
    JSON.stringify({
      success: true
    })
  );
});

//LOGIN ENDPOINT
app.post("/login", (req, res) => {
  let parsed = JSON.parse(req.body);
  let username = parsed.username;
  let actualPassword = parsed.password;
  let expectedPassword = passwords.get(username);

  if (actualPassword == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "password field missing"
      })
    );
    return;
  }

  if (username == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "username field missing"
      })
    );
    return;
  }

  if (!passwords.has(username)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User does not exist"
      })
    );
    return;
  }

  if (actualPassword !== expectedPassword) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Invalid password"
      })
    );
    return;
  }

  let token = "some random token" + tokenID;
  res.send(JSON.stringify({ success: true, token: token }));

  tokens.set(token, username);
  tokenID++;
});

//CREATECHANNEL ENDPOINT
app.post("/create-channel", (req, res) => {
  let parsed = JSON.parse(req.body);
  let channelName = parsed.channelName;
  let header = req.headers;
  let token = header.token;

  if (token === undefined) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "token field missing"
      })
    );
    return;
  }

  if (channelName == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "channelName field missing"
      })
    );
    return;
  }

  if (!tokens.has(token)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Invalid token"
      })
    );
    return;
  }

  if (channelName === channels.get(token)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Channel already exists"
      })
    );
    return;
  }

  res.send(
    JSON.stringify({
      success: true
    })
  );

  channels.set(token, channelName);
});

//JOINCHANNEL ENDPOINT
app.post("/join-channel", (req, res) => {
  let parsed = JSON.parse(req.body);
  let channelName = parsed.channelName;
  let header = req.headers;
  let token = header.token;

  if (token === undefined) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "token field missing"
      })
    );
    return;
  }

  if (!tokens.has(token)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Invalid token"
      })
    );
    return;
  }

  if (channelName == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "channelName field missing"
      })
    );
    return;
  }

  let channelExists = false;
  for (let name of channels.values()) {
    if (channelName === name) {
      channelExists = true;
    }
  }

  if (channelExists == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Channel does not exist"
      })
    );
    return;
  }

  if (channelName === usersJoined.get(token)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User has already joined"
      })
    );
    return;
  }

  if (tokens.get(token) === usersBanned.get(channelName)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is banned"
      })
    );
    return;
  }

  res.send(
    JSON.stringify({
      success: true
    })
  );

  usersJoined.set(token, channelName);
});

//LEAVECHANNEL ENDPOINT
app.post("/leave-channel", (req, res) => {
  let parsed = JSON.parse(req.body);
  let channelName = parsed.channelName;
  let header = req.headers;
  let token = header.token;

  if (token === undefined) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "token field missing"
      })
    );
    return;
  }

  if (!tokens.has(token)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Invalid token"
      })
    );
    return;
  }

  if (channelName == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "channelName field missing"
      })
    );
    return;
  }
  let channelExists = false;
  for (let name of channels.values()) {
    if (channelName === name) {
      channelExists = true;
    }
  }

  if (channelExists == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Channel does not exist"
      })
    );
    return;
  }

  let joinedUser = false;
  if (channelName === usersJoined.get(token)) {
    joinedUser = true;
  }

  if (joinedUser == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is not part of this channel"
      })
    );
    return;
  }

  res.send(
    JSON.stringify({
      success: true
    })
  );

  usersJoined.delete(token);
});

//JOINED ENDPOINT
app.get("/joined", (req, res) => {
  let header = req.headers;
  let token = header.token;
  let query = req.query;
  let channelName = query.channelName;

  if (token === undefined) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "token field missing"
      })
    );
    return;
  }

  if (!tokens.has(token)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Invalid token"
      })
    );
    return;
  }

  let channelExists = false;
  for (let name of channels.values()) {
    if (channelName === name) {
      channelExists = true;
    }
  }

  if (channelExists == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Channel does not exist"
      })
    );
    return;
  }

  let joinedUser = false;
  if (channelName === usersJoined.get(token)) {
    joinedUser = true;
  }
  if (joinedUser == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is not part of this channel"
      })
    );
    return;
  }

  let joinUsers = [];
  for (let tokenList of usersJoined.keys()) {
    if (channelName === usersJoined.get(tokenList)) {
      let joinedUsername = "";
      joinedUsername = tokens.get(tokenList);
      joinUsers.push(joinedUsername);
    }
  }

  res.send(
    JSON.stringify({
      success: true,
      joined: joinUsers
    })
  );
});

//DELETE ENDPOINT
app.post("/delete", (req, res) => {
  let parsed = JSON.parse(req.body);
  let channelName = parsed.channelName;

  let header = req.headers;
  let tkn = header.token;

  if (tkn === undefined) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "token field missing"
      })
    );
    return;
  }

  if (!tokens.has(tkn)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Invalid token"
      })
    );
    return;
  }

  if (channelName == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "channelName field missing"
      })
    );
    return;
  }

  let channelExists = false;
  for (let name of channels.values()) {
    if (channelName === name) {
      channelExists = true;
    }
  }

  if (channelExists == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Channel does not exist"
      })
    );
    return;
  }

  let creator = false;
  if (channelName === channels.get(tkn)) {
    creator = true;
  }
  if (creator == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Channel not owned by user"
      })
    );
    return;
  }

  res.send(
    JSON.stringify({
      success: true
    })
  );

  channels.delete(tkn);
});

//KICK ENDPOINT
app.post("/kick", (req, res) => {
  let parsed = JSON.parse(req.body);
  let channelName = parsed.channelName;
  let userKicked = parsed.target;
  let header = req.headers;
  let tkn = header.token;

  if (tkn === undefined) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "token field missing"
      })
    );
    return;
  }

  if (!tokens.has(tkn)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Invalid token"
      })
    );
    return;
  }

  if (channelName == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "channelName field missing"
      })
    );
    return;
  }

  if (userKicked === undefined) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "target field missing"
      })
    );
    return;
  }

  let creator = false;
  if (channelName === channels.get(tkn)) {
    creator = true;
  }

  if (creator == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Channel not owned by user"
      })
    );
    return;
  }

  for (let tokenList of usersJoined.keys()) {
    if (
      (tokens.get(tokenList) === userKicked) &
      (usersJoined.get(tokenList) === channelName)
    ) {
      usersJoined.delete(tokenList);
    }
  }

  res.send(
    JSON.stringify({
      success: true
    })
  );
});

//BAN
app.post("/ban", (req, res) => {
  let parsed = JSON.parse(req.body);
  let channelName = parsed.channelName;
  let userBan = parsed.target;
  let header = req.headers;
  let tkn = header.token;

  if (tkn === undefined) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "token field missing"
      })
    );
    return;
  }

  if (!tokens.has(tkn)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Invalid token"
      })
    );
    return;
  }

  if (channelName == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "channelName field missing"
      })
    );
    return;
  }

  if (userBan == undefined) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "target field missing"
      })
    );
    return;
  }

  let creator = false;
  if (channelName === channels.get(tkn)) {
    creator = true;
  }
  if (creator == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Channel not owned by user"
      })
    );
    return;
  }

  res.send(
    JSON.stringify({
      success: true
    })
  );

  usersBanned.set(channelName, userBan);
});

//MESSAGE
app.post("/message", (req, res) => {
  let parsed = JSON.parse(req.body);
  let channelName = parsed.channelName;
  let sentMessages = parsed.contents;
  let header = req.headers;
  let token = header.token;

  if (token === undefined) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "token field missing"
      })
    );
    return;
  }

  if (!tokens.has(token)) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Invalid token"
      })
    );
    return;
  }

  if (channelName == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "channelName field missing"
      })
    );
    return;
  }

  let joinedUser = false;
  if (channelName === usersJoined.get(token)) {
    joinedUser = true;
  }

  if (joinedUser == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is not part of this channel"
      })
    );
    return;
  }

  if (sentMessages === undefined) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "contents field missing"
      })
    );
    return;
  }

  let MSGs;
  if (messages.has(channelName)) {
    MSGs = messages.get(channelName);
  } else {
    MSGs = [];
  }

  let sender = tokens.get(token);
  MSGs.push({ from: sender, contents: sentMessages });
  messages.set(channelName, MSGs);

  res.send(
    JSON.stringify({
      success: true
    })
  );
});

//MESSAGES
app.get("/messages", (req, res) => {
  let header = req.headers;
  let token = header.token;
  let query = req.query;
  let channelName = query.channelName;

  if (channelName == null) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "channelName field missing"
      })
    );
    return;
  }

  let channelExists = false;
  for (let name of channels.values()) {
    if (channelName === name) {
      channelExists = true;
    }
  }

  if (channelExists == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "Channel does not exist"
      })
    );
    return;
  }

  let joinedUser = false;
  if (channelName === usersJoined.get(token)) {
    joinedUser = true;
  }

  if (joinedUser == false) {
    res.send(
      JSON.stringify({
        success: false,
        reason: "User is not part of this channel"
      })
    );
    return;
  }

  let messageSent = messages.get(channelName);
  if (messageSent == undefined) {
    res.send(
      JSON.stringify({
        success: true,
        messages: []
      })
    );
  }

  res.send(
    JSON.stringify({
      success: true,
      messages: messageSent
    })
  );
});
