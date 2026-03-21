import { Router } from 'express';
import { productModel } from '../models/product.model.js';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;
        
        // Armamos el filtro para la búsqueda
        const filter = {};
        if (query) {
            if (query === 'true' || query === 'false') {
                filter.status = query === 'true';
            } else {
                filter.category = query;
            }
        }

        // Configuramos opciones de paginación
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            lean: true
        };

        if (sort) {
            options.sort = { price: sort === 'asc' ? 1 : -1 };
        }

        const result = await productModel.paginate(filter, options);

        // Armamos los links de paginación
        const buildLink = (p) => `http://localhost:8080/api/products?limit=${limit}&page=${p}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`;

        res.json({
            status: 'success',
            payload: result.docs,
            totalPages: result.totalPages,
            prevPage: result.prevPage,
            nextPage: result.nextPage,
            page: result.page,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
            nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
        });
    } catch (error) {
        res.status(500).json({ status: 'error', error: error.message });
    }
});

router.get('/:pid', async (req, res) => {
    try {
        const product = await productModel.findById(req.params.pid);
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: "Error al buscar el producto" });
    }
});

router.post('/', async (req, res) => {
    try {
        const newProduct = await productModel.create(req.body);
        
        // Avisamos por WebSockets
        const updatedProducts = await productModel.find().lean();
        req.io.emit('updateProducts', updatedProducts);

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ error: "Error al crear el producto", details: error.message });
    }
});

router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await productModel.findByIdAndUpdate(req.params.pid, req.body, { new: true });
        if (!updatedProduct) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar" });
    }
});

router.delete('/:pid', async (req, res) => {
    try {
        const deleted = await productModel.findByIdAndDelete(req.params.pid);
        if (!deleted) return res.status(404).json({ error: "Producto no encontrado" });

        // Avisamos por WebSockets
        const updatedProducts = await productModel.find().lean();
        req.io.emit('updateProducts', updatedProducts);

        res.json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar" });
    }
});

export default router;