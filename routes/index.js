var express = require('express');
var router = express.Router();

const authRouter = require("./auth");
const postRouter = require("./posts");

const postCtr  = require("../controller/postCtr");

// router.get("/", (req, res)=> {
//   res.render('index', {postList : []});
// });
// 이걸 이렇게 받아오자 
router.get("/", postCtr.list);


router.use("/auth", authRouter);
router.use("/posts", postRouter);

module.exports = router;
