module.exports = (sequelize, Sequelize) => {
    const ProductsInCart = sequelize.define('ProductsInCart', {
        Id: {
            type: Sequelize.DataTypes.INTEGER,
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

    return ProductsInCart;
};