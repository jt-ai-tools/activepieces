#!/bin/bash

# Find all original .md and .mdx files (excluding PROGRESS.md and existing zh_TW files)
FILES=$(./scripts/list_md_files.sh)

TOTAL=0
TRANSLATED=0

for file in $FILES; do
    TOTAL=$((TOTAL + 1))
    
    # Generate the translated file path
    EXT="${file##*.}"
    BASE="${file%.*}"
    ZH_TW_FILE="${BASE}_zh_TW.${EXT}"
    
    if [[ -f "$ZH_TW_FILE" ]]; then
        TRANSLATED=$((TRANSLATED + 1))
    else
        echo "Missing translation: $file"
    fi
done

echo "--------------------------------"
echo "Progress: $TRANSLATED / $TOTAL"
