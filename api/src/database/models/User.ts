import {
  Association,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import { Password } from './Password';

interface UserAttributes {
  id: number;
  login: string;
  password: string;
  salt: string;
  isPasswordKeptAsHash: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public login!: string;
  public password!: string;
  public salt!: string;
  public isPasswordKeptAsHash!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public getPasswords!: HasManyGetAssociationsMixin<Password>;
  public addPassword!: HasManyAddAssociationMixin<Password, number>;
  public hasPassword!: HasManyHasAssociationMixin<Password, number>;
  public countPasswords!: HasManyCountAssociationsMixin;
  public createPassword!: HasManyCreateAssociationMixin<Password>;

  public static associations: {
    passwords: Association<User, Password>;
  };

  public static associate(db) {
    User.hasMany(db.Password, {
      sourceKey: 'id',
      foreignKey: 'userId',
      as: 'passwords',
    });
  }
}

export default function (sequelize: Sequelize): typeof User {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        unique: true,
        primaryKey: true,
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      salt: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isPasswordKeptAsHash: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: 'user',
    },
  );

  return User;
}
