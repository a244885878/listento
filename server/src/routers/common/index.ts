import type Router from "koa-router";
import Jwt from "jsonwebtoken";
import { secret, returnRes } from "@/routers";
import { Code } from "@/enum";
import db from "@/utils/db";
import type { LoginParams } from "./types";

// token有效期
const expiresIn = "1h";

export default function (router: Router, jwt: typeof Jwt) {
  // 根路由
  router.get("/", async (ctx) => {
    ctx.body = "Hello Koa with TypeScript!";
  });

  // 登录
  router.post("/login", async (ctx) => {
    const { username, password } = ctx.request.body as LoginParams;
    // 查询用户
    const [rows] = await db.query<any[]>(
      "SELECT * FROM `user` WHERE username = ?",
      [username]
    );
    if (rows[0]?.password === password) {
      const token = jwt.sign(
        { id: rows[0].id, username: rows[0].username },
        secret,
        {
          expiresIn,
        }
      );
      // 更新用户token
      await db.query("UPDATE user SET token = ? WHERE id = ?", [
        token,
        rows[0].id,
      ]);
      ctx.body = returnRes(Code.Success, { token }, "登录成功");
    } else {
      ctx.body = returnRes(Code.Success, null, "用户名或密码错误");
    }
  });
}
