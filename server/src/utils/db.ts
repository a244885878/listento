import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost", // 数据库地址
  user: "root", // 数据库用户名
  password: "a244885878", // 数据库密码
  database: "listenTo", // 数据库名称
});

export default db;
