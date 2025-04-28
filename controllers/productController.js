const Product = require('../models/Product');
const Log = require('../models/Log');
const User = require('../models/User');



// exports.addProduct = async (req, res) => {
//   const { name, price, quantity } = req.body;

//   const product = new Product({
//     name,
//     price,
//     quantity,
//     totalAmount: price * quantity, // if you want to store this
//     user: req.user._id
//   });

//   await product.save();

//   // ✅ Log with full product details (snapshot)
//   const log = new Log({
//     action: 'add',
//     user: req.user._id,
//     product: product._id, // keep reference
//     productSnapshot: {
//       name: product.name,
//       price: product.price,
//       quantity: product.quantity,
//       totalAmount: product.totalAmount
//     }
//   });

//   await log.save();

//   res.status(201).json(product);
// };


exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.user._id });
    if (!product) return res.status(404).send('Product not found');

    // Log with correct product ID and snapshot data
    await Log.create({
      action: 'delete',
      product: product._id, // ✅ This should be ObjectId, not string
      user: req.user._id,
      productSnapshot: {
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        totalAmount: product.totalAmount
      }
   
    });

    await product.deleteOne();

    res.send('Product deleted');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error while deleting product');
  }
};



exports.getMyProducts = async (req, res) => {
  const products = await Product.find({ user: req.user._id });
  const totalAmount = products.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.json({ products, totalAmount });
};

exports.getAllProducts = async (req, res) => {
  const products = await Product.find().populate('user', 'username email');
  res.json(products);
};

exports.getAllUsers = async (req, res) => {
  try {
    // Query users with the role of "user"
    const users = await User.find({ role: 'user' });

    // If no users found
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error while fetching users' });
  }
};


exports.getUserProducts = async (req, res) => {
  const user = await User.findById(req.params.userId);
  const products = await Product.find({ user: user._id });
  res.json(products);
};





exports.addProducadmin = async (req, res) => {
  const { name, price, paidPrice, user } = req.body;

  try {
    // Optional: Ensure only admin can use this route
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    // Ensure required fields
    if (!user || !name || !price || !paidPrice) {
      return res.status(400).json({ error: 'All fields (name, price, paidPrice, user) are required.' });
    }

    const product = new Product({
      name,
      price,
      paidPrice,
      totalAmount: price, // No quantity, so total = price
      user,
      status: 'approved' // Admin adds are instantly approved
    });

    await product.save();

    // Log the "add" action under the target user
    const logAdd = new Log({
      action: 'add',
      user,
      product: product._id,
      productSnapshot: {
        name: product.name,
        price: product.price,
        totalAmount: product.totalAmount
      }
    });

    // Log the "delete" action with paidPrice
    const logDelete = new Log({
      action: 'delete',
      user,
      product: product._id,
      productSnapshot: {
        name: product.name,
        price: product.paidPrice,
        totalAmount: product.totalAmount
      }
    });

    await logAdd.save();
    await logDelete.save();

    res.status(201).json(product);

  } catch (error) {
    console.error('Error adding product by admin:', error);
    res.status(500).json({ error: 'Server error while adding product' });
  }
};




// GET /api/products/getuserproducts/:id

exports.getUserProductsById = async (req, res) => {
  const userId = req.params.id;

  try {
    // Optional: Ensure only admin can use this route
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    const products = await Product.find({ user: userId });

    const totalAmount = products.reduce((sum, item) => sum + item.price * item.quantity, 0);

    res.json({ products, totalAmount });
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({ error: 'Server error while fetching user products' });
  }
};




// controllers/productController.js


// API to delete a product for a specific user
exports.deleteProductadmin = async (req, res) => {
  try {
    const { userId } = req.body;  // Getting userId from the request body
    if (!userId) return res.status(400).send('User ID is required');

    const product = await Product.findOne({ _id: req.params.id, user: userId }); // Using userId from the request body
    if (!product) return res.status(404).send('Product not found');

    // Log with correct product ID and snapshot data
    await Log.create({
      action: 'delete',
      product: product._id, // ✅ This should be ObjectId, not string
      user: userId,
      productSnapshot: {
        name: product.name,
        price: product.price,
        quantity: product.quantity,
        totalAmount: product.totalAmount
      }
    });

    await product.deleteOne();

    res.send('Product deleted');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error while deleting product');
  }
};




// exports.addProduct = async (req, res) => {
//   const { name, price, quantity, paidPrice } = req.body;

//   // Ensure paidPrice is provided if necessary
//   if (!paidPrice) {
//     return res.status(400).json({ message: "Paid Price is required" });
//   }

//   // Create a new product with the provided data, without storing paidPrice
//   const product = new Product({
//     name,
//     price, // Only store price and quantity in the product
//     quantity,
//     totalAmount: price * quantity, // Total amount based on price and quantity
//     user: req.user._id, // Assign product to the logged-in user
//   });

//   try {
//     // Save product to the database
//     await product.save();

//     // Log the "add" action (without paidPrice)
//     const logAdd = new Log({
//       action: 'add',
//       user: req.user._id,
//       product: product._id,
//       productSnapshot: {
//         name: product.name,
//         price: product.price,
//         quantity: product.quantity,
//         totalAmount: product.totalAmount // No paidPrice in this log
//       }
//     });

