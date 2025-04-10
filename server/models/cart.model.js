// models/cart.model.js
import { Schema, model } from "mongoose";

const CartItemSchema = new Schema({
  productVariantId: {
    type: Schema.Types.ObjectId,
    ref: "ProductVariant",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
  },
  price: {
    type: Number,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const CartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
    },
    sessionId: {
      type: String,
      sparse: true,
    },
    items: [CartItemSchema],
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Either userId or sessionId should be present
CartSchema.pre("save", function (next) {
  if (!this.userId && !this.sessionId) {
    next(new Error("Either userId or sessionId is required"));
  } else {
    // Set expiration date for guest carts (30 days)
    if (this.sessionId && !this.userId && !this.expiresAt) {
      this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    next();
  }
});

// Index for faster queries
CartSchema.index({ userId: 1 });
CartSchema.index({ sessionId: 1 });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for cart expiration

// Methods for cart operations
CartSchema.methods.addItem = async function (
  productVariantId,
  quantity,
  price
) {
  // Check if item exists
  const itemIndex = this.items.findIndex(
    (item) => item.productVariantId.toString() === productVariantId.toString()
  );

  if (itemIndex > -1) {
    // Update existing item
    this.items[itemIndex].quantity += quantity;
    this.items[itemIndex].price = price;
  } else {
    // Add new item
    this.items.push({
      productVariantId,
      quantity,
      price,
    });
  }

  return this.save();
};

CartSchema.methods.updateItem = function (productVariantId, quantity) {
  const itemIndex = this.items.findIndex(
    (item) => item.productVariantId.toString() === productVariantId.toString()
  );

  if (itemIndex > -1) {
    this.items[itemIndex].quantity = quantity;
    return this.save();
  }

  return Promise.reject(new Error("Item not found in cart"));
};

CartSchema.methods.removeItem = function (productVariantId) {
  this.items = this.items.filter(
    (item) => item.productVariantId.toString() !== productVariantId.toString()
  );

  return this.save();
};

CartSchema.methods.clearCart = function () {
  this.items = [];
  return this.save();
};

CartSchema.methods.transferCart = async function (userId) {
  this.userId = userId;
  this.sessionId = null;
  this.expiresAt = null;
  return this.save();
};

// Virtual for cart total
CartSchema.virtual("total").get(function () {
  return this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
});

// Virtual for total items count
CartSchema.virtual("itemCount").get(function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
});

export default model("Cart", CartSchema);
