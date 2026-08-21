#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
DIST_DIR="${PROJECT_ROOT}/dist"
BUILD_DIR=""

if [[ -z "${PROJECT_ROOT}" || "${PROJECT_ROOT}" == "/" || "${SCRIPT_DIR}" != "${PROJECT_ROOT}/scripts" ]]; then
  echo "无法确认项目根目录，停止构建：${PROJECT_ROOT}" >&2
  exit 1
fi

DIST_PARENT="$(cd "$(dirname "${DIST_DIR}")" && pwd -P)"
if [[ "${DIST_PARENT}" != "${PROJECT_ROOT}" || "$(basename "${DIST_DIR}")" != "dist" || "${DIST_DIR}" == "${PROJECT_ROOT}" ]]; then
  echo "拒绝清理非预期输出目录：${DIST_DIR}" >&2
  exit 1
fi

node "${SCRIPT_DIR}/verify-static.mjs" --source "${PROJECT_ROOT}"

BUILD_DIR="$(mktemp -d "${PROJECT_ROOT}/.dist-build.XXXXXX")"
cleanup() {
  if [[ -n "${BUILD_DIR}" && -d "${BUILD_DIR}" && "${BUILD_DIR}" == "${PROJECT_ROOT}/.dist-build."* ]]; then
    rm -rf -- "${BUILD_DIR}"
  fi
}
trap cleanup EXIT

mkdir -p "${BUILD_DIR}/Prototype" "${BUILD_DIR}/src/assets"

cp "${PROJECT_ROOT}/index.html" "${BUILD_DIR}/index.html"
cp -R "${PROJECT_ROOT}/Prototype/." "${BUILD_DIR}/Prototype/"
cp -R "${PROJECT_ROOT}/src/assets/." "${BUILD_DIR}/src/assets/"

find "${BUILD_DIR}" -name '.DS_Store' -type f -delete

node "${SCRIPT_DIR}/verify-static.mjs" --dist "${BUILD_DIR}"

rm -rf -- "${DIST_DIR}"
mv "${BUILD_DIR}" "${DIST_DIR}"
BUILD_DIR=""

FILE_COUNT="$(find "${DIST_DIR}" -type f | wc -l | tr -d ' ')"
OUTPUT_SIZE="$(du -sh "${DIST_DIR}" | awk '{print $1}')"
echo "静态发布包已生成：${FILE_COUNT} 个文件，${OUTPUT_SIZE}，目录 ${DIST_DIR}"
