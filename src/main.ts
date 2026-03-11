import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/express-api-reference';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Multi-Tenant Auth (Org-Scoped)')
    .setDescription('Authentication + tenant isolation + org-scoped roles')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const openApiDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, openApiDocument);

  app.use(
    '/reference',
    apiReference({
      url: '/docs-json',
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
