module.exports = (sequeliza, Sequelize) => {
    const Brand = sequeliza.define('Brand', {
        Id: {
            type: Sequelize.DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        Name: { 
            type: Sequelize.DataTypes.STRING,
            allowNull: false,
            // unique: true
        }
        }, {
        timestamps: true 
    });

    Brand.associate = function(models) {
        Brand.hasMany(models.Product, { foreignKey: { allowNull: false } });
    };

    return Brand;
}