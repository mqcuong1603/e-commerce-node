const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: "./src/js/main.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "js/bundle.js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
        generator: {
          filename: "images/[name][ext]",
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/pages/index.html",
      filename: "index.html",
      chunks: ["main"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/products.html",
      filename: "products.html",
      chunks: ["main"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/product-detail.html",
      filename: "product-detail.html",
      chunks: ["main"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/cart.html",
      filename: "cart.html",
      chunks: ["main"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/checkout.html",
      filename: "checkout.html",
      chunks: ["main"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/login.html",
      filename: "login.html",
      chunks: ["main"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/register.html",
      filename: "register.html",
      chunks: ["main"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/profile.html",
      filename: "profile.html",
      chunks: ["main"],
    }),
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "public", to: "" }],
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: "src/images", to: "images" },
        // { from: 'src/fonts', to: 'fonts' }
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    compress: true,
    port: 8080,
    hot: true,
    open: true,
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
};
