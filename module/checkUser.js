//  사용자가 확인 되면 할 수 있는 모듈

const checkUser = (req, res, next) => {
  if (!req.userInfo) {
    res.status(400).send("user not login!!");
    return;
  }

  return next();
};

module.exports = checkUser;
