module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        // client: 'sqlite',
        // filename: env('DATABASE_FILENAME', '.tmp/data.db'),
        client: 'mysql',
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'sahla'),
        username: env('DATABASE_USERNAME', 'nico'),
        password: env('DATABASE_PASSWORD', 'gUs_*bHdH9a^5awe'),
      },
      options: {
        useNullAsDefault: true,
      },
    },
  },
});
