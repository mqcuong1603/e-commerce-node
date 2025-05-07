import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import User from "../models/user.model.js";
import Address from "../models/address.model.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";
import ProductImage from "../models/productImage.model.js";
import Review from "../models/review.model.js";
import { hash } from "bcryptjs";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to JSON data directory
const DATA_DIR = path.join(__dirname, "../data");

// Check if data exists before seeding
const checkDataExists = async () => {
  const userCount = await User.countDocuments();
  const categoryCount = await Category.countDocuments();
  const productCount = await Product.countDocuments();
  const addressCount = await Address.countDocuments();

  return (
    userCount > 0 && categoryCount > 0 && productCount > 0 && addressCount > 0
  );
};

// Read JSON file helper
const readJsonFile = (filename) => {
  try {
    const filePath = path.join(DATA_DIR, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
};

// Seed users
const seedUsers = async () => {
  console.log("Seeding users...");

  const usersData = readJsonFile("users.json");
  if (!usersData) return null;

  const createdUsers = {};

  for (const userData of usersData) {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      console.log(`User ${userData.email} already exists, skipping...`);
      createdUsers[userData.email] = existingUser;
      continue;
    }

    // Create new user - NOTE: Set the passwordHash field, not password
    const user = new User({
      email: userData.email,
      fullName: userData.fullName,
      passwordHash: userData.password, // This will trigger the pre-save hook
      role: userData.role || "customer",
      status: userData.status || "active",
      loyaltyPoints: userData.loyaltyPoints || 0,
    });

    await user.save(); // The pre-save hook will hash the password
    createdUsers[userData.email] = user;
    console.log(`User ${userData.email} created successfully`);
  }

  console.log("Users created successfully");
  return createdUsers;
};

// Seed addresses
const seedAddresses = async (users) => {
  console.log("Seeding addresses...");

  const addressesData = readJsonFile("addresses.json");
  if (!addressesData) return;

  for (const addressData of addressesData) {
    // Map user email to ID
    if (addressData.userEmail && users[addressData.userEmail]) {
      addressData.userId = users[addressData.userEmail]._id;
    } else {
      console.log(`User ${addressData.userEmail} not found, skipping address`);
      continue;
    }
    delete addressData.userEmail; // Remove the helper field

    try {
      // Create the address
      const address = new Address(addressData);
      await address.save();
      console.log(`Address created for user ${addressData.fullName}`);
    } catch (error) {
      console.error(`Error creating address: ${error.message}`);
    }
  }

  console.log("Addresses created successfully");
};

// Seed categories
const seedCategories = async () => {
  console.log("Seeding categories...");

  const categoriesData = readJsonFile("categories.json");
  if (!categoriesData) return null;

  const createdCategories = {};

  // Create main categories first
  const mainCategories = categoriesData.filter((cat) => !cat.parentId);
  for (const category of mainCategories) {
    const newCategory = new Category(category);
    await newCategory.save();
    createdCategories[category.name] = newCategory;
  }

  // Then create subcategories (which need parent IDs)
  const subCategories = categoriesData.filter((cat) => cat.parentId);
  for (const category of subCategories) {
    // Replace parent name with parent ID
    const parentName = category.parentName;
    if (parentName && createdCategories[parentName]) {
      category.parentId = createdCategories[parentName]._id;
    }
    delete category.parentName; // Remove the helper field

    const newCategory = new Category(category);
    await newCategory.save();
    createdCategories[category.name] = newCategory;
  }

  console.log("Categories created successfully");
  return createdCategories;
};

// Seed products
const seedProducts = async (categories) => {
  console.log("Seeding products...");

  const productsData = readJsonFile("products.json");
  if (!productsData) return null;

  const createdProducts = {};

  for (const product of productsData) {
    // Map category names to IDs
    if (product.categoryNames && Array.isArray(product.categoryNames)) {
      product.categories = product.categoryNames
        .map((name) => (categories[name] ? categories[name]._id : null))
        .filter((id) => id !== null);
    }
    delete product.categoryNames; // Remove the helper field

    // Extract variants and images before creating the product
    const { variants, images, ...productData } = product;

    // Create product
    const newProduct = new Product(productData);
    await newProduct.save();
    createdProducts[product.name.toLowerCase()] = newProduct;

    // Create variants
    if (variants && Array.isArray(variants)) {
      for (const variant of variants) {
        const newVariant = new ProductVariant({
          ...variant,
          productId: newProduct._id,
        });
        await newVariant.save();
      }
    }

    // Create images
    if (images && Array.isArray(images)) {
      for (const image of images) {
        const newImage = new ProductImage({
          ...image,
          productId: newProduct._id,
        });
        await newImage.save();
      }
    }
  }

  console.log("Products created successfully");
  return createdProducts;
};

// Seed reviews
const seedReviews = async (products, users) => {
  console.log("Seeding reviews...");

  const reviewsData = readJsonFile("reviews.json");
  if (!reviewsData) return;

  // Log product and user mappings for debugging
  console.log("Product mapping for reviews:", Object.keys(products));
  console.log("User mapping for reviews:", Object.keys(users));

  for (const reviewData of reviewsData) {
    // Map product name to ID
    if (
      reviewData.productName &&
      products[reviewData.productName.toLowerCase()]
    ) {
      reviewData.productId = products[reviewData.productName.toLowerCase()]._id;
      delete reviewData.productName;
    } else {
      console.log(
        `Product ${reviewData.productName} not found, skipping review`
      );
      continue;
    }

    // Map user email to ID (if not a guest review)
    if (reviewData.userEmail && reviewData.userEmail !== "guest@example.com") {
      if (users[reviewData.userEmail]) {
        reviewData.userId = users[reviewData.userEmail]._id;
      } else {
        console.log(
          `User ${reviewData.userEmail} not found, creating as guest review`
        );
        // Leave userId as null for guest reviews
      }
    }
    delete reviewData.userEmail; // Remove the helper field

    try {
      // Create the review
      const review = new Review(reviewData);
      await review.save();
      console.log(
        `Review created for product ${reviewData.productId} by ${reviewData.userName}`
      );

      // Update product's average rating
      const product = await Product.findById(reviewData.productId);
      if (product) {
        await product.updateRating();
      }
    } catch (error) {
      console.error(`Error creating review: ${error.message}`);
    }
  }

  console.log("Reviews created successfully");
};

// Main seeding function
export const seedDatabaseFromJson = async () => {
  try {
    console.log("Checking if database needs seeding...");

    // Check if data already exists
    const dataExists = await checkDataExists();
    if (dataExists) {
      console.log("Database already contains data, skipping seeding");
      return;
    }

    console.log("Starting database seeding from JSON files...");

    // Seed users first
    const users = await seedUsers();

    // Seed addresses (depends on users)
    await seedAddresses(users);

    // Seed categories
    const categories = await seedCategories();

    // Seed products
    const products = await seedProducts(categories);

    // Seed reviews last (as they depend on users and products)
    await seedReviews(products, users);

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

export default seedDatabaseFromJson;
