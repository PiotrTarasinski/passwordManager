import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PaginationDTO, UserCredentials } from 'src/dto/User';
import db from '../database/initializeDatabase';

@Injectable()
export class UsersService {
  async findOne(login: string) {
    return await db.User.findOne({
      where: {
        login,
      },
    });
  }

  async getPasswords(user: UserCredentials, pagination: PaginationDTO) {
    const { count, page } = pagination;
    const dbUser = await db.User.findOne({
      where: {
        id: user.id,
      },
    });
    const passwords = await dbUser.getPasswords({
      offset: page * count,
      limit: count,
    });
    const dbCount = await dbUser.countPasswords();
    return { passwords, count: dbCount };
  }

  async deletePassword(id: number) {
    await (await db.Password.findByPk(id)).destroy().catch(() => {
      throw new InternalServerErrorException();
    });
  }
}
