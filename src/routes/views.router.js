import { Router } from 'express';
import { productModel } from '../models/product.model.js';
import { cartModel } from '../models/cart.model.js';

const router = Router();

// Vista principal con productos paginados
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true
        };

        const result = await productModel.paginate({}, options);

        res.render('home', { 
            products: result.docs,
            hasNextPage: result.hasNextPage,
            hasPrevPage: result.hasPrevPage,
            nextPage: result.nextPage,
            prevPage: result.prevPage,
            page: result.page,
            title: 'Lista de Productos' 
        });
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});

router.get('/carts/:cid', async (req, res) => {
    try {
        const cart = await cartModel.findById(req.params.cid).populate('products.product').lean();
        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }
        res.render('cart', { cart, title: 'Detalle del Carrito' });
    } catch (error) {
        res.status(500).send('Error interno del servidor');
    }
});

export default router;