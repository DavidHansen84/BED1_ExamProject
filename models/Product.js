module.exports = (sequeliza, Sequelize) => {
    const Product = sequeliza.define('Product', {
        Id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        ImageURL: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        Description: {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        },
        Price: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false
        },
        Quantity: {
            type: Sequelize.DataTypes.INTEGER,
            allowNull: false
        },
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

    Product.associate = function (models) {
        Product.belongsTo(models.Category, { foreignKey: { allowNull: false } });
        Product.belongsTo(models.Brand, { foreignKey: { allowNull: false } });
    };

    return Product;
}