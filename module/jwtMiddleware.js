const jwt = require("jsonwebtoken");
const secretKey = require("../config/secretKey.json"); // 시크릿 키를 가져와서 

const jwtMiddleware = async (req, res, next) => {
  const token = req.cookies.access_token; // 쿠키를 받아서
  if (!token) { // 쿠키가 없다면
    res.locals.isAuthenticated = {}; // isAuthenticated 키값이 되는 걸 넘겨준다는 거야
    // 현재는 로그인이 되었는지 아닌지를 확인해주는거 navbar에서 쓰임
    return next();
  }

  try {
    const decoded = jwt.verify(token, secretKey.key);
    req.userInfo = {
      _id: decoded._id,
      username: decoded.username,
    };
    res.locals.isAuthenticated = { username: decoded.username };
    return next();
  } catch (error) {
    res.status(500).send("jwt error!");
  }
};

module.exports = jwtMiddleware;
