import Product from "../models/Product.js";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isMissingValue = (value) => value === undefined || value === null || value === "";

export const createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);

        // Check if there is conent in the required fields
        if (isMissingValue(newProduct.id) || isMissingValue(newProduct.slug) || isMissingValue(newProduct.title) || isMissingValue(newProduct.category) || isMissingValue(newProduct.description) || isMissingValue(newProduct.price) || isMissingValue(newProduct.imageCount) || newProduct.hasVideo === undefined || isMissingValue(newProduct.coverImage)) {
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