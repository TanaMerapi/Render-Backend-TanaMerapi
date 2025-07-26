import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const Slide = db.define('slides', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

export default Slide;
