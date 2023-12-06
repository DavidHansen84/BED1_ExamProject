class StatusService {
    constructor(db) {
        this.client = db.sequelize;
        this.Status = db.Status;
    }


    async create(Name) {
        return this.Status.create(
            {

                Name: Name,
            }
        )
    }

    async getOne(status) {
        return this.Status.findOne({
            where: { 
                Name: status,
            }
        }).catch( err => {
            return (err)
        })
    }


    async get() {
        return this.Status.findAll({
            where: { 
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = StatusService;