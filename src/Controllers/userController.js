const fs = require("fs");
const path = require("path");

const dbFilePath = path.join(__dirname, "../../data/user.json");
const withdrawRequest = path.join(__dirname, "../../data/withdrawRequest.json");
const depositRequest = path.join(__dirname, "../../data/deposit.json");
const matchesPath = path.join(__dirname, "../../data/matches.json");

// Register a new user
const registerUser = async (req, res) => {
  let { phone, email, password, name } = req.body;

  // Check if the required fields are missing
  if (!phone || !email || !password || !name) {
    return res.status(200).json({ error: "All fields are required" });
  }

  // Load the user database
  const users = loadUsers(dbFilePath);

  // Check if the phone number already exists
  if (users[phone]) {
    return res.status(200).json({ error: "Phone number already registered" });
  }
  if (Object.values(users).some((user) => user.email === email)) {
    return res.status(200).json({ error: "Email already registered" });
  }

  // Create a new user object
  const newUser = {
    email,
    password,
    name,
    balances: {
      "winning-balance": 0,
      "gamming-balance": 0,
      "total-winnings": 0,
    },
  };

  // Save the user to the database

  users[phone] = newUser;
  saveUsers(users);

  res.status(200).json({ message: "Registration successful", data: newUser });
};

// Login with phone and password
const login = async (req, res) => {
  var { phone, password } = req.body;

  // Check if the phone or password is missing
  if (!phone || !password) {
    return res.status(200).json({ error: "Phone and password are required" });
  }

  // Load the user database
  const users = loadUsers(dbFilePath);

  // Find the user by phone number
  const userphone = users[phone];
  const pass = userphone["password"];

  // Check if the user exists
  if (!userphone) {
    return res.status(200).json({ error: "Invalid phone number" });
  }

  if (pass != password)
    return res.status(200).json({ error: "Invalid password" });

  res.status(200).json({ message: "Login successful" });
};

const UserPerformances = (req, res) => {
  const getuser = loadUsers(dbFilePath);
  const data = [];
  for (let key in getuser) {
    if (getuser.hasOwnProperty(key)) {
      const d = {};
      d["name"] = getuser[key]["name"];
      d["total-winnings"] = getuser[key]["balances"]["total-winnings"];
      data.push(d);
    }
  }

  res.status(200).json({ data });
};

// Function to load users from the database file
function loadUsers(path) {
  try {
    const data = fs.readFileSync(path, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // If the file doesn't exist or is empty, return an empty object
    return {};
  }
}

// Function to save users to the database file
function saveUsers(users) {
  fs.writeFileSync(dbFilePath, JSON.stringify(users, null, 2));
}

function saveRequests(withdraw) {
  fs.writeFileSync(withdrawRequest, JSON.stringify(withdraw, null, 2));
}

function saveDeposit(deposit) {
  fs.writeFileSync(depositRequest, JSON.stringify(deposit, null, 2));
}

const convertBalance = (req, res) => {
  const phone = req.params.phone;
  const amount = parseFloat(req.body.amount);

  // Read user data from the JSON file
  const userData = loadUsers(dbFilePath);

  if (!(phone in userData)) {
    res.status(200).json({ error: "User not found", errorCode: "900" });
    return;
  }

  const user = userData[phone];
  const winningBalance = user.balances["winning-balance"];

  if (amount > winningBalance) {
    res
      .status(200)
      .json({ error: "Amount exceeds winning balance", errorCode: "874" });
    return;
  }

  // Update the balances
  user.balances["winning-balance"] -= amount;
  user.balances["gaming-balance"] += amount;

  // Save the updated user data to the JSON file
  saveUsers(userData);

  res.send(userData[phone]);
};

const withdrawWinnings = (req, res) => {
  const phone = req.params.phone;
  const amount = parseFloat(req.body.amount);
  const number_type = req.body["number-type"];
  const number = req.body.number;
  const type = req.body;
  if (!number || !number_type || !amount)
    return res.status(200).json({ status: "error" });
  // Read user data from the JSON file
  const userData = loadUsers(dbFilePath);
  const withdrawReq = loadUsers(withdrawRequest);

  if (!(phone in userData)) {
    res.status(200).json({ error: "User not found", errorCode: "900" });
    return;
  }
  const user = userData[phone];
  const winningBalance = user.balances["winning-balance"];

  if (amount > winningBalance) {
    res
      .status(200)
      .json({ error: "Amount exceeds winning balance", errorCode: "874" });
    return;
  }
  user.balances["winning-balance"] -= amount;

  saveUsers(userData);

  function generateRandomID() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomID = "";

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomID += characters[randomIndex];
    }

    return randomID;
  }
  const randomid = generateRandomID();

  if (!withdrawReq[phone]) {
    withdrawReq[phone] = {};
  }

  withdrawReq[phone][randomid] = {
    amount,
    type,
    number,
    "number-type": number_type,
    date: new Date().toISOString(),
  };
  saveRequests(withdrawReq);

  res.json({ status: "success" });
};

