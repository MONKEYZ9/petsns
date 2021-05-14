// 게시물 관련 로직을 만드는 것이니까 스키마를 불러와야 해
const Post = require("../model/post");

const formatDate = (date) => {
  let d = new Date(date); // 날짜 받고
  let month = "" + (d.getMonth() + 1); // 해당 날짜의 월 getMonth가 현재가 3월이면 2를 가져오기에 1을 더해야함
  let day = "" + d.getDate(); // 해당 날짜의 일
  let year = d.getFullYear(); // 해당 날짜의 연
  // 월 일이 2글자보다 적으면 01 이런식으로 될 수 있게 끔
  if (month.length < 2) {
    month = "0" + month;
  }
  if (day.length < 2) {
    day = "0" + month;
  }
  // 가운데 - 가 들어가게끔 하는게 join
  return [year, month, day].join("-");
};

const postCtr = {
  // 업로드 관련 로직
  upload: async (req, res) => {
    // 바디 값으로 비구조화 할당으로 한 타이틀과 컨텐츠를 들고 오고
    const { title, content } = req.body;
    // console.log(image1); // 
    // 이미지를 불러와야 해
    // const image1 = req.file; // 이렇게 하면 어떻게 오는지 확인해보자 {
    //   fieldname: 'image',
    //   originalname: '1.PNG',
    //   encoding: '7bit',
    //   mimetype: 'image/png',
    //   size: 6962,
    //   bucket: 'aac-lsm',
    //   key: '1620695746050.PNG',  하면 이런식으로 오게 되어있음
    const image = req.file.location;
    const publishedDate = formatDate(new Date()); // 원하는 날짜가 나오지 않기때문에
    // yyyy-mm-dd형식으로 따로 만들어 줘야 해 위에서 만들자
    // 위에 스키마를 불러오자
    const post = new Post({
      title: title,
      content: content,
      image: image,
      publishedDate: publishedDate,
      // post 스키마를 보면 유저 정보가 있는데 이건 유저 정보를 정리하고 나서 보도록 하겠다 => 이건 checkUSer 만든다음
      user: req.userInfo, // 작성자를 추가해야해
    });

    try {
      await post.save();
      res.redirect("/");
    } catch (error) {
      res.status(500).send("upload error!!");
    }
  },
  list: async (req, res) => {
    // Post 중에서 전체 게시물을 가져울거임
    const posts = await Post.find({});
    // 이걸 index로 넘겨줄거임
    res.render("index", { postList: posts });
  },
  detail: async (req, res) => {
    // ejs를 보면 타이틀을 눌렀을때 아이디 값을 바탕으로 보여지게끔 해놨어
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render("detail", { post: post });
  },
  updateLayout: async (req, res) => {
    // 업데이트 페이지에 데이터를 전송할 수 있는 걸 해야 한다는 거야
    const { id } = req.params;
    const post = await Post.findById(id);
    res.render("update", { post: post });
  },
  update: async (req, res) => {
    // 레이아웃으로 갔으니 수정하면
    const { id } = req.params; // 아이디 받아오고
    const { title, content } = req.body; // 타이틀이랑 내용 받고
    try {
      await Post.findByIdAndUpdate( // 포스트 스키마의 아이디로 업뎃한다는 걸 하고
        id, // 아이디
        { title: title, content: content }, // 제목이랑 내용 각각 들어가고
        { new: true } // 새로운 업데이트 된 것이 반영되게 해주는거야
      );
      res.redirect("/"); // 정상적으로 되었다면 리다이렉해서 돌아가게끔
    } catch (error) {
      res.status(500).send("update error!!"); // 에러나면 여기로
    }
  },
  delete: async (req, res) => {
    // 지우는것도 업뎃이랑 같음
    const { id } = req.params;
    try {
      await Post.findByIdAndDelete(id);
      res.redirect("/");
    } catch (error) {
      res.status(500).send("delete error!!");
    }
  },
  like: async (req, res) => {
    // 좋아요 아이들 파람쓰로 받아와서
    const { id } = req.params;
    const post = await Post.findById(id);
    // 해당 유저가 좋아요를 눌렀는지 안눌렀는지 확인하는거
    // some은 likeUser안에서 req.userInfo._id와 동일한거를 확인하면 true를 반환하게 됨
    const check = post.likeUser.some((userId) => {
      return userId === req.userInfo._id;
    });
    // 체크가 있다면 좋아요를 누른거지
    if (check) {
      // 1을 빼줘
      post.likeCount -= 1;
      // 배열형태에서 인덱스를 찾게 되고 배열형태에서 위치를 찾게 된다
      const idx = post.likeUser.indexOf(req.userInfo._id);
      if (idx > -1) { // 해당 유저가 있다는 걸 의미하기에 0부터 시작기에 없으면 -1부터 시작해
        post.likeUser.splice(idx, 1); // 해당 유저를 삭제해줄 수 있어
      }
    } else {
      post.likeCount += 1;
      post.likeUser.push(req.userInfo._id); // 배열형태안에 밀어넣어줄거임
    }
    // 수정한 값을 저장해야해
    const result = await post.save();
    res.status(200).json({ // ajax로 연결통신을 하고 있으니까 그래서 json으로 통신을 해야해
      check: check,
      post: result,
    });
  },
  comment: async (req, res) => {
    // 댓글 적는거
    const { id } = req.params; // 아이디를 비구조화할당으로 받아오고
    const post = await Post.findById(id); // 아이디에 맞게 post를 가져오고
    const user = req.userInfo; // 유저 정보 같은경우에는 유저인포를 저장하고
    const { comment } = req.body;
    const commnetWrap = {
      comment: comment,
      user: user,
    };
    // 이걸 스키마 comment 안에 넣겠다는거야
    post.comment.push(commnetWrap);
    const result = await post.save();
    res.status(200).json({ post: result }); // 그리고 ajax로 통신했으니까 이걸 보내줘야 한다는거야
  },
};

module.exports = postCtr;
