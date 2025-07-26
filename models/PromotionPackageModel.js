import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const PromotionPackage = db.define('promotion_packages', {
  promotion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

export default PromotionPackage;