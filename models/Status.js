module.exports = (sequelize, Sequelize) => {
    const Status = sequelize.define('Status', {
        Id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: Sequelize.DataTypes.STRING,
            defaultValue: "Ordered",
            validate: {
                isIn: {
                    args: [['Ordered', 'In Progress', 'Completed']],
                    msg: "Status must be 'Ordered', 'in Progress' or 'Completed'"
                }
            }
        }   
    }, {
        timestamps: true 
    });

    return Status;
};