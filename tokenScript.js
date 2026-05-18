const jwt = require("jsonwebtoken");
const token = jwt.sign({ id: "123456789012345678901234", role: "ADMIN" }, "pujakartsecret", { expiresIn: "1h" });
console.log(token);
