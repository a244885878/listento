import "module-alias/register";
import Koa from "koa";
import Router from "koa-router";
import useRouter from "./routers";

const app = new Koa();
const router = new Router();

// 使用路由
useRouter(app, router);

// 启动服务器
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
