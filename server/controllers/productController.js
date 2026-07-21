import Product from "../models/Product.js";
import cloudinary from '../data/cloudinary.js';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isMissingValue = (value) => value === undefined || value === null || value === "";

export const uploadMedia = async (req, res) => {
    try {
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).json({ message: "No files uploaded" });
        }

        const uploadedFiles = {};

        // Handle multiple file fields
        for (let key in req.files) {
            const files = Array.isArray(req.files[key]) ? req.files[key] : [req.files[key]];
            uploadedFiles[key] = [];

            for (let file of files) {
                const result = await cloudinary.uploader.upload(file.tempFilePath, {
                    folder: `screensage/${key}`,
                    resource_type: "auto"   // handles images and videos
                });

                uploadedFiles[key].push({
                    url: result.secure_url,
                    public_id: result.public_id,
                    resource_type: result.resource_type
                });
            }
        }

        res.status(200).json({
            message: "Files uploaded successfully",
            files: uploadedFiles
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Failed to upload files" });
    }
}

export const createProduct = async (req, res) => {
    try {
        const body = { ...req.body };

        // Auto-assign next numeric id when missing (highest existing + 1)
        if (isMissingValue(body.id)) {
            const highest = await Product.findOne().sort({ id: -1 }).select("id").lean();
            body.id = (highest?.id ?? 0) + 1;
        } else {
            body.id = Number(body.id);
            if (!Number.isFinite(body.id) || body.id < 1) {
                return res.status(400).json({ message: "Numeric ID must be a positive number." });
            }

            const idTaken = await Product.findOne({ id: body.id }).select("_id").lean();
            if (idTaken) {
                return res.status(409).json({
                    message: `Numeric ID ${body.id} is already in use. Use the next available ID.`,
                });
            }
        }

        const newProduct = new Product(body);

        // Check if there is content in the required fields
        if (isMissingValue(newProduct.slug) ||
            isMissingValue(newProduct.title) || isMissingValue(newProduct.category) ||
            isMissingValue(newProduct.description) || isMissingValue(newProduct.price) ||
            isMissingValue(newProduct.imageCount) || newProduct.hasVideo === undefined ||
            isMissingValue(newProduct.coverImage)) {
            return res.status(400).json({ message: "Please fill in all required fields" });
        }

        // Check if slug format is valid (only lowercase letters, numbers and hyphens)
        if (!slugRegex.test(newProduct.slug)) {
            return res.status(400).json({ message: "Invalid slug format. Please use only lowercase letters, numbers, and hyphens." });
        }

        // Check if the slug already exists in the database
        const existingProduct = await Product.findOne({slug: newProduct.slug});
        if (existingProduct) {
            return res.status(409).json({ message: "Slug is already in use. Please choose a different slug." });
        }

        await newProduct.save();

        res.status(201).json({ message: "Product created successfully", product: newProduct });
    } catch (error) {
        console.error("Error creating product: ", error.message);
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern || {})[0] || "field";
            return res.status(409).json({
                message: `That ${field} is already in use. Please choose a different value.`,
            });
        }
        res.status(500).json({ message: "Failed to create product. Internal server error." });
    }
}

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.status(200).json(products);
    } catch (error) {
        console.error("Error fetching products: ", error.message);
        res.status(500).json({ message: "Failed to fetch products. Internal server error." })
    }
}

export const getProductBySlug = async (req, res) => {
    try {
        const {slug} = req.params;
        const product = await Product.findOne({ slug: slug });

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("Error fetching product by slug: ", error.message);
        res.status(500).json({ message: "Failed to fetch product. Internal server error." });
    }
}

export const updateProduct = async (req, res) => {
    try {
        const {slug} = req.params;
        // Data to use to update
        const updateData = {...req.body}; // Create a copy

        // Prevent changing the internal id
        if (updateData.id !== undefined) {
            delete updateData.id;   // Remove id if someone tries to change it
        }

        if (updateData.slug !== undefined && !slugRegex.test(updateData.slug)) {
            return res.status(400).json({ message: "Invalid slug format. Please use only lowercase letters, numbers, and hyphens." });
        }

        // Check if user is updating the slug and if the new slug is already being used.
        if (updateData.slug && updateData.slug !== slug) {
            const existingProduct = await Product.findOne({ slug: updateData.slug });
            if (existingProduct) {
                return res.status(409).json({ message: "Slug is already in use. Please choose a different slug." });
            }
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { slug: slug },
            updateData,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json({ message: "Product updated successfully.", product: updatedProduct });
    } catch (error) {
        console.error("Error updating product: ", error.message);
        res.status(500).json({ message: "Failed to update product. Internal server error." });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const {slug} = req.params;
        const deletedProduct = await Product.findOneAndDelete({ slug: slug });

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json({ message: "Product deleted successfully." })
    } catch (error) {
        console.error("Error deleting product: ", error.message);
        res.status(500).json({ message: "Failed to delete product. Internal server error." });
    }
}