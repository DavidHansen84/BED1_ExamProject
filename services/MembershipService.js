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