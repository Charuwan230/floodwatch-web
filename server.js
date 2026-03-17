import http from "http";
import fs from "fs";
import path from "path";

const port = process.env.PORT || 3000;
const base = "./dist";

const server = http.createServer((req, res) => {
  let filePath = path.join(base, req.url === "/" ? "index.html" : req.url);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      fs.readFile(path.join(base, "index.html"), (err2, data2) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(data2);
      });
    } else {
      res.writeHead(200);
      res.end(data);
    }
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});