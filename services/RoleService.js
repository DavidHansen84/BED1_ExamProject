class RoleService {
    constructor(db) {
        this.client = db.sequelize;
        this.Role = db.Role;
    }


    async create(Name) {
        return this.Role.create(
            {

                Name: Name,
            }
        )
    }

    async get() {
        return this.Role.findAll({
            where: { 
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = RoleService;