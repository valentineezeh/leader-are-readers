module.exports = (sequelize, DataTypes) => {
  const Bookmark = sequelize.define('Bookmark', {
    articleId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Provide article slug' }
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Provide the id of the user who bookmarked the page' }
      }
    }
  }, {});

  Bookmark.associate = (models) => {
    Bookmark.belongsTo(models.User, {
      foreignKey: 'userId',
    });

    Bookmark.belongsTo(models.Article, {
      foreignKey: 'articleId',
    });
  };

  return Bookmark;
};
