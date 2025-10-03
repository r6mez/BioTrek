import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatHistory1727962800000 implements MigrationInterface {
  name = 'CreateChatHistory1727962800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create chat_history table
    await queryRunner.query(
      `CREATE TABLE "chat_history" (
        "id" SERIAL NOT NULL,
        "title" character varying NOT NULL,
        "user_id" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "deletedAt" TIMESTAMP,
        CONSTRAINT "PK_chat_history_id" PRIMARY KEY ("id")
      )`,
    );

    // Create enum type for message role
    await queryRunner.query(
      `CREATE TYPE "chat_message_role_enum" AS ENUM('user', 'ai')`,
    );

    // Create chat_message table
    await queryRunner.query(
      `CREATE TABLE "chat_message" (
        "id" SERIAL NOT NULL,
        "chat_history_id" integer NOT NULL,
        "role" "chat_message_role_enum" NOT NULL,
        "content" text NOT NULL,
        "metadata" json,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chat_message_id" PRIMARY KEY ("id")
      )`,
    );

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_history_user_id" ON "chat_history" ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_message_chat_history_id" ON "chat_message" ("chat_history_id")`,
    );

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "chat_history" ADD CONSTRAINT "FK_chat_history_user" 
       FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_message" ADD CONSTRAINT "FK_chat_message_chat_history" 
       FOREIGN KEY ("chat_history_id") REFERENCES "chat_history"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "chat_message" DROP CONSTRAINT "FK_chat_message_chat_history"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chat_history" DROP CONSTRAINT "FK_chat_history_user"`,
    );

    // Drop indexes
    await queryRunner.query(
      `DROP INDEX "public"."IDX_chat_message_chat_history_id"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_chat_history_user_id"`,
    );

    // Drop tables
    await queryRunner.query(`DROP TABLE "chat_message"`);
    await queryRunner.query(`DROP TABLE "chat_history"`);

    // Drop enum type
    await queryRunner.query(`DROP TYPE "chat_message_role_enum"`);
  }
}



