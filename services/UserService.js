class UserService {
    constructor(db) {
        this.client = db.sequelize;
        this.User = db.User;
    }


    async create(Username, Password, Email, FirstName, LastName, Address, Telephone, Salt, membership, role ) {
        return this.User.create(
            {
                username: Username,
                firstName: FirstName,
                lastName: LastName,
                address: Address,
                telephoneNumber: Telephone,
                email: Email,
                password: Password,
                RoleId: role,
                MembershipId: membership,
                salt: Salt
            }
        )
    }

    async updatePurchases(Id, purchases) {
        return this.User.update(
            {
                purchases: purchases,
            }, { where: { Id: Id } });
    }

    async updateMembership(Id, MembershipId) {
        return this.User.update(
            {
                MembershipId: MembershipId,
            }, { where: { Id: Id } });
    }

    async update(Id, email, firstName, lastName, role, username, telephoneNumber) {
        return this.User.update(
            {
                email: email,
                firstName: firstName,
                lastName: lastName,
                RoleId: role,
                username: username,
                telephoneNumber: telephoneNumber
            }, { where: { Id: Id } });
    }


    async get() {
        return this.User.findAll({
            where: { 
            }
        }).catch( err => {
            return (err)
        })
    }

    async getOne(email) {
        return this.User.findOne({
            where: { 
                email: email,
            }
        }).catch( err => {
            return (err)
        })
    }

    async getUsername(username) {
        return this.User.findOne({
            where: { 
                username: username,
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = UserService;