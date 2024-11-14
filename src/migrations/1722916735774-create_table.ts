import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTable1722916735774 implements MigrationInterface {
    name = 'CreateTable1722916735774'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`departments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`roles\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`first_name\` varchar(255) NOT NULL, \`last_name\` varchar(255) NOT NULL, \`dob\` datetime NOT NULL, \`address\` varchar(255) NOT NULL, \`gender\` varchar(255) NOT NULL, \`roleId\` int NULL, \`departmentId\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permissions\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`department_management\` (\`id\` int NOT NULL AUTO_INCREMENT, \`dep_id\` varchar(255) NOT NULL, \`userId\` int NULL, UNIQUE INDEX \`REL_65f4b85e8a6163c47bdbd088c1\` (\`userId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`permissions_roles_roles\` (\`permissionsId\` int NOT NULL, \`rolesId\` int NOT NULL, INDEX \`IDX_aff2f66944175a2cb34cfa8a50\` (\`permissionsId\`), INDEX \`IDX_b746e554e30a7c6027aab29cda\` (\`rolesId\`), PRIMARY KEY (\`permissionsId\`, \`rolesId\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_368e146b785b574f42ae9e53d5e\` FOREIGN KEY (\`roleId\`) REFERENCES \`roles\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD CONSTRAINT \`FK_554d853741f2083faaa5794d2ae\` FOREIGN KEY (\`departmentId\`) REFERENCES \`departments\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`department_management\` ADD CONSTRAINT \`FK_65f4b85e8a6163c47bdbd088c1b\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`permissions_roles_roles\` ADD CONSTRAINT \`FK_aff2f66944175a2cb34cfa8a503\` FOREIGN KEY (\`permissionsId\`) REFERENCES \`permissions\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE \`permissions_roles_roles\` ADD CONSTRAINT \`FK_b746e554e30a7c6027aab29cda6\` FOREIGN KEY (\`rolesId\`) REFERENCES \`roles\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`permissions_roles_roles\` DROP FOREIGN KEY \`FK_b746e554e30a7c6027aab29cda6\``);
        await queryRunner.query(`ALTER TABLE \`permissions_roles_roles\` DROP FOREIGN KEY \`FK_aff2f66944175a2cb34cfa8a503\``);
        await queryRunner.query(`ALTER TABLE \`department_management\` DROP FOREIGN KEY \`FK_65f4b85e8a6163c47bdbd088c1b\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_554d853741f2083faaa5794d2ae\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP FOREIGN KEY \`FK_368e146b785b574f42ae9e53d5e\``);
        await queryRunner.query(`DROP INDEX \`IDX_b746e554e30a7c6027aab29cda\` ON \`permissions_roles_roles\``);
        await queryRunner.query(`DROP INDEX \`IDX_aff2f66944175a2cb34cfa8a50\` ON \`permissions_roles_roles\``);
        await queryRunner.query(`DROP TABLE \`permissions_roles_roles\``);
        await queryRunner.query(`DROP INDEX \`REL_65f4b85e8a6163c47bdbd088c1\` ON \`department_management\``);
        await queryRunner.query(`DROP TABLE \`department_management\``);
        await queryRunner.query(`DROP TABLE \`permissions\``);
        await queryRunner.query(`DROP TABLE \`users\``);
        await queryRunner.query(`DROP TABLE \`roles\``);
        await queryRunner.query(`DROP TABLE \`departments\``);
    }

}
