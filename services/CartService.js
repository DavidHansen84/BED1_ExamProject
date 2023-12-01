class CartService {
    constructor(db) {
        this.client = db.sequelize;
        this.Cart = db.Cart;
    }


    async create(Name, UserId) {
        return this.Cart.create(
            {
                Name: Name,
                UserId: UserId
            }
        )
    }

    async getOne(user) {
        return this.Cart.findOne({
            where: { 
                UserId: user,
            }
        }).catch( err => {
            return (err)
        })
    }

    async getAll() {
        return this.Cart.findAll({
            where: { 
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = CartService;