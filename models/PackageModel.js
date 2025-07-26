import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const Package = db.define('packages', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  route: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  price: {
    // PostgreSQL uses numeric instead of decimal, but Sequelize handles this automatically
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: true
    }
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      isDecimal: true
    }
  },
  discount_percent: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 100
    }
  },
  promotion_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'promotions',
      key: 'id'
    }
  }
});

export default Package;