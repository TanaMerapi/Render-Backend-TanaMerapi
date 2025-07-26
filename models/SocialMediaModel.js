import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const SocialMedia = db.define('social_media', {
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      isIn: [['instagram', 'whatsapp', 'tiktok', 'gmaps']]
    }
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  }
});

export default SocialMedia;