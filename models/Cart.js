module.exports = (sequelize, Sequelize) => {
    const Cart = sequelize.define('Cart', {
        Id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: Sequelize.DataTypes.STRING,

        Active: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                isIn: {
                    args: [[1, 0]],
                    msg: "Active must be 1 or 0. 1 is active 0 is inactive"
                }
            }
        }
    }, {
        timestamps: true
    });

    Cart.associate = function (models) {
        Cart.belongsToMany(models.Product, { through: 'ProductsInCart', allowNull: false });
        Cart.belongsTo(models.User, { allowNull: false });
    };

    return Cart;
};
