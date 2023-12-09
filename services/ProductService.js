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


    async createNew(Name, ImageURL, Description, Price, Quantity, Brand, Category) {
        return this.Product.create(
            {
                Name: Name,
                ImageURL: ImageURL,
                Description: Description,
                Price: Price,
                Quantity: Quantity,
                BrandId: Brand,
                CategoryId: Category
            }
        )
    }

    async update(Id, Name, ImageURL, Description, Price, Quantity, Brand, Category) {
        return this.Product.update(
            {
                Name: Name,
                ImageURL: ImageURL,
                Description: Description,
                Price: Price,
                Quantity: Quantity,
                BrandId: Brand,
                CategoryId: Category
            }, { where: { Id: Id } });
    }
    async updateQuantity(Id, Quantity) {
        return this.Product.update(
            {
                Quantity: Quantity,
            }, { where: { Id: Id } });
    }

    async updateCategory(Id, Category) {
        return this.Product.update(
            {
                CategoryId: Category,
            }, { where: { Id: Id } });
    }

    async updateBrand(Id, Brand) {
        return this.Product.update(
            {
                BrandId: Brand,
            }, { where: { Id: Id } });
    }

    async get() {
        return this.Product.findAll({
            where: {
            }
        }).catch( err => {
            return (err)
        })
    }

    async getOne(productId) {
        return this.Product.findAll({
            where: {
                Id: productId
            }
        }).catch( err => {
            return (err)
        })
    }

    async getCategory(categoryId) {
        return this.Product.findAll({
            where: {
                CategoryId: categoryId
            }
        }).catch( err => {
            return (err)
        })
    }

    async getBrand(BrandId) {
        return this.Product.findAll({
            where: {
                BrandId: BrandId
            }
        }).catch( err => {
            return (err)
        })
    }

    async getName(name) {
        return this.Product.findAll({
            where: {
                Name: name
            }
        }).catch( err => {
            return (err)
        })
    }

    async delete(Id) {
        return this.Product.update(
            {
                Active: 0,
            }, { where: { Id: Id } });
    }

    async activate(Id) {
        return this.Product.update(
            {
                Active: 1,
            }, { where: { Id: Id } });
    }

}

module.exports = ProductService;