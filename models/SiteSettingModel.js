// SiteSettingModel.js
import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const SiteSetting = db.define('site_settings', {
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'text'
  }
});

export default SiteSetting;