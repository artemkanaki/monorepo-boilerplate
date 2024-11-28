import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsers1723646479735 implements MigrationInterface {
  name = 'CreateUsers1723646479735';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "users"
        (
            "id"                uuid                   NOT NULL,
            "created_at"        TIMESTAMP              NOT NULL,
            "updated_at"        TIMESTAMP              NOT NULL,
            "email"             character varying(320) NOT NULL,
            "kyc_status"        character varying(50)  NOT NULL,
            CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
