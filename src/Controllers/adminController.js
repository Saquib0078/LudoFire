const fs = require("fs");
const path = require("path");
const dbFilePath = path.join(__dirname, "../../data/user.json");
const withdrawRequest = path.join(__dirname, "../../data/withdrawRequest.json");
const depositRequest = path.join(__dirname, "../../data/deposit.json");
const transactionPath = path.join(__dirname, "../../data/transactions.json");
const imagepath = path.join(__dirname, "../../data/images.json");
const uploadsPath = path.join(__dirname, "../../uploads");
const gamesPath = path.join(__dirname, "../../data/games.json");
const matchesPath = path.join(__dirname, "../../data/matches.json");

function loadUsers(path) {
  try {
    const data = fs.readFileSync(path, "utf8");
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

// Function to save config data to the file
function saveUsers(configData) {
  fs.writeFileSync(dbFilePath, JSON.stringify(configData, null, 2));
}

function saveGammes(configData) {
  fs.writeFileSync(dbFilePath, JSON.stringify(configData, null, 2));
}
function saveTransactions(configData) {
  fs.writeFileSync(transactionPath, JSON.stringify(configData, null, 2));
}

function saveWithdraw(configData) {
  fs.writeFileSync(withdrawRequest, JSON.stringify(configData, null, 2));
}

function saveDeposit(configData) {
  fs.writeFileSync(depositRequest, JSON.stringify(configData, null, 2));
}

const getWithdrawRequests = (req, res) => {
  const withdrawReq = loadUsers(withdrawRequest);
  res.json({ status: "success", data: withdrawReq });
};

const processWithdrawRequest = (req, res) => {
  const withdrawReq = loadUsers(withdrawRequest);

  const { phone, txnid, accept, amount, type } = req.body;

  if (!withdrawReq[phone] || !withdrawReq[phone][txnid]) {
    res.status(200).json({ error: "Withdrawal request not found" });
    return;
  }

  const request = withdrawReq[phone][txnid];

  if (accept === "true") {
    const userData = loadUsers(dbFilePath);
    const user = userData[phone];
    const winningBalance = user.balances["winning-balance"];

    const transactions = loadUsers(transactionPath);

    if (!transactions[phone]) {
      transactions[phone] = {};
    }

    withdrawReq[phone][txnid]["status"] = "success";
    withdrawReq[phone][txnid]["type"] = "withdraw";
    transactions[phone][txnid] = withdrawReq[phone][txnid];

    saveTransactions(transactions);

    // Remove the transaction from the withdrawal request JSON
    delete withdrawReq[phone][txnid];
    if (Object.keys(withdrawReq[phone]).length === 0) {
      delete withdrawReq[phone];
    }

    saveWithdraw(withdrawReq);

    if (parseFloat(amount) > winningBalance) {
      res
        .status(200)
        .json({ error: "Amount exceeds winning balance", errorCode: "874" });
      return;
    }

    saveUsers(userData);
    res
      .status(200)
      .json({ status: "success", message: "Withdrawal request accepted" });
  } else if (accept === "false") {
    // Credit the amount back to the user's winning balance
    const userData = loadUsers(dbFilePath);
    const user = userData[phone];
    user.balances["winning-balance"] += parseFloat(amount);
    saveUsers(userData);
    // Return success response
    res
      .status(200)
      .json({ status: "success", message: "Withdrawal request rejected" });
  } else {
    // Invalid option provided
    res.status(200).json({ error: "Invalid option provided" });
  }
};

const getDepositRequests = (req, res) => {
  const DepositReq = loadUsers(depositRequest);
  res.json({ status: "success", data: DepositReq });
};

const processDepositRequest = (req, res) => {
  const DepositReq = loadUsers(depositRequest);
  const { phone, txnid, accept, amount } = req.body;

  if (!DepositReq[phone] || !DepositReq[phone][txnid]) {
    res.status(200).json({ error: "Withdrawal request not found" });
    return;
  }

  if (accept === "true") {
    const userData = loadUsers(dbFilePath);
    const user = userData[phone];
    const transactions = loadUsers(transactionPath);

    if (!transactions[phone]) {
      transactions[phone] = {};
    }

    DepositReq[phone][txnid]["status"] = "success";
    DepositReq[phone][txnid]["type"] = "deposit";
    transactions[phone][txnid] = DepositReq[phone][txnid];

    saveTransactions(transactions);

    // Remove the transaction from the withdrawal request JSON
    delete DepositReq[phone][txnid];
    if (Object.keys(DepositReq[phone]).length === 0) {
      delete DepositReq[phone];
    }

    saveDeposit(DepositReq);

    user.balances["gaming-balance"] += parseFloat(amount);
    saveUsers(userData);
    res
      .status(200)
      .json({ status: "success", message: "deposit request accepted" });
  } else if (accept === "false") {
    // Credit the amount back to the user's winning balance
    const userData = loadUsers(dbFilePath);
    const user = userData[phone];
    user.balances["gaming-balance"] -= parseFloat(amount);
    saveUsers(userData);
    // Return success response
    res
      .status(200)
      .json({ status: "success", message: "deposit request rejected" });
  } else {
    // Invalid option provided
    res.status(200).json({ error: "Invalid option provided" });
  }
};

const uploadImage = (req, res) => {
  const imageUrl = `http://localhost:3000/getImage/${req.file.originalname}`;

  try {
    let phone = req.params.phone;
    let matchID = req.params.matchId;
    const jsonData = fs.readFileSync(imagepath);
    let images = JSON.parse(jsonData);
    if (!images[phone]) {
      images[phone] = {};
    }
    images[phone][matchID] = {
      url: imageUrl,
      date: new Date().toISOString(),
    };

    // Write the updated JSON data back to the file
    try {
      const jsonContent = JSON.stringify(images, null, 2);
      fs.writeFileSync(imagepath, jsonContent);
      console.log("Image URL saved successfully.");
    } catch (error) {
      console.error("Error writing JSON file:", error);
    }

    res
      .status(200)
      .json({ status: "success", message: "Image uploaded successfully." });
  } catch (error) {
    console.error("Error reading JSON file:", error);
  }
};

const getImage = (req, res) => {
  const imagePath = uploadsPath + "/" + req.params.id; // Replace with the actual path to your image file
  const image = fs.readFileSync(imagePath);
  const contentType = "image/jpeg"; // Set the appropriate content type for your image

  res.setHeader("Content-Type", contentType);
  res.send(image);
};

const getUsers = (req, res) => {
  const users = loadUsers(dbFilePath);

  res.status(200).json({ users });
};

const BanUsers = (req, res) => {
  const users = loadUsers(dbFilePath);
  const { userId } = req.params;

  const isBanned = true;

  if (isBanned) {
    users[userId].status = "banned";

    saveUsers(users);
    res.status(200).json(users[userId]);
  } else {
    res.status(200).json(users[userId]);
  }
};

const UnBanUsers = (req, res) => {
  const users = loadUsers(dbFilePath);
  const { userId } = req.params;

  const isBanned = true;
  if (isBanned) {
    delete users[userId].status;

    saveUsers(users);

    res.status(200).json(users[userId]);
  } else {
    res.status(200).json(users[userId]);
  }
};


const AddGames=(req, res) => {
  const { name } = req.body;
  const imageFile = `http://localhost:3000/getImage/${req.files['image'][0].originalname}`;
  const iconFile = `http://localhost:3000/getImage/${req.files['icon'][0].originalname}`; 

  // Create a new game object
  const newGame = {
    name,
    image: imageFile,
    icon: iconFile
  };

  let games = [];
  try {
    const jsonData = fs.readFileSync(gamesPath);
    games = JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading games JSON file:', error);
    res.status(500).json({ error: 'Failed to create a new game.' });
    return;
  }

  
  games.push(newGame) ;

  try {
    fs.writeFileSync(gamesPath, JSON.stringify(games,null,2));
    console.log('Game created successfully.');
     saveGammes(gamesPath)
    res.status(201).json({ success: true, message: 'Game created successfully.' });
  } catch (error) {
    console.error('Error writing games JSON file:', error);
    res.status(500).json({ error: 'Failed to create a new game.' });
  }
};

const createMatch=(req,res)=>{
  const { name, gameData } = req.body;

  // Validate the required fields
  if (!name || !gameData || !gameData.time || !gameData['total-prize'] || !gameData['entry-fee'] || !gameData.version || !gameData['board-type'] || !gameData['total-seats']) {
    res.status(400).json({ error: 'Missing required fields.' });
    return;
  }

  
  let matches = {};
  try {
    const jsonData = fs.readFileSync(matchesPath);
    matches = JSON.parse(jsonData);
  } catch (error) {
    console.error('Error reading games JSON file:', error);
    res.status(500).json({ error: 'Failed to create a new game.' });
    return;
  }

  // Generate a new game ID
  const newGameId = Date.now().toString();

  // Create a new game object
  const newGame = {
    name,
    ...gameData
  };

  // Add the new game to the games object
  matches[name] = {
    [newGameId]: newGame
  };


  try {
    fs.writeFileSync(matchesPath, JSON.stringify(matches,null,2));
    console.log('match created successfully.');
    res.status(201).json({ success: true, message: 'match created successfully.' });
  } catch (error) {
    console.error('Error writing games JSON file:', error);
    res.status(500).json({ error: 'Failed to create a new game.' });
  }
};

const SetRoomId=(req,res)=>{
const {gameId,matchId,roomId}=req.body

fs.readFile(matchesPath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
    return;
  }

  const matches = JSON.parse(data);
  const match = matches[gameId][matchId];
  console.log(matchId)
  if (match) {
    match.roomId = roomId;

    fs.writeFile(matchesPath, JSON.stringify(matches, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal Server Error' });
        return;
      }
      res.status(200).json({ message: 'Room ID added to the match successfully.' });
    });
  } else {
    res.status(404).json({ message: 'Match not found.' });
  }
});




}



module.exports = {
  processWithdrawRequest,
  getWithdrawRequests,
  processDepositRequest,
  getDepositRequests,
  uploadImage,
  getImage,
  getUsers,
  BanUsers,
  UnBanUsers,
  AddGames,
  createMatch,
  SetRoomId
};
