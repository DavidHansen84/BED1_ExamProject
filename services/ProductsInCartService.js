class ProductsInCartService {
    constructor(db) {
        this.client = db.sequelize;
        this.ProductsInCart = db.ProductsInCart;
    }


    async create(cartId, productId, quantity, productName, unitPrice) {
        return this.ProductsInCart.create(
            {
                CartId: cartId,
                ProductId: productId,
                Quantity: quantity,
                ProductName: productName,
                UnitPrice: unitPrice
            }
        )
    }

    async update(Id, newQuantity) {
        return this.ProductsInCart.update(
            {
                Quantity: newQuantity,
            }, { where: { Id: Id } });
    }

    async getOne(cartId, productId) {
        return this.ProductsInCart.findOne({
            where: { 
                CartId: cartId,
                ProductId: productId
            }
        }).catch( err => {
            return (err)
        })
    }

    async getAll(cartId) {
        return this.ProductsInCart.findAll({
            where: { 
                CartId: cartId
            }
        }).catch( err => {
            return (err)
        })
    }

    async remove(id) {
        return this.ProductsInCart.destroy({
            where: { 
                ProductId: id,
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = ProductsInCartService;