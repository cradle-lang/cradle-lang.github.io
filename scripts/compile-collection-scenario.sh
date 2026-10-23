#!/usr/bin/env bash
set -euo pipefail

scenario="${1:?Scenario ID is required}"
source_root="${2:?Source checkout is required}"
output="${3:?Output directory is required}"
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
source_file="$(node "$script_dir/resolve-library-scenario.mjs" "$scenario" "$source_root")"
mkdir -p "$output"

# Compile the original path so relative includes resolve beside the source.
# Runtime configurations, images and event objects are never executed here.
cxc validate -i "$source_file"
cxc compile -i "$source_file" -o "$output/scenario.yml"
cxc --version > "$output/compiler-version.txt"
git -C "$source_root" rev-parse HEAD > "$output/revision.txt"
node "$script_dir/generate-collection-report.mjs" "$scenario" "$source_root" "$output"
