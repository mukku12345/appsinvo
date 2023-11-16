const express = require('express');
const auth = require('../middleware/authJwt')
    
const router = new express.Router();
const AuthController = require('../controller/user.controller');
const authenticate = require('../middleware/authJwt');
module.exports=app=>{
    router.post('/register', AuthController.registerUser);   
    router.put('/changeStatus',auth.verifyToken,AuthController.changeStatus) ;
    router.get('/calDistance',AuthController.calculateDistance) ;
    router.get('/getAllUserWeekDayWise',AuthController.getAllUserWeekDayWise) ;
    app.use("/api",router)
    }
    
    