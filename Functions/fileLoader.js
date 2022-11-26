const { glob } = require("glob");
const { promisify } = require("util");
const proGlob = promisify(glob);

async function loadFiles(dirName){
    const Files = await proGlob(`${process.cwd().replace(/\\/g, "/")}/${dirName}/**/*.js`); //Function goes into folder and loads all .js files
    Files.forEach((file) => delete require.cache[require.resolve(file)]); //Deletes all cached versions of files
    return Files;
};

module.exports = { loadFiles };