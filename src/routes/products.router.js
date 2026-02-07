import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
// Instanciamos el manager apuntando al archivo en src/data
const productManager = new ProductManager('./src/data/products.json');

router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    // Si viene ?limit=5, recortamos el array
    const limit = req.query.limit;
    if (limit) {
        return res.json(products.slice(0, limit));
    }
    res.json(products);
});

router.get('/:pid', async (req, res) => {
    const pid = parseInt(req.params.pid);
    const product = await productManager.getProductById(pid);
    if (!product) return res.status(404).send({ error: "Producto no encontrado" });
    res.json(product);
});

router.post('/', async (req, res) => {
    const newProduct = await productManager.addProduct(req.body);
    if (typeof newProduct === 'string') {
        return res.status(400).send({ error: newProduct }); // Error de validación
    }
    res.status(201).json(newProduct);
});

router.put('/:pid', async (req, res) => {
    const pid = parseInt(req.params.pid);
    const updatedProduct = await productManager.updateProduct(pid, req.body);
    if (!updatedProduct) return res.status(404).send({ error: "Producto no encontrado" });
    res.json(updatedProduct);
});

router.delete('/:pid', async (req, res) => {
    const pid = parseInt(req.params.pid);
    const deleted = await productManager.deleteProduct(pid);
    if (!deleted) return res.status(404).send({ error: "Producto no encontrado" });
    res.json({ message: "Producto eliminado" });
});

export default router;