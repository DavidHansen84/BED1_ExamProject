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

    async getOne(brand) {
        return this.Brand.findOne({
            where: { 
                Name: brand,
            }
        }).catch( err => {
            return (err)
        })
    }

    async getOneId(Id) {
        return this.Brand.findOne({
            where: { 
                Id: Id,
            }
        }).catch( err => {
            return (err)
        })
    }

    async get() {
        return this.Brand.findAll({
            where: { 
            }
        }).catch( err => {
            return (err)
        })
    }

    async delete(Id) {
        return this.Brand.destroy({
            where: { 
                Id: Id,
            }
        }).catch( err => {
            return (err)
        })
    }

    async update(Id, name) {
        return this.Brand.update(
            {
                Name: name
            }, { where: { Id: Id } });
    }

}

module.exports = BrandService;