const DepositRequest = (req, res) => {
  const phone = req.params.phone;
  const amount = parseFloat(req.body.amount);
  const number_type = req.body["number-type"];
  const number = req.body.number;
  const type = req.body;

  if (!number || !number_type || !amount)
    return res.status(200).json({ status: "error" });
  // Read user data from the JSON file
  const userData = loadUsers(dbFilePath);
  const deposit = loadUsers(depositRequest);

  if (!(phone in userData)) {
    res.status(200).json({ error: "User not found", errorCode: "900" });
    return;
  }
  const user = userData[phone];
  // const winningBalance = user.balances['winning-balance'];

  saveUsers(userData);

  function generateRandomID() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomID = "";

    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomID += characters[randomIndex];
    }

    return randomID;
  }
  const randomid = generateRandomID();

  if (!deposit[phone]) {
    deposit[phone] = {};
  }

  deposit[phone][randomid] = {
    amount,
    number,
    type,
    "number-type": number_type,
    date: new Date().toISOString(),
  };
  saveDeposit(deposit);

  console.log(deposit);
  res.json({ status: "success" });
};

const joinMatch=(req,res)=>{
  const matchId = req.body.match_id;
  const userPhone = req.body.phone_number;
  const gameId=req.body.gameId

  if (matchId && userPhone) {
    fs.readFile(matchesPath, 'utf8', (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
      }

      const matches = JSON.parse(data);
      const match = matches[gameId][matchId];
        console.log(match)
      if (match) {
        const joined = match.joined || [];
        if (!joined.includes(userPhone)) {
          joined.push(userPhone);
          match.joined = joined;
          fs.writeFile(matchesPath, JSON.stringify(matches,null,2), 'utf8', (err) => {
            if (err) {
              console.error(err);
              res.status(500).json({ message: 'Internal Server Error' });
              return;
            }
            res.status(200).json({ message: 'User joined the match successfully.' });
          });
        } else {
          res.status(400).json({ message: 'User has already joined the match.' });
        }
      } else {
        res.status(404).json({ message: 'Match not found.' });
      }
    });
  } else {
    res.status(400).json({ message: 'Invalid request data.' });
  }
}

const upcomingMatches=(req,res)=>{
 const userPhone = req.body.phone_number;

  fs.readFile(matchesPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }

    const matches = JSON.parse(data);
    const upcomingMatches = [];

    for (const matchCategory in matches) {
      const categoryMatches = matches[matchCategory];

      for (const matchId in categoryMatches) {
        const match = categoryMatches[matchId];

        if (!match.joined || !match.joined.includes(userPhone)) {
          upcomingMatches.push({
            match_id: matchId,
            match_name: matchCategory,
            ...match
          });
        }
      }
    }

    res.status(200).json({ upcoming_matches: upcomingMatches });
  });
}

const joinedMatches=(req,res)=>{
  const userPhone = req.body.phone_number;
 
  fs.readFile(matchesPath, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: 'Internal Server Error' });
      return;
    }

    const matches = JSON.parse(data);
    const joinedMatches = [];

    for (const matchCategory in matches) {
      const categoryMatches = matches[matchCategory];

      for (const matchId in categoryMatches) {
        const match = categoryMatches[matchId];

        if (match.joined && match.joined.includes(userPhone)) {
          joinedMatches.push({
            match_id: matchId,
            match_name: matchCategory,
            ...match
          });
        }
      }
    }

    res.status(200).json({ joined_matches: joinedMatches });
  });
 }

 

module.exports.login = login;
module.exports.registerUser = registerUser;
module.exports.UserPerformances = UserPerformances;
module.exports.convertBalance = convertBalance;
module.exports.withdrawWinnings = withdrawWinnings;
module.exports.DepositRequest = DepositRequest;
module.exports.joinMatch = joinMatch;
module.exports.upcomingMatches = upcomingMatches;
module.exports.joinedMatches = joinedMatches;
