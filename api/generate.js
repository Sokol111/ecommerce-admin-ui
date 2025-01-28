const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

// Завантажуємо конфігурацію з файлу config.json
const config = require("./config.json");

// Функція для обробки кожного API
config.apis.forEach((api) => {
  const tempRepoDir = path.join(__dirname, "temp", api.name);

  try {
    console.log(`Processing API: ${api.name}`);

    // Якщо папка вже існує, видаляємо її перед початком
    if (fs.existsSync(tempRepoDir)) {
      execSync(`rm -rf ${tempRepoDir}`);
    }

    // Клонуємо репозиторій і чекаємо на потрібний тег
    console.log(`Cloning repository at tag: ${api.tag}`);
    execSync(
      `git clone --branch ${api.tag} --single-branch --depth 1 ${api.repo} ${tempRepoDir}`
    );

    // Перевіряємо, чи файл існує в репозиторії
    const openApiFilePath = path.join(tempRepoDir, api.openApiPath);
    if (fs.existsSync(openApiFilePath)) {
      console.log(`File ${api.openApiPath} successfully checked out.`);
    } else {
      throw new Error(
        `The OpenAPI file ${api.openApiPath} does not exist in the repository.`
      );
    }

    // Генерація API клієнта за допомогою openapi-generator-cli
    console.log("Generating API client for:", api.name);
    execSync(
      `openapi-generator-cli generate -i ${openApiFilePath} -g ${config.generatorOptions.language} -o ${api.outputDir}`
    );

    console.log(`API client generated at: ${api.outputDir}`);
  } catch (error) {
    console.error(`Error processing ${api.name}:`, error.message);
  } finally {
    // Видаляємо папку temp після завершення генерації
    if (fs.existsSync(tempRepoDir)) {
      console.log(`Cleaning up temporary directory: ${tempRepoDir}`);
      execSync(`rm -rf ${tempRepoDir}`);
    }
  }
});
