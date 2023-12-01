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

    async getOne(role) {
        return this.Role.findOne({
            where: { 
                Name: role,
            }
        }).catch( err => {
            return (err)
        })
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