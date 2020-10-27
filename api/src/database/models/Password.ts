import {
  Association,
  BelongsToGetAssociationMixin,
  DataTypes,
  Model,
  Optional,
} from 'sequelize';
import { User } from './User';

interface PasswordAttributes {
  id: number;
  password: string;
  userId: number;
  url: string;
  description: string;
  username: string;
}

type PasswordCreationAttributes = Optional<PasswordAttributes, 'id'>;

export class Password
  extends Model<PasswordAttributes, PasswordCreationAttributes>
  implements PasswordAttributes {
  public id!: number;
  public password!: string;
  public userId!: number;
  public url!: string;
  public description!: string;
  public username!: string;

  public getUser!: BelongsToGetAssociationMixin<User>;

  public static associations: {
    users: Association<Password, User>;
  };

  public static associate(db) {
    Password.belongsTo(db.User, {
      targetKey: 'id',
    });
  }
}

export default function (sequelize): typeof Password {
  Password.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id',
        },
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'password',
    },
  );

  return Password;
}
