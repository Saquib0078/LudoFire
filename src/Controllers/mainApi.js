const fs = require("fs");

const path = require("path");

const dbFilePath = path.join(__dirname, "../../data/app-info.json");
const userPath = path.join(__dirname, "../../data/user.json");
const matchesPath = path.join(__dirname, "../../data/matches.json");
const games = path.join(__dirname, "../../data/games.json");

// Function to load config data from the file
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

const mainApi = (req, res) => {
  const updatedConfig = req.body;

  // Load the config data from the file
  const configData = loadConfig(dbFilePath);
  // Update the config data
  const updatedData = {
    ...configData,
    ...updatedConfig,
  };

  // Save the updated config data to the file
  saveConfig(updatedData);

  res.status(200).json({ status: "Config updated successfully" });
};

const getAppInfo = (req, res) => {
  const configData = loadConfig();

  res.status(200).json({ configData });
};

//alt +shift+arrow down

const checkuser = (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res
      .status(200)
      .json({ status: "error", error: "Phone is required" });
  }

  const userData = loadConfig(userPath);
  if (userData[phone]) {
    if (userData[phone]["active"] && userData[phone]["active"] == "banned") {
      return res.status(200).json({ status: "account-banned" });
    } else {
      const appin = loadConfig(dbFilePath);
      const gamesinfo = loadConfig(games);
      const allmatches = loadConfig(matchesPath);
      const matches = [];
      gamesinfo.map((gameobj) => {
        let count = 0;
        if (allmatches[gameobj["name"]]) {
          count = Object.keys(allmatches[gameobj["name"]]).length;
        }
        gameobj["count"] = count;
        matches.push(gameobj);
      });
      return res.status(200).json({
        status: "success",
        data: userData[phone],
        games: matches,
        images: appin["slider-images"],
      });
    }
  }
  console.log(userData);
};

module.exports.mainApi = mainApi;
module.exports.getAppInfo = getAppInfo;
module.exports.checkuser = checkuser;
