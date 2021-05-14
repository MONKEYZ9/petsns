const multer = require("multer");
const multerS3 = require("multer-s3");
const aws = require("aws-sdk");
aws.config.loadFromPath(__dirname + "/../config/s3Info.json");

const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "aac-lsm",
    acl: "public-read-write", // 권한임 
    key: (req, file, cb) => {
      cb(null, Date.now() + "." + file.originalname.split(".").pop());
      // null 은 에러값
      // 해당 파일 이름은 다른 파일이랑 구분되어야 해서 날짜 + 원래 뒤에 붙어있는 파일 확장자명을 지우고 생성
    },
  }),
});

module.exports = upload;
