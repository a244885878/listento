import bodyParser from "koa-bodyparser";
import type Koa from "koa";
import type Router from "koa-router";
import koaJwt from "koa-jwt";
import jwt from "jsonwebtoken";
import common from "./common";
import user from "./user";
import { Code } from "@/enum";
import db from "@/utils/db";

const secret = "jwt-key";
const tokenKey = "x-access-token";

const useRouter = (app: Koa, router: Router) => {
  // 使用 bodyparser 中间件
  app.use(bodyParser());

  // 使用 koa-jwt 中间件
  app.use(
    koaJwt({
      secret,
      // 从自定义的 header 中获取 token
      getToken: (ctx) => {
        return ctx.headers[tokenKey] as string | null;
      },
    }).unless({ path: [/^\/login/] })
  );

  // 全局错误处理的中间件
  app.use(async (ctx, next) => {
    try {
      // 执行下一个中间件
      await next();
    } catch (err: any) {
      // 统一处理错误
      console.error(err);
      ctx.body = returnRes(Code.Error, err.message, "未知异常");
    }
  });

  // 路由配置
  common(router, jwt);
  user(router);

  // 使用路由
  app.use(router.routes()).use(router.allowedMethods());
};

// 公共返回数据
const returnRes = (code: number, data: any, message: string) => {
  return {
    code,
    data,
    message,
  };
};

// 根据token获取用户(校验用户token唯一性)
const byTokenGetUser = async (ctx: Koa.Context) => {
  const token = ctx.request.header[tokenKey] as string;
  const { id } = jwt.verify(token, secret) as { id: number };
  if (id) {
    // 查询该用户
    const [rows] = await db.query<any[]>("SELECT * FROM `user` WHERE id = ?", [
      id,
    ]);
    if (rows[0]?.token === token) {
      return { id: rows[0].id, username: rows[0].username };
    } else {
      return null;
    }
  } else {
    return null;
  }
};

// token校验中间件
const tokenAuth = async (ctx: Koa.Context, next: Koa.Next) => {
  const user = await byTokenGetUser(ctx);
  if (user) {
    ctx.state.user = user;
    await next();
  } else {
    ctx.status = Code.NoAccess;
    ctx.body = returnRes(Code.NoAccess, null, "token失效");
  }
};

export { secret, tokenKey, returnRes, byTokenGetUser, tokenAuth };

export default useRouter;
