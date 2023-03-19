const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  //   mode: "production",
  entry: "./src/app.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "docs"),
  },
  plugins: [
    new HtmlWebpackPlugin(), // Generates default index.html
    new HtmlWebpackPlugin({
      // Also generate a test.html
      filename: "test.html",
      template: "src/index.html",
    }),
  ],
};
