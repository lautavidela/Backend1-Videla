import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    products: {
        type: [
            {
                // Referencia al modelo de productos (Para el Populate)
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
                quantity: { type: Number, required: true, default: 1 }
            }
        ],
        default: []
    }
});

// Middleware PRE para que SIEMPRE haga populate al hacer find o findOne
cartSchema.pre('findOne', function () {
    this.populate('products.product');
});

export const cartModel = mongoose.model('carts', cartSchema);