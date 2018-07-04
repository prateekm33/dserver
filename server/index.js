const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

require("./middleware")(app);
require("./routes")(app);

app.listen(PORT, () => console.log(`APP LISTENING ON ${PORT}`));
