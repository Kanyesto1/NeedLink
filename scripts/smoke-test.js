const { title, pass, fail, summary, result } = require("./lib")
const http = require("http")

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000"
const ENDPOINTS = ["/api/v1/health", "/api/v1/categories"]

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      let body = ""
      res.on("data", (c) => (body += c))
      res.on("end", () => resolve({ status: res.statusCode, body }))
    })
    req.on("error", reject)
    req.setTimeout(10000, () => req.destroy(new Error("timeout")))
  })
}

title("Smoke test")

const checks = []
;(async () => {
  for (const ep of ENDPOINTS) {
    try {
      const { status, body } = await fetchUrl(`${BASE}${ep}`)
      const ok = status === 200
      checks.push(result(ok, `${ep} returned ${status}`))
      if (ok) pass(`${ep} -> ${status}`)
      else fail(`${ep} -> ${status} (${body.slice(0, 120)})`)
    } catch (err) {
      checks.push(result(false, `${ep} unreachable: ${err.message}`))
      fail(`${ep} unreachable`)
    }
  }

  for (const ep of ["/", "/login", "/register"]) {
    try {
      const { status } = await fetchUrl(`${BASE}${ep}`)
      checks.push(result(status === 200, `${ep} rendered`))
      if (status === 200) pass(`${ep} -> ${status}`)
      else fail(`${ep} -> ${status}`)
    } catch (err) {
      checks.push(result(false, `${ep} unreachable`))
    }
  }

  summary(checks)
  process.exit(0)
})()