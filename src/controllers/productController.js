const Product = require("../models/product");

exports.newProduct = async (req, res) => {
  try {
    const {
      productName,
      price,
      stock,
      categories,
      brandName,
      sku,
      description,
      bulletPoints,
      mrp,
      size,
      manufacturer,
      madeIn,
      warranty,
      material,
      color,
      modelNo,
      mainImage,
      otherImages,
    } = req.body;

    const missingFields = [];

    if (!productName) missingFields.push("productName");
    if (!price) missingFields.push("price");
    if (!stock) missingFields.push("stock");
    if (!categories) missingFields.push("categories");
    if (!brandName) missingFields.push("brandName");
    if (!sku) missingFields.push("sku");
    if (!description) missingFields.push("description");
    if (!bulletPoints) missingFields.push("bulletPoints");
    if (!mrp) missingFields.push("mrp");
    if (!size) missingFields.push("size");
    if (!manufacturer) missingFields.push("manufacturer");
    if (!madeIn) missingFields.push("madeIn");
    if (!modelNo) missingFields.push("modelNo");
    if (!mainImage) missingFields.push("mainImage");

    if (missingFields.length > 0) {
      return res.status(400).send({
        success: false,
        message: `Please fill the following fields: ${missingFields.join(", ")}`,
      });
    }

    console.log(otherImages);

    const product = await Product.create({
      productName,
      price,
      stock,
      categories: categories.toLowerCase(),
      brandName,
      sku,
      description,
      bulletPoints,
      mrp,
      size,
      manufacturer,
      madeIn,
      warranty,
      material: material.toLowerCase(),
      color: color.toLowerCase(),
      mainImage,
      otherImages,
      modelNo,
    });

    return res.status(201).send({ product, message: "Product added successfully." });
  } catch (error) {
    return res.status(400).send({ error, message: "Something went wrong." });
  }
};

exports.getlatestProducts = async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 }).limit(10);
  return res.status(201).json({
    success: true,
    products,
  });
};

exports.getAllCategories = async (req, res) => {
  const categories = await Product.distinct("categories");
  return res.status(201).json({
    success: true,
    categories,
  });
};

exports.getAdminProducts = async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  return res.status(201).json({
    success: true,
    products,
  });
};

exports.getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const singleProduct = await Product.findById(productId);

    if (!singleProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(201).json({
      success: true,
      singleProduct,
    });
  } catch (error) {
    console.error("Error fetching single product:", error);
    return res.status(400).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by its ID
    let product = await Product.findById(id);

    // If product not found, return 404
    if (!product) {
      return res.status(404).send({ success: false, message: "Product not found." });
    }

    // Extract product details from request body
    const {
      productName,
      price,
      stock,
      categories,
      brandName,
      sku,
      description,
      bulletPoints,
      mrp,
      size,
      manufacturer,
      madeIn,
      warranty,
      material,
      color,
      modelNo,
      mainImage,
      otherImages,
    } = req.body;

    // Check if any updates were made
    const updates = {
      productName,
      price,
      stock,
      categories,
      brandName,
      sku,
      description,
      bulletPoints,
      mrp,
      size,
      manufacturer,
      madeIn,
      warranty,
      material,
      color,
      modelNo,
      mainImage,
      otherImages,
    };

    const isUpdated = Object.values(updates).some((value) => value !== undefined);

    if (!isUpdated) {
      return res.status(201).send({ success: true, message: "No changes were made." });
    }

    // Update product details if provided
    if (productName) product.productName = productName;
    if (price) product.price = price;
    if (stock) product.stock = stock;
    if (categories) product.categories = categories.toLowerCase();
    if (brandName) product.brandName = brandName;
    if (sku) product.sku = sku;
    if (description) product.description = description;
    if (bulletPoints) product.bulletPoints = bulletPoints;
    if (mrp) product.mrp = mrp;
    if (size) product.size = size;
    if (manufacturer) product.manufacturer = manufacturer;
    if (madeIn) product.madeIn = madeIn;
    if (warranty) product.warranty = warranty;
    if (modelNo) product.modelNo = modelNo;
    if (mainImage) product.mainImage = mainImage;
    if (otherImages) product.otherImages = otherImages;
    if (material) product.material = material.toLowerCase();
    if (color) product.color = color.toLowerCase();

    // Save updated product
    product = await product.save();

    return res.status(201).send({ product, message: "Product updated successfully." });
  } catch (error) {
    return res.status(400).send({ error, message: "Something went wrong." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by its ID
    const product = await Product.findById(id);

    // If product not found, return 404
    if (!product) {
      return res.status(404).send({ success: false, message: "Product not found." });
    }

    // Delete the product from the database
    await Product.findByIdAndDelete(id);

    return res.status(201).send({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    return res.status(400).send({ error, message: "Something went wrong." });
  }
};

exports.getAllProducts = async (req, res) => {
  const { search, minPrice, maxPrice, categories, color, material, size, sort } = req.query;

  const page = Number(req.query.page) || 1;
  const limit = 12;
  const skip = (page - 1) * limit;

  const baseQuery = {};

  if (search) {
    baseQuery.$or = [{ productName: { $regex: new RegExp(`.*${search}.*`, "i") } }, { categories: { $regex: new RegExp(`.*${search}.*`, "i") } }];
  }

  if (minPrice && maxPrice) {
    baseQuery.price = {
      $gte: Number(minPrice),
      $lte: Number(maxPrice),
    };
  } else if (minPrice) {
    baseQuery.price = {
      $gte: Number(minPrice),
    };
  } else if (maxPrice) {
    baseQuery.price = {
      $lte: Number(maxPrice),
    };
  }

  if (categories) {
    baseQuery.categories = categories;
  }

  if (color) {
    baseQuery.color = color.toLowerCase();
  }

  if (material) {
    baseQuery.material = material.toLowerCase();
  }

  if (size) {
    baseQuery.size = size;
  }

  try {
    const products = await Product.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    if (!products.length) {
      // If no products found with given filters
      return res.status(201).json({
        success: false,
        products,
        message: "No products match the given filters.",
      });
    }

    const filteredProductCount = await Product.countDocuments(baseQuery);

    const totalPages = Math.ceil(filteredProductCount / limit);

    return res.status(201).json({
      success: true,
      products,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: "Internal server error",
    });
  }
};
