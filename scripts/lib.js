const fs = require("fs")
const path = require("path")

const ROOT = path.resolve(__dirname, "..")
const GREEN = "\x1b[32m"
const RED = "\x1b[31m"
const YELLOW = "\x1b[33m"
const RESET = "\x1b[0m"

function pass(msg) {
  console.log(`  ${GREEN}PASS${RESET}  ${msg}`)
}

function fail(msg) {
  console.log(`  ${RED}FAIL${RESET}  ${msg}`)
}

function warn(msg) {
  console.log(`  ${YELLOW}WARN${RESET}  ${msg}`)
}

function title(msg) {
  console.log(`\n--- ${msg} ---`)
}

function summary(results) {
  const failures = results.filter((r) => !r.ok)
  console.log("")
  if (failures.length === 0) {
    console.log(`${GREEN}✓ All ${results.length} checks passed${RESET}`)
  } else {
    console.log(
      `${RED}✗ ${failures.length}/${results.length} checks failed${RESET}`,
    )
    failures.forEach((f) => console.log(`  ${f.message}`))
    process.exit(1)
  }
}

function fileExists(p) {
  return fs.existsSync(path.join(ROOT, p))
}

function readFile(p) {
  return fs.readFileSync(path.join(ROOT, p), "utf8")
}

function result(ok, message) {
  return { ok, message }
}

module.exports = { ROOT, pass, fail, warn, title, summary, fileExists, readFile, result }