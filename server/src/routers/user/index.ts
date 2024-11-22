import type Router from "koa-router";
import { returnRes, tokenAuth } from "@/routers";
import { Code } from "@/enum";
import type { UserInfo } from "./types";
import db from "@/utils/db";

const moduleName = "/user";

export default function (router: Router) {
  // 获取用户信息
  router.get(`${moduleName}/getUserInfo`, tokenAuth, async (ctx) => {
    const user = ctx.state.user;
    ctx.body = returnRes(Code.Success, { user }, "success");
  });

  // 注册用户
  router.post(`${moduleName}/register`, tokenAuth, async (ctx) => {
    const { username, password } = ctx.request.body as UserInfo;
    if (!username || !password) {
      return (ctx.body = returnRes(Code.Fail, null, "缺少用户名或密码"));
    }
    if (password.length < 6 || password.length > 18) {
      return (ctx.body = returnRes(Code.Fail, null, "密码长度为6-18位"));
    }
    // 查询是否已注册
    const [rows] = await db.query<any[]>(
      "SELECT * FROM `user` WHERE username = ?",
      [username]
    );
    if (rows.length) {
      return (ctx.body = returnRes(Code.Fail, null, "已存在相同名称的用户"));
    }
    await db.query("INSERT INTO user (username, password) VALUES (?, ?)", [
      username,
      password,
    ]);
    ctx.body = returnRes(Code.Success, null, "success");
  });
}
