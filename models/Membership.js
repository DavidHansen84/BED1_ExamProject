module.exports = (sequelize, Sequelize) => {
    const Membership = sequelize.define('Membership', {
        Id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: Sequelize.DataTypes.STRING,
            defaultValue: "Bronze",
            validate: {
                isIn: {
                    args: [['Bronze', 'Silver', 'Gold']],
                    msg: "Membership must be 'Bronze', 'Silver' or 'Gold'"
                }
            }
        }   
    }, {
        timestamps: true 
    });

    return Membership;
};