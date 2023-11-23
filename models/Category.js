module.exports = (sequeliza, Sequelize) => {
    const Category = sequeliza.define('Category', {
        Id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: { 
            type :Sequelize.DataTypes.STRING,
        allowNull: false,
        // unique: true

        }
        }, {
        timestamps: true 
    });

    Category.associate = function(models) {
        Category.hasMany(models.Product, { foreignKey: { allowNull: false } });
    };

    return Category;
}