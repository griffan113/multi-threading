import { NestFactory } from '@nestjs/core';

import cluster from 'node:cluster';
import { cpus } from 'node:os';

import { AppModule } from './app.module';

const numCPUs = cpus().length;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    await app.listen(process.env.PORT || 3000);

    console.log(`Worker ${process.pid} started`);
  }
}
bootstrap();
