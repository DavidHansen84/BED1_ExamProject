class ProductsInOrderService {
    constructor(db) {
        this.client = db.sequelize;
        this.ProductsInOrder = db.ProductsInOrder;
    }


    async create(OrderId, productId, quantity, productName, unitPrice) {
        return this.ProductsInOrder.create(
            {
                OrderId: OrderId,
                ProductId: productId,
                Quantity: quantity,
                ProductName: productName,
                UnitPrice: unitPrice,
            }
        )
    }

    async update(OrderId, newQuantity) {
        return this.ProductsInOrder.update(
            {
                Quantity: newQuantity,
            }, { where: { OrderId: OrderId } });
    }

    async getOne(OrderId, productId) {
        return this.ProductsInOrder.findOne({
            where: { 
                OrderId: OrderId,
                ProductId: productId
            }
        }).catch( err => {
            return (err)
        })
    }

    async getOneId(OrderId) {
        return this.ProductsInOrder.findOne({
            where: { 
                OrderId: OrderId,
                
            }
        }).catch( err => {
            return (err)
        })
    }

    async getAll(OrderId) {
        return this.ProductsInOrder.findAll({
            where: { 
                OrderId: OrderId
            }
        }).catch( err => {
            return (err)
        })
    }

    async remove(id) {
        return this.ProductsInOrder.destroy({
            where: { 
                Id: id,
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = ProductsInOrderService;