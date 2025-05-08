// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const webpack = require("webpack");

module.exports = (env, argv) => {
  const isProduction = argv.mode === "production";

  return {
    entry: "./src/js/main.js",
    output: {
      path: path.resolve(__dirname, "build"),
      filename: "js/bundle.js",
      clean: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, "css-loader"],
        },
        {
          // Add SCSS/SASS support
          test: /\.(scss|sass)$/,
          use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
        },
        {
          test: /\.(png|svg|jpg|jpeg|gif)$/i,
          type: "asset/resource",
          generator: {
            filename: "images/[name][ext]",
          },
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/i,
          type: "asset/resource",
          generator: {
            filename: "fonts/[name][ext]",
          },
        },
      ],
    },
    plugins: [
      // Add environment variables
      new webpack.DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify(argv.mode),
      }),
      // Generate HTML files from templates
      new HtmlWebpackPlugin({
        template: "./src/pages/index.html",
        filename: "index.html",
      }),
      // Add additional HtmlWebpackPlugin instances for other pages if needed
      new HtmlWebpackPlugin({
        template: "./src/pages/cart.html",
        filename: "cart.html",
      }),
      new HtmlWebpackPlugin({
        template: "./src/pages/checkout.html",
        filename: "checkout.html",
      }),
      new HtmlWebpackPlugin({
        template: "./src/pages/login.html",
        filename: "login.html",
      }),
      new HtmlWebpackPlugin({
        template: "./src/pages/product-detail.html",
        filename: "product-detail.html",
      }),
      new HtmlWebpackPlugin({
        template: "./src/pages/products.html",
        filename: "products.html",
      }),
      new HtmlWebpackPlugin({
        template: "./src/pages/profile.html",
        filename: "profile.html",
      }),
      new HtmlWebpackPlugin({
        template: "./src/pages/register.html",
        filename: "register.html",
      }),

      new MiniCssExtractPlugin({
        filename: "css/[name].css",
      }),

      // Copy images
      new CopyWebpackPlugin({
        patterns: [
          {
            from: "src/images",
            to: "images",
            noErrorOnMissing: true, // This prevents errors if the directory is empty
          },
          // Copy components
          {
            from: "src/components",
            to: "components",
            noErrorOnMissing: true,
          },
        ],
      }),
    ],
    devServer: {
      static: {
        directory: path.join(__dirname, "build"),
      },
      compress: true,
      port: 9000,
      hot: true,
    },
  };
};
