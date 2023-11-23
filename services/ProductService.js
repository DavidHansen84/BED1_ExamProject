const fs = require("fs");

class ProductService {
    constructor(db) {
        this.client = db.sequelize;
        this.Product = db.Product;
    }

    // async populateProducts() {
    //     try {
    //         const jsonData = fs.readFileSync('./data/memes.json', 'utf8');
    //         const queries = JSON.parse(jsonData);

    //         for (const queryData of queries) {
    //             await this.client.query(queryData.query);
    //             console.log(`Query executed for status ID ${queryData.id}`);
    //         }
    //     } catch (error) {
    //         console.error('Error populating Status:', error);
    //     }
    // }

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