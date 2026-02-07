import fs from 'fs';

class ProductManager {
    constructor(path) {
        this.path = path;
    }

    async getProducts() {
        try {
            if (fs.existsSync(this.path)) {
                const data = await fs.promises.readFile(this.path, 'utf-8');
                return JSON.parse(data);
            }
            return [];
        } catch (error) {
            return [];
        }
    }

    async addProduct(product) {
        try {
            const products = await this.getProducts();
            
            // Validación básica
            if (!product.title || !product.description || !product.code || !product.price || !product.stock || !product.category) {
                return "Todos los campos son obligatorios";
            }

            // Validar código único
            if (products.some(p => p.code === product.code)) {
                return "El código del producto ya existe";
            }

            const newProduct = {
                id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
                title: product.title,
                description: product.description,
                code: product.code,
                price: product.price,
                status: true, // Default true
                stock: product.stock,
                category: product.category,
                thumbnails: product.thumbnails || []
            };

            products.push(newProduct);
            await fs.promises.writeFile(this.path, JSON.stringify(products, null, '\t'));
            return newProduct;
        } catch (error) {
            console.log(error);
        }
    }

    async getProductById(id) {
        const products = await this.getProducts();
        const product = products.find(p => p.id === id);
        return product || null;
    }

    async updateProduct(id, updatedFields) {
        const products = await this.getProducts();
        const index = products.findIndex(p => p.id === id);

        if (index === -1) return null;

        // Mantenemos el ID original
        const updatedProduct = { ...products[index], ...updatedFields, id };
        products[index] = updatedProduct;

        await fs.promises.writeFile(this.path, JSON.stringify(products, null, '\t'));
        return updatedProduct;
    }

    async deleteProduct(id) {
        const products = await this.getProducts();
        const newProducts = products.filter(p => p.id !== id);

        if (products.length === newProducts.length) return false;

        await fs.promises.writeFile(this.path, JSON.stringify(newProducts, null, '\t'));
        return true;
    }
}

export default ProductManager;