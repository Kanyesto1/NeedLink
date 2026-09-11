const { title, pass, fail, summary, readFile, result } = require("./lib")
const fs = require("fs")
const path = require("path")

title("Deprecated roles check")

const checks = []
const DEPRECATED = ["super_admin", "user", "admin_only", "role_admin", "role_superuser"]

function walk(dir, files = []) {
  if (!fs.existsSync(path.join(process.cwd(), dir))) return files
  for (const entry of fs.readdirSync(path.join(process.cwd(), dir), { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue
      walk(full, files)
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(full)
    }
  }
  return files
}

const files = walk(".")
let found = false

files.forEach((f) => {
  const content = readFile(f)
  DEPRECATED.forEach((dep) => {
    if (content.includes(`"${dep}"`) || content.includes(`'${dep}'`)) {
      checks.push(result(false, `deprecated role "${dep}" found in ${f.replace(/\\/g, "/")}`))
      found = true
    }
  })
})

if (!found) {
  checks.push(result(true, "no deprecated role strings found"))
}

summary(checks)