import { Module, Global } from "@nestjs/common";
import { Pool } from "pg";

const dbProvider = {
  provide: "DATABASE_POOL",
  useValue: new Pool({
    user: "postgres",
    host: "localhost",
    database: "evidyalaya",
    password: "root",
    port: 5432,
  }),
};

@Global()
@Module({
  providers: [dbProvider],
  exports: [dbProvider],
})
export class DatabaseModule {}
