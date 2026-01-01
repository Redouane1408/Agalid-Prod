import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { RequestsModule } from './requests/requests.module';
import { QuotesModule } from './quotes/quotes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RequestsModule,
    QuotesModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

