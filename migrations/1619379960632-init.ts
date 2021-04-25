import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1619379960632 implements MigrationInterface {
  name = 'init1619379960632';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("username" character varying NOT NULL, "hash" character varying NOT NULL, CONSTRAINT "PK_78a916df40e02a9deb1c4b75edb" PRIMARY KEY ("username"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "profile" ("username" character varying NOT NULL, "bio" text, CONSTRAINT "PK_d80b94dc62f7467403009d88062" PRIMARY KEY ("username"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "author_username" character varying NOT NULL, "title" character varying(200) NOT NULL, "text" character varying NOT NULL, "created_at" TIMESTAMP(3) NOT NULL DEFAULT now(), "updated_at" TIMESTAMP(3) NOT NULL DEFAULT now(), CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0f8f2f0c0512fbecbe3034b804" ON "post" ("created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "post" ADD CONSTRAINT "FK_652b3ed9bda7933b769efdacf3c" FOREIGN KEY ("author_username") REFERENCES "profile"("username") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post" DROP CONSTRAINT "FK_652b3ed9bda7933b769efdacf3c"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_0f8f2f0c0512fbecbe3034b804"`);
    await queryRunner.query(`DROP TABLE "post"`);
    await queryRunner.query(`DROP TABLE "profile"`);
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
