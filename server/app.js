import express from "express";
import http from "http";
import bodyParser from "body-parser";
import cors from "cors";
const options = {
    Cors: { // Cross-Site request
      origin: true,
      credentials: true
    }
  };
// App Setup
const app = express();
app.use(express.static('public'));
app.use(cors(options.Cors));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
require('./routes/apiRoute')(app);


const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
server.listen(PORT);
console.log('Server listening on:', PORT);

