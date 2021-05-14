const User = require("../model/auth"); // User 스키마를 불러오는 거

const bcrypt = require("bcrypt"); // 패스워드 암호화 하는 것

const jwt = require("jsonwebtoken");

const secretKey = require('../config/secretKey.json'); 


const authCtr = {
  register: async (req, res) => {
    // 회원가입
    // req.body안에 있는 데이터를 받아오자
    const { username, password } = req.body;
    // 회원가입을 한 사람인지 아닌지 확인하는 거
    const exist = await User.findOne({ username: username });
    if (exist) {
      res.status(504).send("user exist!!");
      return;
    }
    // 새 가입자라면 스키마에 새로운 것을 넣어주는데 username만 넣고
    const user = new User({
      username: username,
    });
    // 비번은 비크립트로 암호화 처리하도록 하자
    const hashedPassword = await bcrypt.hash(password, 10); // hash알고리즘을 10번 할거라고 하는 거야
    user.password = hashedPassword;
    await user.save(); // 저장을 해주고
    res.redirect("/");
  },
  login: async (req, res) => {
    // 로그인 진행하기
    const { username, password } = req.body; // 유저랑 비번을 바디에서 받아오고 
    const user = await User.findOne({ username: username }); // 아이디랑 같은 걸 찾고 
    if (!user) { // 만약 없다면 없다고 하기
      res.status(500).send("user not found!!");
      return;
    }
    // 유저를 찾았다면 
    const valid = await bcrypt.compare(password, user.password); // 받아온 패스워드랑 디비의 패스워드를 비교하는거
    if (!valid) {
      res.status(500).send("password invalid");
    }
    const data = user.toJSON(); //유저를 제이슨으로 만들어주고 
    delete data.password; // 유저 정보 중에서 비번을 없애고 
    const token = jwt.sign( // 유저 정보를 토큰에 담는다
      {
        _id: data._id,
        username: data.username,
      },
      secretKey.key, // 암호화하는 키를 만들어야 해 시크릿 키를 받아와서 
      {
        expiresIn: "7d", // 해당 토큰을 7일이면 다시 발급하게끔
      }
    );
    res.cookie("access_token", token, { // 이번에는 쿠키에 담아서 보낼 거야 
      maxAge: 1000 * 60 * 60 * 24 * 7, // 밀리세컨을 이용하기에 1000이 일초임 
      httpOnly: true, // http에서만 접근할 수 있도록
    });
    res.redirect("/");
  },
};

module.exports = authCtr;
