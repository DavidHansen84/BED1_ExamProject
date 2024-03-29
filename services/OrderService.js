class OrderService {
    constructor(db) {
        this.client = db.sequelize;
        this.Order = db.Order;
    }


    async create(Name, UserId, status, orderNumber, membershipId ) {
        return this.Order.create(
            {
                Name: Name,
                UserId: UserId,
                StatusId: status,
                OrderNumber: orderNumber,
                MembershipId: membershipId
            }
        )
    }

    async getOne(Name, user) {
        return this.Order.findOne({
            where: { 
                Name: Name,
                UserId: user,
            }
        }).catch( err => {
            return (err)
        })
    }

    async getOrderNumber(orderNumber) {
        return this.Order.findOne({
            where: { 
                OrderNumber: orderNumber
            }
        }).catch( err => {
            return (err)
        })
    }

    async getAll(userId) {
        return this.Order.findAll({
            where: { 
                UserId: userId
            }
        }).catch( err => {
            return (err)
        })
    }

    async getAllOrders() {
        return this.Order.findAll({
            where: { 
            }
        }).catch( err => {
            return (err)
        })
    }

    async update(OrderNumber, StatusId) {
        return this.Order.update(
            {
                StatusId: StatusId,
            }, { where: { OrderNumber: OrderNumber } });
    }    

}

module.exports = OrderService;