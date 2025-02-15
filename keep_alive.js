const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("Bot đang chạy!");
});

app.listen(3000, () => {
    console.log("✅ Keep-alive server đang hoạt động!");
});