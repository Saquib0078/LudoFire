const fs = require("fs");
const path = require("path");

const dbFilePath = path.join(__dirname, "../../data/transactions.json");
const userPath = path.join(__dirname, "../../data/user.json");
const transactionPath = path.join(__dirname, "../../data/transactions.json");

function loadConfig(path) {
  try {
    const data = fs.readFileSync(path, "utf8");
    return JSON.parse(data);
  } catch (err) {
    // If the file doesn't exist or is empty, return an empty object
    return {};
  }
}

// Function to save config data to the file
function saveConfig(configData) {
  fs.writeFileSync(dbFilePath, JSON.stringify(configData, null, 2));
}

// const userTransactions=(req,res)=>{

//     function generateRandomID() {
//         const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//         let randomID = '';

//         for (let i = 0; i < 10; i++) {
//           const randomIndex = Math.floor(Math.random() * characters.length);
//           randomID += characters[randomIndex];
//         }

//         return randomID;
//       }

//       const phone = req.params.phone;
//       const transaction = req.body;

//       // Verify if the user with the given phone number exists
//       const users = loadConfig(userPath);
//       if (!users.hasOwnProperty(phone)) {
//         return res.status(404).json({ error: 'User not found' });
//       }

//       // Generate a random ID
//       const randomID = generateRandomID();

//       // Add the transaction with the generated ID to the user's transactions
//       users[phone][randomID] = transaction;

//       // Save the updated user data
//       saveConfig(users[phone]);

//       res.status(200).json({ message: 'Transaction created successfully' });
// }

const getTransaction = (req, res) => {
  const phone = req.params.phone;

  // Verify if the user with the given phone number exists
  const users = loadConfig(transactionPath);
  if (!users.hasOwnProperty(phone)) {
    return res.status(404).json({ error: "User not found" });
  }

  // Get the transaction data for the user
  const transactions = users[phone];

  res.status(200).json({ transactions });
};

// module.exports.userTransactions=userTransactions
module.exports = { getTransaction };
