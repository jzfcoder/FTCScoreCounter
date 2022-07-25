const express = require('express');
const app = express();
const path = require('path');

const PORT = process.env.PORT || 8080;

if(process.env.NODE_ENV === "production") {
    app.use(express.static('../astro_client/build'));
    app.get('*', (req, res) => {
        req.sendFile(path.resolve('astro_client/build/index.html', { root: "../" }));
    })
}

app.listen(PORT, console.log(`Server started on port ${PORT}`));

app.get("/", function(req, res) {
    res.sendFile('astro_client/build/index.html', { root: "../" });
});