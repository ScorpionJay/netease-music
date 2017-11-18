/**
 * kao app
 */

const Koa = require("koa");
const http = require("http");
const route = require("koa-route");
const app = new Koa();

app.use(
  route.get("/test", async ctx => {
    console.log("~~~test koa web~~~");
    let data = "hello jay!!!";
    ctx.body = data;
  })
);

export default app;
