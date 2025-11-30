import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VerifyModule } from './verify/verify.module';
import { EncryptModule } from './encrypt/encrypt.module';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}.local`,
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env.local',
        '.env',
      ],
      cache: true,
      expandVariables: true,
    }),
    VerifyModule,
    EncryptModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
