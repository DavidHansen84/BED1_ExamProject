module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define('User', {
			firstName: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
			},
            lastName: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
			},
            username: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
			},
            address: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
			},
            telephonenumber: {
                type: Sequelize.DataTypes.INTEGER,
                allownull: false
            },
			Email: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
			},
			EncryptedPassword: {
				type: Sequelize.DataTypes.BLOB,
				allowNull: false,
			},
			Salt: {
				type: Sequelize.DataTypes.BLOB,
				allowNull: false,
			},
            Purchases: {
                type: Sequelize.DataTypes.INTEGER,
                defaultValue: 0,
                allowNull: false,
            }
		},
		{
			timestamps: true,
		}
	);

	User.associate = function (models) {
		User.belongsTo(models.Membership, { foreignKey: { allowNull: false } });
        User.belongsTo(models.Role, { foreignKey: { allowNull: false } });
	};

	return User;
};

