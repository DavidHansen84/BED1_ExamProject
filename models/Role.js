module.exports = (sequelize, Sequelize) => {
    const Role = sequelize.define('Role', {
        Id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: Sequelize.DataTypes.STRING,
            defaultValue: "User",
            validate: {
                isIn: {
                    args: [['User', 'Admin']],
                    msg: "Role must be 'User' or 'Admin'"
                }
            }
        }   
    }, {
        timestamps: true 
    });

    return Role;
};