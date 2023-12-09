class MembershipService {
    constructor(db) {
        this.client = db.sequelize;
        this.Membership = db.Membership;
    }


    async create(Name) {
        return this.Membership.create(
            {

                Name: Name,
            }
        )
    }

    async getOne(membership) {
        return this.Membership.findOne({
            where: { 
                Name: membership,
            }
        }).catch( err => {
            return (err)
        })
    }

    async getOneId(Id) {
        return this.Membership.findOne({
            where: { 
                Id: Id,
            }
        }).catch( err => {
            return (err)
        })
    }


    async get() {
        return this.Membership.findAll({
            where: { 
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = MembershipService;