const express = require('express');
const path = require("path");

const router = express.Router();
const UserController=require('../Controllers/userController')
const mainApi=require('../Controllers/mainApi')
const transactions=require('../Controllers/transaction')
const Admin=require('../Controllers/adminController')
const multer = require('multer');
const uploadsPath = path.join(__dirname, "../../uploads");


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set the destination folder where the uploaded files will be stored
        cb(null, uploadsPath);
    },
    filename: function (req, file, cb) {
        // Set the file name to be saved (you can modify this as per your requirements)
        cb(null,file.originalname);
    }
});

const upload = multer({  storage: storage });
  

router.post('/register',UserController.registerUser)
router.post('/login',UserController.login)
router.get('/top-players',UserController.UserPerformances)


router.put('/app-info',mainApi.mainApi)
router.get('/app-info',mainApi.getAppInfo)
router.get('/user-info',mainApi.checkuser)


router.get('/users/:phone/transactions',transactions.getTransaction)
router.put('/users/:phone/convert-balance',UserController.convertBalance)
router.put('/users/:phone/withdraw',UserController.withdrawWinnings)
router.put('/users/:phone/deposit',UserController.DepositRequest)

//admin
router.get('/withdraw-requests', Admin.getWithdrawRequests);
router.post('/withdraw-requests', Admin.processWithdrawRequest);
router.get('/deposit-requests', Admin.getDepositRequests);
router.post('/deposit-requests', Admin.processDepositRequest);

router.post('/upload/:phone/:matchId',upload.single('image'), Admin.uploadImage);
router.get('/getImage/:id',Admin.getImage);
router.get('/getUsers',Admin.getUsers);
router.put('/users/:userId/ban',Admin.BanUsers);
router.put('/users/:userId/unban',Admin.UnBanUsers);
router.post('/Addgames',upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'icon', maxCount: 1 }
  ]),Admin.AddGames);

  router.post('/createMatch',Admin.createMatch);
  router.post('/joinMatch',UserController.joinMatch);
  router.post('/upcomingMatches',UserController.upcomingMatches);
  router.post('/joinedMatches',UserController.joinedMatches);
  router.post('/SetRoomId',Admin.SetRoomId);


module.exports = router

