/**
 * 爬取网易云音乐评论
 */

const fs = require("fs");
const request = require("request");
const cheerio = require("cheerio");
const CryptoJS = require("crypto-js");
const mongoose = require("mongoose");

mongoose.connect("mongodb://jay:jay@localhost:27017/admin", {
  useMongoClient: true
});
let db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("we're connected!");
});

let Schema = mongoose.Schema;
let comment = new Schema({
  songId: String,
  comments: [{ content: String }]
});

let Comment = mongoose.model("Comment", comment);

// 加密的几个参数
let second_param = "010001";
let third_param =
  "00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7";
let forth_param = "0CoJUm6Qyw8W8jud";
let encSecKey =
  "8d0425f9a30a2a2cec9ea30d1f40e8063ddefe8f7710fd8de7098461eabe5414f33320fcf9c0259564a9dcbb5a2ab2d0cae9e731400d230e01238f94878e416663d014f370f8bfb2596f0ea100c4295616b2edf8e97d60d959dc5ac3326459937fd9cf4979a05b2f00313b5d1612e905cf023936282e472942ab792df39355a7";

function a(a) {
  var d,
    e,
    b = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    c = "";
  for (d = 0; a > d; d += 1)
    (e = Math.random() * b.length), (e = Math.floor(e)), (c += b.charAt(e));
  return c;
}
function b(a, b) {
  var c = CryptoJS.enc.Utf8.parse(b),
    d = CryptoJS.enc.Utf8.parse("0102030405060708"),
    e = CryptoJS.enc.Utf8.parse(a),
    f = CryptoJS.AES.encrypt(e, c, { iv: d, mode: CryptoJS.mode.CBC });
  return f.toString();
}

function d(d, e, f, g) {
  var h = {},
    // i = a(16);
    i = "7MLszUj0xSlu5weB";
  return (
    (h.encText = b(d, g)),
    (h.encText = b(h.encText, i)),
    (h.encSecKey = encSecKey),
    h
  );
}

const getComment = (id, page) => {
  let p = d(
    JSON.stringify({
      rid: `R_SO_4_${id}`,
      offset: (page - 1) * 100,
      total: "true",
      limit: "100",
      csrf_token: ""
    }),
    second_param,
    third_param,
    forth_param
  );

  request(
    {
      url: `http://music.163.com/weapi/v1/resource/comments/R_SO_4_${id}?csrf_token=`,
      method: "POST",
      form: {
        params: p.encText,
        encSecKey: p.encSecKey
      }
    },
    (error, response, body) => {
      if (!error && response.statusCode == 200) {
        let json = JSON.parse(body);
        let list = [];

        json.comments.map((item, i) => {
          //console.log(`${(page - 1) * 100 + i + 1}  ${item.content}`);
          // let common = new Comment();
          // common.set({ comments: item.content });
          // common.save();
          list.push({ content: item.content });
        });
        Comment.findOneAndUpdate(
          { songId: id },
          { $pushAll: { comments: list } },
          { upsert: true },
          (err, doc) => {
            if (err) {
              console.log(err);
            } else {
              console.log("success");
            }
          }
        );

        // 递归
        if (page * 100 < json.total) {
          getComment(id, page + 1);
        } else {
          console.log("over : " + json.total);
        }
      } else {
        console.log(error);
      }
    }
  );
};

getComment(33941484, 1);
