import express from "express";
import { getAllProducts, getProductBySlug, createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

//POST - /api/v1/products - create product - PRIVATE
router.post("/", authMiddleware, adminMiddleware, createProduct);

//GET - /api/v1/products - get all products - PUBLIC
router.get("/", getAllProducts);

//GET - /api/v1/products/:slug - get product by slug - PUBLIC
router.get("/:slug", getProductBySlug);

//PUT - /api/v1/products/:slug - update product by slug - PRIVATE
router.put("/:slug", authMiddleware, adminMiddleware, updateProduct);

//DELETE - /api/v1/products/:slug - delete product by slug - PRIVATE
router.delete("/:slug", authMiddleware, adminMiddleware, deleteProduct);

export default router;