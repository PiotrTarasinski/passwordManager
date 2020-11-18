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
  webAddress: string;
  description: string;
  login: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type PasswordCreationAttributes = Optional<PasswordAttributes, 'id'>;

export class Password
  extends Model<PasswordAttributes, PasswordCreationAttributes>
  implements PasswordAttributes {
  public id!: number;
  public password!: string;
  public userId!: number;
  public webAddress!: string;
  public description!: string;
  public login!: string;

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
      webAddress: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      login: {
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
