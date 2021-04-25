import { getConnection } from 'typeorm';

export const dropFromDB = async (): Promise<void> => {
  await getConnection().query(`
    DROP TABLE IF EXISTS "post" CASCADE;	
    DROP TABLE IF EXISTS "profile" CASCADE;
    DROP TABLE IF EXISTS "user" CASCADE;
    DROP TABLE IF EXISTS "migrations" CASCADE;
  `);
};
