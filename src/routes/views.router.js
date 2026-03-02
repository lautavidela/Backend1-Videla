import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager('./src/data/products.json');

router.get('/', async (req, res) => {
    try {
        const products = await productManager.getProducts();
        res.render('home', { products, title: 'Lista Estática' });
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});

export default router;