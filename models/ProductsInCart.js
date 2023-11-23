module.exports = (sequelize, Sequelize) => {
    const ProductsInCart = sequelize.define('ProductsInCart', {
        Id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        timestamps: true 
    });

    return ProductsInCart;
};