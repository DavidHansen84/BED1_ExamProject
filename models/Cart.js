module.exports = (sequelize, Sequelize) => {
    const Cart = sequelize.define('Cart', {
        Id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.DataTypes.STRING,
    },{
        timestamps: true
    });

    Cart.associate = function(models) {
        Cart.belongsToMany(models.Product, { through: 'ProductsInCart', allowNull: false });
        Cart.belongsTo(models.User, { allowNull: false } );
    };
    
    return Cart;
};
