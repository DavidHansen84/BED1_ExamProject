class BrandService {
    constructor(db) {
        this.client = db.sequelize;
        this.Brand = db.Brand;
    }


    async create(Name) {
        return this.Brand.create(
            {

                Name: Name,
            }
        )
    }

    async get(brand) {
        return this.Brand.findAll({
            where: { 
                Name: brand,
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = BrandService;