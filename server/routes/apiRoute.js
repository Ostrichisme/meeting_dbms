import {promiseQuery,promisePoolEnd} from "../config/db";

module.exports = (app) => {
  app.post('/api/query',  async(req, res) => {
      const records=await promiseQuery(req.body.query);
      res.send(records);
  });
};