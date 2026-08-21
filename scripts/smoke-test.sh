#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "用法：bash scripts/smoke-test.sh https://example.vercel.app" >&2
  exit 2
fi

BASE_URL="${1%/}"
TEMP_DIR="$(mktemp -d)"
trap 'rm -rf -- "${TEMP_DIR}"' EXIT
CURL_OPTIONS=(--connect-timeout 10 --max-time 30 --retry 2 --retry-delay 1)

assert_status() {
  local expected="$1"
  local path="$2"
  local actual
  actual="$(curl "${CURL_OPTIONS[@]}" --silent --show-error --output /dev/null --write-out '%{http_code}' "${BASE_URL}${path}")"
  if [[ "${actual}" != "${expected}" ]]; then
    echo "状态码错误：${path} 期望 ${expected}，实际 ${actual}" >&2
    exit 1
  fi
}

ROOT_STATUS="$(curl "${CURL_OPTIONS[@]}" --silent --show-error --dump-header "${TEMP_DIR}/root-headers.txt" --output /dev/null --write-out '%{http_code}' "${BASE_URL}/")"
if [[ "${ROOT_STATUS}" != "307" ]]; then
  echo "根路径状态码错误：期望 307，实际 ${ROOT_STATUS}" >&2
  exit 1
fi

ROOT_LOCATION="$(awk 'tolower($1) == "location:" { $1=""; sub(/^ /, ""); sub(/\r$/, ""); location=$0 } END { print location }' "${TEMP_DIR}/root-headers.txt")"
if [[ "${ROOT_LOCATION}" != "/Prototype/index.html" ]]; then
  echo "根路径 Location 错误：期望 /Prototype/index.html，实际 ${ROOT_LOCATION:-<缺失>}" >&2
  exit 1
fi

curl "${CURL_OPTIONS[@]}" --silent --show-error --fail --location "${BASE_URL}/" --output "${TEMP_DIR}/root.html"
grep -q 'PC端产品原型导航' "${TEMP_DIR}/root.html"

assert_status 200 '/Prototype/index.html'
assert_status 200 '/Prototype/%E7%B3%BB%E7%BB%9F%E6%A1%86%E6%9E%B6.html?page=home'
assert_status 200 '/Prototype/%E5%85%AC%E5%85%B1%E5%AF%BC%E8%88%AA.js'
assert_status 200 '/src/assets/styles/global.css'
assert_status 200 '/src/assets/%E6%96%B0%E6%89%8B%E5%BC%95%E5%AF%BC/create_enter.png'
assert_status 404 '/PRD/'
assert_status 404 '/.env.local'

curl "${CURL_OPTIONS[@]}" --silent --show-error --head "${BASE_URL}/Prototype/index.html" --output "${TEMP_DIR}/headers.txt"
grep -qi '^x-content-type-options: nosniff' "${TEMP_DIR}/headers.txt"
grep -qi '^x-frame-options: SAMEORIGIN' "${TEMP_DIR}/headers.txt"
grep -qi '^x-robots-tag: noindex, nofollow' "${TEMP_DIR}/headers.txt"

echo "线上冒烟测试通过：${BASE_URL}"
