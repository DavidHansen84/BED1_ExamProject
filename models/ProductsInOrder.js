module.exports = (sequelize, Sequelize) => {
    const ProductsInOrder = sequelize.define('ProductsInOrder', {
        Id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Quantity: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false
        },
        UnitPrice: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false
        },
        ProductName: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: true 
    });


    return ProductsInOrder;
};