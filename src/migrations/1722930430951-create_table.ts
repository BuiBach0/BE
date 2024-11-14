import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTable1722930430951 implements MigrationInterface {
    name = 'CreateTable1722930430951'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`created_at\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updated_at\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD \`roleId\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`permissions\` ADD CONSTRAINT \`FK_36d7b8e1a331102ec9161e879ce\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP FOREIGN KEY \`FK_36d7b8e1a331102ec9161e879ce\``);
        await queryRunner.query(`ALTER TABLE \`permissions\` DROP COLUMN \`roleId\``);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`updated_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`created_at\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`);
    }

}
