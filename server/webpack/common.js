const glob = require("glob");
const path = require("path");
const webpack = require("webpack");

const babelLoader = {
  loader: "babel-loader",
  options: {
    babelrc: true
  }
};
const babelLoaderRules = {
  test: /\.jsx?$/,
  include: [path.resolve(__dirname, "..", "static")],
  use: [babelLoader]
};

const setupExternals = () => {
  const externals = ["morgan", "superagent-proxy"];
  const nodeLibraries = ["fs", "net", "tls"];
  externals.push(...nodeLibraries);
  return externals;
};

module.exports = {
  entry: {
    password_recovery: path.resolve(
      __dirname,
      "..",
      "static",
      "password_recovery.js"
    ),
    vendor_password_recovery: path.resolve(
      __dirname,
      "..",
      "static",
      "vendor_password_recovery.js"
    ),
    password_recovery_invalid: path.resolve(
      __dirname,
      "..",
      "static",
      "password_recovery_invalid.js"
    )
  },

  output: {
    filename: "[name].bundle.js"
  },

  module: {
    rules: [babelLoaderRules]
  },

  // externals: setupExternals(),

  resolve: {
    modules: ["node_modules", path.resolve(__dirname, "..", "..")]
  },

  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
    })
  ]
};
