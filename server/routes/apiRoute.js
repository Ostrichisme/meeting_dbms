import {promiseQuery,promisePoolEnd} from "../config/db.js";

export const api=(app) => {
  app.post('/api/query',  async(req, res) => {
      try {
        const records=await promiseQuery(req.body.query);
        res.send(records);
      }
      catch(e) {
        res.status(400).send(e);
      }
      
  });
};