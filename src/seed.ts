import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SeedingUser } from "./seeding/user.seeder";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
  
    // Resolve seeder service
    const userSeeder = app.get(SeedingUser);
  
    // Seed data
    await userSeeder.seedStudentClass();
  
    // Close the application context
    await app.close();
  }
  
  bootstrap();