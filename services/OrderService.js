class OrderService {
    constructor(db) {
        this.client = db.sequelize;
        this.Order = db.Order;
    }


    async create(Name, UserId, status) {
        return this.Order.create(
            {
                Name: Name,
                UserId: UserId,
                StatusId: status
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

    async getAll() {
        return this.Order.findAll({
            where: { 
            }
        }).catch( err => {
            return (err)
        })
    }

    

}

module.exports = OrderService;