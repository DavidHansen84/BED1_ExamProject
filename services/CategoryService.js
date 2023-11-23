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

    async get(category) {
        return this.Category.findAll({
            where: { 
                Name: category,
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = CategoryService;