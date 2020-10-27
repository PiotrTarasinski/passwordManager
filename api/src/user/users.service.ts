import { Injectable, InternalServerErrorException } from '@nestjs/common';
import db from 'src/database/initializeDatabase';
import { UserCredentials } from 'src/dto/User';

@Injectable()
export class UsersService {
  async findOne(username: string) {
    return await db.User.findOne({
      where: {
        username,
      },
    });
  }

  async getPasswords(user: UserCredentials) {
    const dbUser = await db.User.findOne({
      where: {
        id: user.id,
      },
    });
    const passwords = await dbUser.getPasswords();
    return { passwords };
  }

  async deletePassword(id: string) {
    await (await db.Password.findByPk(id)).destroy().catch(() => {
      throw new InternalServerErrorException();
    });
  }
}
