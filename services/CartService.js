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

    async getOne(Name, user) {
        return this.Cart.findOne({
            where: { 
                Name: Name,
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

    async ordered(Id) {
        return this.Cart.update(
            {
                Active: 0,
            }, { where: { Id: Id } });
    }

    async activate(Id) {
        return this.Cart.update(
            {
                Active: 1,
            }, { where: { Id: Id } });
    }

}

module.exports = CartService;