#!/usr/bin/env node
const chokidar = require('chokidar');
const { Client } = require('ssh2');
const fs = require('fs');
const chalk = require('chalk');
const { program } = require('commander');

// 1. Настраиваем аргументы командной строки
program
  .option('-h, --host <type>', 'Remote host (IP or domain)')
  .option('-u, --user <type>', 'SSH username')
  .option('-w, --password <type>', 'SSH password') // Добавили флаг -w (от word/password)
  .option('-p, --path <type>', 'Remote target path (e.g. /var/www/html)')
  .parse(process.argv);

const options = program.opts();

// Проверка обязательных полей
if (!options.host || !options.user || !options.password || !options.path) {
  console.log(chalk.red('❌ Ошибка: Укажите все параметры (-h, -u, -w, -p)'));
  process.exit(1);
}

const conn = new Client();

console.log(chalk.cyan('👻 GhostSync: Инициализация...'));

conn.on('ready', () => {
  console.log(chalk.green(`✅ Подключено к ${options.host}! Слежу за файлами...`));

  // 2. Начинаем слежку за текущей директорией (.)
  chokidar.watch('.', { 
    ignored: /(^|[\/\\])\..|node_modules/, // Игнорим скрытые файлы и тяжелый node_modules
    persistent: true 
  }).on('change', (path) => {
    console.log(chalk.yellow(`⚡ Изменение: ${path}`));
    
    conn.sftp((err, sftp) => {
      if (err) {
        console.error(chalk.red('SFTP Error:'), err);
        return;
      }
      
      const remotePath = `${options.path}/${path.replace(/\\/g, '/')}`; // Фикс путей для Linux серверов
      const readStream = fs.createReadStream(path);
      const writeStream = sftp.createWriteStream(remotePath);

      writeStream.on('close', () => {
        console.log(chalk.magenta(`🚀 Синхронизировано: ${path} -> ${remotePath}`));
      });

      writeStream.on('error', (err) => {
        console.error(chalk.red(`❌ Ошибка записи ${path}:`), err.message);
      });

      readStream.pipe(writeStream);
    });
  });
}).on('error', (err) => {
  console.error(chalk.red('🔌 Ошибка подключения:'), err.message);
}).connect({
  host: options.host,
  port: 22,
  username: options.user,
  password: options.password // используем пароль из консоли
});
