import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    const count = await this.prisma.user.count();
    if (count === 0) {
      this.logger.log('No users found. Seeding initial admin user...');
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      await this.prisma.user.create({
        data: {
          email: 'admin@agalid.com',
          password: hashedPassword,
          name: 'Admin User',
          role: 'ADMIN',
        },
      });
      this.logger.log('Admin user created: admin@agalid.com / admin123');
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
