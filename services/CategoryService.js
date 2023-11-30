class CategoryService {
    constructor(db) {
        this.client = db.sequelize;
        this.Category = db.Category;
    }


    async create(Name) {
        return this.Category.create(
            {

                Name: Name,
            }
        )
    }

    async getOne(category) {
        return this.Category.findOne({
            where: { 
                Name: category,
            }
        }).catch( err => {
            return (err)
        })
    }

    async get() {
        return this.Category.findAll({
            where: { 
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = CategoryService;