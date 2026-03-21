import { Router } from 'express';
import { cartModel } from '../models/cart.model.js';

const router = Router();

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartModel.create({ products: [] });
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: "Error al crear carrito" });
    }
});

// Listar productos de un carrito (Con Populate)
router.get('/:cid', async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid).populate('products.product');
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });
        res.json(cart.products);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar carrito" });
    }
});

// Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);

        if (productIndex !== -1) {
            cart.products[productIndex].quantity++;
        } else {
            cart.products.push({ product: req.params.pid, quantity: 1 });
        }

        await cart.save();
        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: "Error al agregar producto" });
    }
});

// ELIMINAR un producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        cart.products = cart.products.filter(p => p.product.toString() !== req.params.pid);
        await cart.save();
        
        res.json({ status: 'success', message: 'Producto eliminado del carrito', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ACTUALIZAR todos los productos del carrito con un arreglo
router.put('/:cid', async (req, res) => {
    try {
        const cart = await cartModel.findByIdAndUpdate(req.params.cid, { products: req.body }, { new: true });
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
        res.json({ status: 'success', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ACTUALIZAR SÓLO la cantidad de un producto
router.put('/:cid/products/:pid', async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

        const productIndex = cart.products.findIndex(p => p.product.toString() === req.params.pid);
        if (productIndex !== -1) {
            cart.products[productIndex].quantity = req.body.quantity;
            await cart.save();
            res.json({ status: 'success', message: 'Cantidad actualizada', cart });
        } else {
            res.status(404).json({ error: 'Producto no encontrado en el carrito' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// VACIAR el carrito completo
router.delete('/:cid', async (req, res) => {
    try {
        const cart = await cartModel.findByIdAndUpdate(req.params.cid, { products: [] }, { new: true });
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
        res.json({ status: 'success', message: 'Carrito vaciado', cart });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;