//     // Log the "delete" action (with paidPrice)
//     const logDelete = new Log({
//       action: 'delete',
//       user: req.user._id,
//       product: product._id,
//       productSnapshot: {
//         name: product.name,
//         price: paidPrice,  // Log paidPrice here for delete action
//         quantity: product.quantity,
//         totalAmount: product.totalAmount
//       }
//     });

//     // Save logs to the database
//     await logAdd.save();
//     await logDelete.save();

//     // Send response back to the client
//     res.status(201).json(product);

//   } catch (error) {
//     console.error("Error while adding product:", error);
//     res.status(500).json({ message: "Failed to add product" });
//   }
// };









exports.addProduct = async (req, res) => {
  const { name, price, paidPrice } = req.body;

  if (!paidPrice) {
    return res.status(400).json({ message: "Paid Price is required" });
  }

  const product = new Product({
    name,
    price,
    paidPrice, // Store for future use, not for logging now
    totalAmount: price, // price without quantity (quantity removed)
    user: req.user._id,
    status: "pending" // Mark as pending until admin approval
  });

  try {
    await product.save();
    res.status(201).json({ message: "Product added, waiting for admin approval", product });
  } catch (error) {
    console.error("Error while adding product:", error);
    res.status(500).json({ message: "Failed to add product" });
  }
};




exports.getAllPendingProducts = async (req, res) => {
  try {
    const pendingProducts = await Product.find({ status: "pending" }).populate('user', 'name email');
    res.status(200).json(pendingProducts);
  } catch (error) {
    console.error("Error fetching all pending products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};


exports.approveProduct = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findById(productId);

    if (!product || product.status !== "pending") {
      return res.status(404).json({ message: "Product not found or already approved" });
    }

    // Optional admin modifications from request body
    const { name, price, paidPrice } = req.body;

    if (name) product.name = name;
    if (price) {
      product.price = price;
      product.totalAmount = price;
    }
    if (paidPrice) product.paidPrice = paidPrice;

    // Approve the product
    product.status = "approved";
    await product.save();

    // Create logs: add, delete, and update (always)
    const logAdd = new Log({
      action: 'add',
      user: product.user,
      product: product._id,
      productSnapshot: {
        name: product.name,
        price: product.price,
        totalAmount: product.totalAmount
      }
    });

    const logDelete = new Log({
      action: 'delete',
      user: product.user,
      product: product._id,
      productSnapshot: {
        name: product.name,
        price: product.paidPrice,
        totalAmount: product.totalAmount
      }
    });

    const logUpdate = new Log({
      action: 'update',
      user: product.user,
      product: product._id,
      productSnapshot: {
        name: product.name,
        price: product.paidPrice,
        totalAmount: product.totalAmount
      }
    });

    // Save all logs
    await Promise.all([
      logAdd.save(),
      logDelete.save(),
      logUpdate.save()
    ]);

    res.status(200).json({ message: "Product approved and logs created" });

  } catch (error) {
    console.error("Error during approval:", error);
    res.status(500).json({ message: "Failed to approve product" });
  }
};





exports.updateProductAdmin = async (req, res) => {
  const { productId } = req.params; // Get product ID from URL params
  const { name, price, paidPrice, user } = req.body;

  try {
    // Optional: Ensure only admin can use this route
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    // Ensure required fields
    if (!user || !name || !price || !paidPrice) {
      return res.status(400).json({ error: 'All fields (name, price, paidPrice, user) are required.' });
    }

    // Fetch the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }

    // Store initial paidPrice for logging purposes
    const initialPaidPrice = product.paidPrice;

    // Update the product's fields
    product.name = name;
    product.price = price;
    product.paidPrice = paidPrice;
    product.totalAmount = price; // Adjust totalAmount logic as needed
    product.user = user;

    // Save the updated product
    await product.save();

    // Create log for the "update" action
    const logUpdate = new Log({
      action: 'update',
      user,
      product: productId,
      productSnapshot: {
        name: product.name,
        price: product.paidPrice,
        totalAmount: product.totalAmount
      }
    });
    await logUpdate.save();

    // Log the "delete" action with the new price (not initialPaidPrice)
    const logDelete = new Log({
      action: 'delete',
      user,
      product: productId,
      productSnapshot: {
        name: product.name,
        price: paidPrice, // Always use the new price for deletion
        totalAmount: product.totalAmount
      }
    });

    await logDelete.save();

    // Log the "add" action with the new price
    const logAdd = new Log({
      action: 'add',
      user,
      product: productId,
      productSnapshot: {
        name: product.name,
        price: price, // New price for addition
        totalAmount: product.totalAmount
      }
    });

    await logAdd.save();

    // Return the updated product
    res.status(200).json(product);

  } catch (error) {
    console.error('Error updating product by admin:', error);
    res.status(500).json({ error: 'Server error while updating product' });
  }
};




exports.updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, price, paidPrice } = req.body;

  if (!paidPrice) {
    return res.status(400).json({ message: "Paid Price is required" });
  }

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update product fields
    product.name = name || product.name;
    product.price = price || product.price;
    product.paidPrice = paidPrice;
    product.totalAmount = price || product.totalAmount;
    product.status = "pending"; // Force re-approval by admin

    await product.save();

    res.status(201).json({
      message: "Product updated successfully, waiting for admin approval",
      product,
    });
  } catch (error) {
    console.error("Error while updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};
