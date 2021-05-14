const express = require("express");
const router = express.Router();

const authCtr = require("../../controller/authCtr");
// 로그인으로 가자
router.get("/login", (req, res) => {
    res.render("login");
});
//로그인 진행
router.post("/login", authCtr.login);

// 로그 아웃
// 쿠키를 지워주면 아주 손쉽게 로그아웃 가능
router.post("/logout", (req, res) => {
    res.clearCookie("access_token");
    res.redirect('/');
});




// 회원가입으로 가자
router.get("/register", (req, res) => {
    res.render("register");
});
// 회원가입 진행
router.post("/register", authCtr.register);




module.exports = router