/**
 * @description server
 * @since 2017-10-30
 * @author jay
 */

require("babel-polyfill");

require("babel-register")({
  presets: [
    [
      "env",
      {
        targets: {
          node: "current"
        }
      }
    ]
  ],
  plugins: ["add-module-exports"]
});

const app = require("./app.js");

require("./spider");

/**
 * start server on port 18080
 */
app.listen(18080, "localhost", () => {
  console.log(" server started, bind port %d", 18080);
});
