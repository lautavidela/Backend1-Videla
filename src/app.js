import 'dotenv/config';
import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import { productModel } from './models/product.model.js';

const app = express();
const PORT = 8080;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./src/public'));

// Configuración de Handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './src/views');


mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('¡Conectado a MongoDB Atlas!'))
    .catch(error => console.error('Error al conectar:', error));

// Levantamos el servidor HTTP
const httpServer = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

// Configuramos Socket.io sobre el servidor HTTP
const io = new Server(httpServer);

app.use((req, res, next) => {
    req.io = io;
    next();
});

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Lógica de Sockets al conectar un cliente
io.on('connection', async (socket) => {
    console.log('¡Nuevo cliente conectado!');
    
    try {
        const products = await productModel.find().lean();
        socket.emit('updateProducts', products);
    } catch (error) {
        console.error('Error al obtener productos para WebSockets:', error);
    }
});