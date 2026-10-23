const express = require("express")
const Router = express.Router();
const {toSignUp} = require("../controllers/user/createAccount")
const {toLogin} = require("../controllers/user/toLogin")
const { requestPasswordReset, resetPassword } = require("../controllers/user/passwordReset");

Router.post('/signup',toSignUp)
Router.post('/signin',toLogin)
Router.post('/forgot-password', requestPasswordReset)
Router.post('/reset-password', resetPassword)

module.exports=Router;
