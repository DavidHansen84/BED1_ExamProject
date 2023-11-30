class UserService {
    constructor(db) {
        this.client = db.sequelize;
        this.User = db.User;
    }


    async createAdmin(Username, Password, Email, FirstName, LastName, Address, Telephone, Salt ) {
        return this.User.create(
            {
                username: Username,
                firstName: FirstName,
                lastName: LastName,
                address: Address,
                telephoneNumber: Telephone,
                email: Email,
                password: Password,
                RoleId: 1,
                MembershipId: 1,
                salt: Salt
            }
        )
    }

    async createUser( Username, Password, Email, FirstName, LastName, Address, Telephone ) {
        return this.User.create(
            {
                username: Username,
                firstName: FirstName,
                lastName: LastName,
                address: Address,
                telephoneNumber: Telephone,
                email: Email,
                password: Password,
            }
        )
    }

    async get() {
        return this.User.findAll({
            where: { 
            }
        }).catch( err => {
            return (err)
        })
    }

}

module.exports = UserService;