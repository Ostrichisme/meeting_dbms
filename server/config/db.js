import mysql from "mysql";
import {promisify} from 'util';
export const pool  = mysql.createPool({
  host            : 'localhost',
  user            : 'root',
  password        : '123456',
  database:"meeting_db"
});
export const promiseQuery = promisify(pool.query).bind(pool);
export const promisePoolEnd = promisify(pool.end).bind(pool);
