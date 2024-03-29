module.exports = (sequelize, Sequelize) => {
    const Order = sequelize.define('Order', {
        Id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.DataTypes.STRING,
        OrderNumber: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        MembershipId: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false
        }
    },{
        timestamps: true
    });

    Order.associate = function(models) {
        Order.belongsToMany(models.Product, { through: 'ProductsInOrder', allowNull: false });
        Order.belongsTo(models.User, { allowNull: false } );
        Order.belongsTo(models.Status, { foreignKey: { allowNull: false } });
        };
    
    return Order;
};
