import { DataTypes } from 'sequelize';
import db from '../config/database.js';
import Package from './PackageModel.js';
import PromotionPackage from './PromotionPackageModel.js';

const Promotion = db.define('promotions', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  valid_from: {
    type: DataTypes.DATE,
    allowNull: false
  },
  valid_until: {
    type: DataTypes.DATE,
    allowNull: false
  },
  discount_percent: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 100
    }
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    // PostgreSQL uses ENUM differently, this is handled by Sequelize
    type: DataTypes.ENUM('active', 'inactive', 'expired'),
    defaultValue: 'active',
    allowNull: false
  }
});

// Many-to-many relation with Package through PromotionPackage
Promotion.belongsToMany(Package, { 
  through: PromotionPackage,
  foreignKey: 'promotion_id',
  as: 'packages'
});

Package.belongsToMany(Promotion, { 
  through: PromotionPackage,
  foreignKey: 'package_id',
  as: 'promotions'
});

export default Promotion;