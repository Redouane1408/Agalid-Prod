import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { RequestsModule } from './requests/requests.module';
import { QuotesModule } from './quotes/quotes.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ProductsModule } from './products/products.module';
import { HealthModule } from './health/health.module';
import { OwnerSettingsModule } from './owner-settings/owner-settings.module';

import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    RequestsModule,
    QuotesModule,
    AuthModule,
    UsersModule,
    IntegrationsModule,
    DashboardModule,
    ProductsModule,
    OwnerSettingsModule,
    HealthModule,
    UploadModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}

