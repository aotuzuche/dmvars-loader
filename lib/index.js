const loaderUtils = require("loader-utils")
const matcher = /dmvars\((.*?),(.*?)\)/g

function matchAll(str, reg) {
  var res = []
  var match
  while ((match = reg.exec(str))) {
    res.push(match)
  }
  return res
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
    const v1 = all[i][1].trim()
    const v2 = all[i][2].trim()
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
