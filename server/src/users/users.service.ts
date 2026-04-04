import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const email = 'admin@agalid.com';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const forceReset = (process.env.FORCE_ADMIN_PASSWORD || '').toLowerCase() === 'true';

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (!existing) {
      this.logger.log('Admin user not found. Creating initial admin user...');
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
        },
      });
      this.logger.log(`Admin user created: ${email}`);
      return;
    }

    if (existing.role !== 'ADMIN') {
      await this.prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
      });
      this.logger.log(`User promoted to ADMIN: ${email}`);
    }

    if (forceReset) {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      await this.prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });
      this.logger.log(`Admin password reset: ${email}`);
    }
  }

  async findOne(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(data.password, salt);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }
}
