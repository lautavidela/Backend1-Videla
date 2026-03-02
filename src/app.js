import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';
import ProductManager from './managers/ProductManager.js'; 

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
const productManager = new ProductManager('./src/data/products.json');

io.on('connection', async (socket) => {
    console.log('¡Nuevo cliente conectado!');
    
    // Al conectarse, le enviamos todos los productos actuales
    const products = await productManager.getProducts();
    socket.emit('updateProducts', products);
});