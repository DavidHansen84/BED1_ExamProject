module.exports = (sequelize, Sequelize) => {
    const ProductsInOrder = sequelize.define('ProductsInOrder', {
        Id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        timestamps: true 
    });

    return ProductsInOrder;
};