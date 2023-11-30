const fs = require("fs");

class ProductService {
    constructor(db) {
        this.client = db.sequelize;
        this.Product = db.Product;
    }

    async create(Name, ImageURL, Description, Price, Quantity, date_added, Brand, Category) {
        return this.Product.create(
            {
                Name: Name,
                ImageURL: ImageURL,
                Description: Description,
                Price: Price,
                Quantity: Quantity,
                createdAt: date_added,
                BrandId: Brand,
                CategoryId: Category
            }
        )
    }
    async get() {
        return this.Product.findAll({
            where: {
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = ProductService;