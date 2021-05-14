var express = require('express');
var router = express.Router();
const upload = require("../../module/multer");
const postCtr  = require("../../controller/postCtr");
const checkUser = require("../../module/checkUser");

router.get("/upload", checkUser, (req, res) => {
    res.render("upload");
});
// 디테일을 받아오는걸 이미 했는데
// router.get("/:id", (req, res) => {
//     res.render("detail");
// }); 이거로 할 수 있다는 거야
router.get("/:id", postCtr.detail);


// router.get("/update/:id", (req, res) => {
//     res.render("update");
// });
// 업데이트 레이아웃으로 건너가고
router.get("/update/:id", checkUser, postCtr.updateLayout);
// 업데이트를 해보자
// put으로 안하는 이유는  form 에서 지원하는게 post여서 put은 없음
router.post("/update/:id", checkUser, postCtr.update)
// 수정이나 삭제는 본인인지가 중요해
router.post("/delete/:id", checkUser, postCtr.delete)
// 그래서 업로드를 할때 사용자의 이름을 확인 할 필요가 있어



// 이미지 업로드해보자 
// 이미지는 받아와야 하는 거기에 nmulter로 받아와서
// 서버 라우터안에다가 로직을 구현했었는데 그럼 유지보수가 힘들다는 단점이 있음
//  컨트롤러로 만드어서 가자 
router.post("/", checkUser, upload.single("image"), postCtr.upload);

router.post("/like/:id", checkUser, postCtr.like);

router.post("/comment/:id", checkUser, postCtr.comment);



module.exports = router;