// utils/seedData.js
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import ProductVariant from "../models/productVariant.model.js";
import ProductImage from "../models/productImage.model.js";
import { hash } from "bcryptjs";

// Configuration
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "Admin123!";

// Check if data exists before seeding
const checkDataExists = async () => {
  const userCount = await User.countDocuments();
  const categoryCount = await Category.countDocuments();
  const productCount = await Product.countDocuments();

  return userCount > 0 && categoryCount > 0 && productCount > 0;
};

// Seed admin user
const seedAdminUser = async () => {
  console.log("Seeding admin user...");

  // Check if admin already exists
  const existingAdmin = await User.findOne({ email: ADMIN_EMAIL });
  if (existingAdmin) {
    console.log("Admin user already exists, skipping...");
    return;
  }

  // Create admin user
  const passwordHash = await hash(ADMIN_PASSWORD, 10);
  const adminUser = new User({
    email: ADMIN_EMAIL,
    fullName: "Admin User",
    passwordHash,
    role: "admin",
    status: "active",
  });

  await adminUser.save();
  console.log("Admin user created successfully");
  return adminUser;
};

// Seed categories
const seedCategories = async () => {
  console.log("Seeding categories...");

  // Main categories
  const mainCategories = [
    {
      name: "Laptops",
      description: "Portable computers for work and play",
      image: "/images/categories/laptops.jpg",
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Desktop Computers",
      description: "Powerful desktop systems for home and office",
      image: "/images/categories/desktops.jpg",
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Components",
      description: "Computer parts and components for upgrades and builds",
      image: "/images/categories/components.jpg",
      isActive: true,
      sortOrder: 3,
    },
    {
      name: "Monitors",
      description: "Displays for computers and gaming",
      image: "/images/categories/monitors.jpg",
      isActive: true,
      sortOrder: 4,
    },
    {
      name: "Accessories",
      description: "Peripherals and accessories for your computer",
      image: "/images/categories/accessories.jpg",
      isActive: true,
      sortOrder: 5,
    },
  ];

  // Create main categories
  const createdCategories = {};

  for (const category of mainCategories) {
    const newCategory = new Category(category);
    await newCategory.save();
    createdCategories[category.name] = newCategory;
  }

  // Subcategories
  const subCategories = [
    {
      name: "Gaming Laptops",
      description: "High-performance laptops designed for gaming",
      parentId: createdCategories["Laptops"]._id,
      image: "/images/categories/gaming-laptops.jpg",
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Business Laptops",
      description: "Reliable laptops for business and productivity",
      parentId: createdCategories["Laptops"]._id,
      image: "/images/categories/business-laptops.jpg",
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Gaming Desktops",
      description: "High-performance desktop computers for gaming",
      parentId: createdCategories["Desktop Computers"]._id,
      image: "/images/categories/gaming-desktops.jpg",
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Workstations",
      description: "Powerful desktops for professional work",
      parentId: createdCategories["Desktop Computers"]._id,
      image: "/images/categories/workstations.jpg",
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "CPUs",
      description: "Processors from Intel and AMD",
      parentId: createdCategories["Components"]._id,
      image: "/images/categories/cpus.jpg",
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Graphics Cards",
      description: "GPUs for gaming and content creation",
      parentId: createdCategories["Components"]._id,
      image: "/images/categories/gpus.jpg",
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Memory (RAM)",
      description: "RAM modules for system upgrades",
      parentId: createdCategories["Components"]._id,
      image: "/images/categories/ram.jpg",
      isActive: true,
      sortOrder: 3,
    },
    {
      name: "Storage",
      description: "SSDs, HDDs, and external storage solutions",
      parentId: createdCategories["Components"]._id,
      image: "/images/categories/storage.jpg",
      isActive: true,
      sortOrder: 4,
    },
  ];

  // Create subcategories
  for (const category of subCategories) {
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

  // Sample products for different categories
  const products = [
    // Gaming Laptops
    {
      name: "TechPro Gaming Laptop",
      brand: "TechPro",
      description:
        "Experience immersive gaming with the TechPro Gaming Laptop. Featuring a powerful 12th Gen Intel Core i7 processor, 16GB DDR4 RAM, and NVIDIA GeForce RTX 3070 graphics, this laptop delivers exceptional performance for all your gaming needs. The 15.6-inch Full HD display with a 165Hz refresh rate ensures smooth gameplay, while the RGB backlit keyboard adds a touch of style. With 1TB NVMe SSD storage, you'll have plenty of space for your games and applications. The advanced cooling system keeps temperatures low during intense gaming sessions, allowing for sustained high performance.",
      shortDescription:
        "High-performance gaming laptop with Intel Core i7, RTX 3070, and 165Hz display",
      basePrice: 1499.99,
      isActive: true,
      isNewProduct: true,
      isBestSeller: true,
      isFeatured: true,
      categoryIds: [
        categories["Gaming Laptops"]._id,
        categories["Laptops"]._id,
      ],
      tags: ["gaming", "laptop", "rtx3070", "intel"],
      variants: [
        {
          name: "Base Model",
          sku: "TGP-GM-BASE",
          attributes: {
            processor: "Intel Core i7-12700H",
            memory: "16GB DDR4",
            storage: "1TB NVMe SSD",
            display: '15.6" FHD 165Hz',
            graphics: "NVIDIA RTX 3070 8GB",
          },
          price: 1499.99,
          salePrice: null,
          inventory: 25,
          isActive: true,
        },
        {
          name: "Pro Model",
          sku: "TGP-GM-PRO",
          attributes: {
            processor: "Intel Core i9-12900H",
            memory: "32GB DDR4",
            storage: "2TB NVMe SSD",
            display: '15.6" QHD 240Hz',
            graphics: "NVIDIA RTX 3080 12GB",
          },
          price: 2199.99,
          salePrice: 1999.99,
          inventory: 15,
          isActive: true,
        },
      ],
      images: [
        {
          imageUrl: "/images/products/gaming-laptop-1.jpg",
          isMain: true,
          alt: "TechPro Gaming Laptop front view",
        },
        {
          imageUrl: "/images/products/gaming-laptop-2.jpg",
          isMain: false,
          alt: "TechPro Gaming Laptop side view",
        },
        {
          imageUrl: "/images/products/gaming-laptop-3.jpg",
          isMain: false,
          alt: "TechPro Gaming Laptop keyboard view",
        },
      ],
    },

    // Business Laptop
    {
      name: "UltraBook Pro",
      brand: "TechPro",
      description:
        "The UltraBook Pro is designed for professionals who need performance, reliability, and portability. Featuring an Intel Core i5 processor, 16GB RAM, and a 512GB SSD, this laptop handles all your business tasks with ease. The 14-inch Full HD IPS display offers excellent color accuracy and viewing angles. With a battery life of up to 14 hours, you can work all day without needing to recharge. The sleek aluminum chassis is both durable and lightweight, making it perfect for professionals on the go. Windows 11 Pro comes pre-installed, along with essential security features to protect your data.",
      shortDescription:
        "Thin and light business laptop with long battery life and robust security features",
      basePrice: 1099.99,
      isActive: true,
      isNewProduct: true,
      isBestSeller: false,
      isFeatured: true,
      categoryIds: [
        categories["Business Laptops"]._id,
        categories["Laptops"]._id,
      ],
      tags: ["business", "laptop", "ultrabook", "intel"],
      variants: [
        {
          name: "Silver",
          sku: "UB-PRO-SIL",
          attributes: {
            processor: "Intel Core i5-1135G7",
            memory: "16GB LPDDR4X",
            storage: "512GB NVMe SSD",
            display: '14" FHD IPS',
            color: "Silver",
          },
          price: 1099.99,
          salePrice: 999.99,
          inventory: 30,
          isActive: true,
        },
        {
          name: "Space Gray",
          sku: "UB-PRO-GRY",
          attributes: {
            processor: "Intel Core i7-1165G7",
            memory: "16GB LPDDR4X",
            storage: "1TB NVMe SSD",
            display: '14" FHD IPS',
            color: "Space Gray",
          },
          price: 1299.99,
          salePrice: null,
          inventory: 20,
          isActive: true,
        },
      ],
      images: [
        {
          imageUrl: "/images/products/business-laptop-1.jpg",
          isMain: true,
          alt: "UltraBook Pro front view",
        },
        {
          imageUrl: "/images/products/business-laptop-2.jpg",
          isMain: false,
          alt: "UltraBook Pro open view",
        },
        {
          imageUrl: "/images/products/business-laptop-3.jpg",
          isMain: false,
          alt: "UltraBook Pro side view",
        },
      ],
    },

    // Graphics Card
    {
      name: "NVIDIA GeForce RTX 4080 Super",
      brand: "NVIDIA",
      description:
        "Elevate your gaming experience with the NVIDIA GeForce RTX 4080 Super graphics card. Built on NVIDIA's Ada Lovelace architecture, this GPU delivers exceptional performance for gaming and content creation. With 16GB of GDDR6X memory and a boost clock of up to 2.5GHz, it handles even the most demanding games at 4K resolution with ray tracing enabled. The card features DLSS 3.0 technology, which uses AI to boost frame rates while maintaining image quality. Advanced cooling solutions ensure optimal performance even during extended gaming sessions. Whether you're a competitive gamer or a content creator, the RTX 4080 Super provides the power you need.",
      shortDescription:
        "High-end graphics card with ray tracing capabilities and AI-enhanced performance",
      basePrice: 899.99,
      isActive: true,
      isNewProduct: true,
      isBestSeller: true,
      isFeatured: true,
      categoryIds: [
        categories["Graphics Cards"]._id,
        categories["Components"]._id,
      ],
      tags: ["gpu", "graphics card", "rtx", "nvidia", "gaming"],
      variants: [
        {
          name: "Founders Edition",
          sku: "RTX4080S-FE",
          attributes: {
            memory: "16GB GDDR6X",
            boostClock: "2.5GHz",
            powerConnector: "16-pin",
            coolerType: "Dual Fan",
          },
          price: 899.99,
          salePrice: null,
          inventory: 10,
          isActive: true,
        },
        {
          name: "OC Edition",
          sku: "RTX4080S-OC",
          attributes: {
            memory: "16GB GDDR6X",
            boostClock: "2.7GHz",
            powerConnector: "16-pin",
            coolerType: "Triple Fan",
          },
          price: 999.99,
          salePrice: 949.99,
          inventory: 5,
          isActive: true,
        },
      ],
      images: [
        {
          imageUrl: "/images/products/gpu-1.jpg",
          isMain: true,
          alt: "NVIDIA GeForce RTX 4080 Super front view",
        },
        {
          imageUrl: "/images/products/gpu-2.jpg",
          isMain: false,
          alt: "NVIDIA GeForce RTX 4080 Super angle view",
        },
        {
          imageUrl: "/images/products/gpu-3.jpg",
          isMain: false,
          alt: "NVIDIA GeForce RTX 4080 Super back view",
        },
      ],
    },

    // Monitor
    {
      name: "UltraWide Gaming Monitor",
      brand: "DisplayTech",
      description:
        "Immerse yourself in your games and content with the DisplayTech UltraWide Gaming Monitor. This 34-inch curved ultrawide monitor features a WQHD resolution (3440x1440) and a 144Hz refresh rate for smooth, detailed visuals. The 1ms response time and AMD FreeSync Premium technology eliminate screen tearing and stuttering, providing a competitive edge in fast-paced games. The monitor's 21:9 aspect ratio gives you more horizontal screen space, perfect for both gaming and productivity. With 95% DCI-P3 color coverage, HDR400 support, and excellent viewing angles, it delivers vibrant, accurate colors and contrast. The sleek design with thin bezels and adjustable stand complements any setup.",
      shortDescription:
        "34-inch curved ultrawide gaming monitor with WQHD resolution and 144Hz refresh rate",
      basePrice: 499.99,
      isActive: true,
      isNewProduct: false,
      isBestSeller: true,
      isFeatured: true,
      categoryIds: [categories["Monitors"]._id],
      tags: ["monitor", "ultrawide", "gaming", "curved", "144hz"],
      variants: [
        {
          name: "Standard",
          sku: "UW-GM-STD",
          attributes: {
            size: '34"',
            resolution: "3440x1440",
            refreshRate: "144Hz",
            panelType: "VA",
            connectivity: "DisplayPort 1.4, HDMI 2.0",
          },
          price: 499.99,
          salePrice: 449.99,
          inventory: 15,
          isActive: true,
        },
        {
          name: "Premium",
          sku: "UW-GM-PRM",
          attributes: {
            size: '34"',
            resolution: "3440x1440",
            refreshRate: "165Hz",
            panelType: "IPS",
            connectivity: "DisplayPort 1.4, HDMI 2.1",
          },
          price: 599.99,
          salePrice: null,
          inventory: 8,
          isActive: true,
        },
      ],
      images: [
        {
          imageUrl: "/images/products/monitor-1.jpg",
          isMain: true,
          alt: "UltraWide Gaming Monitor front view",
        },
        {
          imageUrl: "/images/products/monitor-2.jpg",
          isMain: false,
          alt: "UltraWide Gaming Monitor side view",
        },
        {
          imageUrl: "/images/products/monitor-3.jpg",
          isMain: false,
          alt: "UltraWide Gaming Monitor rear view",
        },
      ],
    },

    // RAM
    {
      name: "HyperSpeed DDR5 RAM",
      brand: "MemoryTech",
      description:
        "Upgrade your system's performance with MemoryTech HyperSpeed DDR5 RAM. This high-performance memory module offers blazing-fast speeds up to 6000MHz, providing the bandwidth needed for demanding applications and games. With advanced XMP 3.0 support, you can easily set up and optimize your memory for your specific system. The efficient heat spreader design keeps temperatures low, ensuring stable performance even during intensive tasks. Compatible with the latest Intel and AMD platforms, this memory module is the perfect upgrade for enthusiasts and professionals looking to maximize their system's capabilities.",
      shortDescription:
        "High-performance DDR5 RAM with 6000MHz speed and advanced heat dissipation",
      basePrice: 189.99,
      isActive: true,
      isNewProduct: true,
      isBestSeller: false,
      isFeatured: false,
      categoryIds: [
        categories["Memory (RAM)"]._id,
        categories["Components"]._id,
      ],
      tags: ["ram", "memory", "ddr5", "pc component"],
      variants: [
        {
          name: "16GB Kit (2x8GB)",
          sku: "HS-DDR5-16",
          attributes: {
            capacity: "16GB (2x8GB)",
            speed: "6000MHz",
            timing: "CL36",
            voltage: "1.35V",
          },
          price: 189.99,
          salePrice: null,
          inventory: 50,
          isActive: true,
        },
        {
          name: "32GB Kit (2x16GB)",
          sku: "HS-DDR5-32",
          attributes: {
            capacity: "32GB (2x16GB)",
            speed: "6000MHz",
            timing: "CL36",
            voltage: "1.35V",
          },
          price: 329.99,
          salePrice: 299.99,
          inventory: 30,
          isActive: true,
        },
      ],
      images: [
        {
          imageUrl: "/images/products/ram-1.jpg",
          isMain: true,
          alt: "HyperSpeed DDR5 RAM front view",
        },
        {
          imageUrl: "/images/products/ram-2.jpg",
          isMain: false,
          alt: "HyperSpeed DDR5 RAM angle view",
        },
        {
          imageUrl: "/images/products/ram-3.jpg",
          isMain: false,
          alt: "HyperSpeed DDR5 RAM installed view",
        },
      ],
    },
  ];

  // Create products, variants, and images
  for (const product of products) {
    // Extract variants and images
    const { variants, images, categoryIds, tags, ...productData } = product;

    // Create product
    const newProduct = new Product({
      ...productData,
      categories: categoryIds,
      tags,
    });
    await newProduct.save();

    // Create variants
    for (const variant of variants) {
      const newVariant = new ProductVariant({
        ...variant,
        productId: newProduct._id,
      });
      await newVariant.save();
    }

    // Create images
    for (const image of images) {
      const newImage = new ProductImage({
        ...image,
        productId: newProduct._id,
      });
      await newImage.save();
    }
  }

  console.log("Products created successfully");
};

// Main seeding function
export const seedDatabase = async () => {
  try {
    console.log("Checking if database needs seeding...");

    // Check if data already exists
    const dataExists = await checkDataExists();

    if (dataExists) {
      console.log("Database already contains data, skipping seeding");
      return;
    }

    console.log("Starting database seeding...");

    // Seed admin user
    await seedAdminUser();

    // Seed categories
    const categories = await seedCategories();

    // Seed products
    await seedProducts(categories);

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

export default seedDatabase;
