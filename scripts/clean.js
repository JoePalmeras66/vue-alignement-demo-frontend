const fs = require('node:fs').promises
const path = require('node:path')
const readline = require('node:readline')

const rl = readline.createInterface({
  input: process.stdin,

  output: process.stdout,
})

async function deleteExampleDirectories(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath)
    for (const file of files) {
      const filePath = path.join(directoryPath, file)
      try {
        const stats = await fs.stat(filePath)
        if (stats.isDirectory() && file === 'example') {
          console.log(`Deleting directory: ${filePath}`)
          await fs.rm(filePath, { recursive: true })
        } else if (stats.isDirectory()) {
          await deleteExampleDirectories(filePath)
        }
      } catch (err) {
        console.error(`Error getting stats for ${filePath}:`, err)
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${directoryPath}:`, err)
  }
}

const projectDirectory = './src' // Set your actual project directory path here
const routerStubPath = './scripts/stubs/router.stub' // Set the path to router.stub file
const appVuePath = './src/App.vue' // Set the path to App.vue file

async function main() {
  try {
    // Read the content of router.stub
    const data = await fs.readFile(routerStubPath, 'utf8')

    // Prompt the user for confirmation before proceeding with the deletion
    rl.question(
      `This script will delete all "example" directories in "${projectDirectory}". Do you want to proceed? (Y/N): `,
      async (answer) => {
        if (answer.trim().toLowerCase() === 'y') {
          await deleteExampleDirectories(projectDirectory)
          console.log('Deletion process completed.')

          // Write the content of router.stub to ./src/router/index.ts
          await fs.writeFile('./src/router/index.ts', data, 'utf8')
          console.log('router/index.ts content has been updated.')

          // Remove the line "<TheWelcome />" from ./src/App.vue
          try {
            let appVueContent = await fs.readFile(appVuePath, 'utf8')
            appVueContent = appVueContent.replace(/<TheWelcome\s*\/>/g, '')
            await fs.writeFile(appVuePath, appVueContent, 'utf8')
            console.log('Removed "<TheWelcome />" line from ./src/App.vue.')
          } catch (err) {
            console.error(`Error removing line from ${appVuePath}:`, err)
          }

          rl.close()
        } else {
          console.log('Deletion process cancelled by user.')
          rl.close()
        }
      }
    )
  } catch (err) {
    console.error(`Error reading ${routerStubPath}:`, err)
    rl.close()
  }
}

main()
