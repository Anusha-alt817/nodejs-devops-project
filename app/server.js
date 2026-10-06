const express = require("express");

const app = express();

const PORT = process.env.PORT || 3000;
const APP_ENV = process.env.APP_ENV || "development";

app.get("/", (req, res) => {
    res.send(`
        Application Running Successfully

        Application: Node.js
        Environment: ${APP_ENV}
    `);
});

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP"
    });
});

app.listen(PORT, () => {
    console.log(`Node.js application running on port ${PORT}`);
});