import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "" },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
  },
  { timestamps: true },
);

const CategorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    summary: { type: String, default: "" },
    layout: { type: String, enum: ["solo", "split", "trio", "grid", "stack", "reel", "panel"], default: "grid" },
    image: { type: String, default: "" },
    images: [{ type: String }],
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    categorySlug: { type: String, required: true, index: true },
    brand: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    compareAt: { type: Number },
    sku: { type: String, default: "" },
    stock: { type: Number, default: 0, min: 0 },
    active: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    promo: { type: Boolean, default: false },
    summary: { type: String, default: "" },
    description: { type: String, default: "" },
    specs: [{ label: String, value: String }],
    images: [{ type: String }],
  },
  { timestamps: true },
);

const CartItemSchema = new Schema(
  {
    slug: { type: String, required: true },
    qty: { type: Number, required: true, min: 1, max: 99 },
  },
  { _id: false },
);

const CartSchema = new Schema(
  {
    sessionId: { type: String, index: true },
    userId: { type: String, index: true },
    items: [CartItemSchema],
  },
  { timestamps: true },
);

const OrderItemSchema = new Schema(
  {
    slug: String,
    name: String,
    qty: Number,
    price: Number,
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    number: { type: String, required: true, unique: true },
    userId: { type: String, index: true },
    name: String,
    email: { type: String, index: true },
    phone: String,
    address: String,
    city: String,
    paymentMethod: String,
    paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
    fulfillmentStatus: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    items: [OrderItemSchema],
    subtotal: Number,
    delivery: Number,
    total: Number,
  },
  { timestamps: true },
);

const EventSchema = new Schema(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    type: { type: String, required: true, index: true },
    sessionId: { type: String, index: true },
    userId: { type: String, index: true },
    path: String,
    productSlug: String,
    categorySlug: String,
    orderNumber: String,
    referrer: String,
    campaign: String,
    query: String,
    step: String,
    qty: Number,
    checkoutId: String,
  },
  { timestamps: true },
);
EventSchema.index({ createdAt: 1, type: 1 });

const CheckoutSchema = new Schema(
  {
    _id: { type: String, default: () => crypto.randomUUID() },
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, index: true },
    status: {
      type: String,
      enum: ["cart", "checkout", "auth", "completed", "abandoned"],
      default: "cart",
    },
    items: [CartItemSchema],
    lastStep: { type: String, default: "cart" },
    lastActivityAt: { type: Date, default: Date.now, index: true },
    startedAt: { type: Date, default: Date.now },
    abandonedAt: Date,
    abandonNoted: { type: Boolean, default: false },
    reachedAuth: { type: Boolean, default: false },
    returnedAfterAuth: { type: Boolean, default: false },
    completedOrderNumber: String,
  },
  { timestamps: true },
);

function compile(name: string, schema: Schema) {
  if (mongoose.models[name] && process.env.NODE_ENV !== "production") mongoose.deleteModel(name);
  return mongoose.models[name] || mongoose.model(name, schema);
}

export const UserModel = compile("User", UserSchema);
export const CategoryModel = compile("Category", CategorySchema);
export const ProductModel = compile("Product", ProductSchema);
export const CartModel = compile("Cart", CartSchema);
export const OrderModel = compile("Order", OrderSchema);
export const EventModel = compile("Event", EventSchema);
export const CheckoutModel = compile("Checkout", CheckoutSchema);
