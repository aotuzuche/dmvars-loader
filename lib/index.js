const loaderUtils = require("loader-utils")
const matcher = /dmvars\(([^;\r\n\f]*)\)/g

function matchAll(str, reg) {
  let res = []
  let match
  while ((match = reg.exec(str))) {
    res.push(match)
  }
  return res
}

function count(str, tar) {
  return (str.match(RegExp(`\\${tar}`, "g")) || []).length
}

function getVals(val) {
  if (val.indexOf(",") === -1) {
    return null
  }
  if (val.indexOf(",") === val.lastIndexOf(",")) {
    return val.split(",")
  }
  let lc = count(val, "(")
  let rc = count(val, ")")
  if (lc === 0 || lc !== rc) {
    return null
  }
  let l = []
  let r = []
  let c = 0
  let lend = false
  const sp = val.split(",")
  for (let s of sp) {
    if (lend) {
      r.push(s)
    } else {
      l.push(s)
    }
    if (s.indexOf("(") !== -1) {
      c += count(s, "(")
    }
    if (s.indexOf(")") !== -1) {
      c -= count(s, ")")
      if (c === 0) {
        lend = true
      }
    }
  }
  return [l.join(","), r.join(",")]
}

module.exports = function (source) {
  const all = matchAll(source, matcher)
  if (all.length === 0) {
    return source
  }
  const map = {}
  let vars = "\n:root {\n"
  let darkvars = "\n@media (prefers-color-scheme: dark) {\n  :root {\n"
  for (let i = 0; i < all.length; i++) {
    const sor = all[i][0]
    const vals = getVals(all[i][1])
    if (!vals) {
      continue
    }
    const v1 = vals[0].trim()
    const v2 = vals[1].trim()
    const hash = loaderUtils.getHashDigest(v1 + v2, "md5", "base64", 8)
    const key = "--dmvars-" + hash
    if (!map[key]) {
      vars += `  ${key}: ${v1};\n`
      darkvars += `    ${key}: ${v2};\n`
      map[key] = true
    }
    source = source.replace(sor, `var(${key})`)
  }
  if (all.length > 0) {
    vars += "}\n"
    darkvars += "  }\n}\n\n"
    source = vars + darkvars + source
  }
  return source
}
