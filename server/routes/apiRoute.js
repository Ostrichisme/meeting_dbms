import {promiseQuery,promisePoolEnd} from "../config/db.js";

export const api=(app) => {
  app.post('/api/query',  async(req, res) => {
      const records=await promiseQuery(req.body.query);
      res.send(records);
  });
};