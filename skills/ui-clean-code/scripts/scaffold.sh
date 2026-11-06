#!/usr/bin/env bash
# ==============================================================================
# UI Clean Code Component Scaffolder
# Automatically generates tree-structured component hierarchies following
# the ui-clean-code architectural standard.
# ==============================================================================

set -euo pipefail

usage() {
  cat << EOF
Usage: $0 <target-directory> <ComponentName> [options]

Arguments:
  target-directory    Base directory where the component folder will be created
  ComponentName       Name of the component (e.g. CreateProfile or ItemForm)

Options:
  --sub-components    Comma-separated list of child UI sub-components to scaffold in UI/
                      Example: --sub-components StepsIndicator,Steps
  --with-hook         Generate a colocated custom logic hook (use<ComponentName>.ts)
  --help              Display this help message

Example:
  $0 src/features/profile/screens CreateProfile --with-hook --sub-components StepsIndicator,Steps
EOF
  exit 1
}

if [[ $# -lt 2 ]]; then
  usage
fi

TARGET_DIR="$1"
COMPONENT_NAME="$2"
shift 2

WITH_HOOK=false
SUB_COMPONENTS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-hook)
      WITH_HOOK=true
      shift
      ;;
    --sub-components)
      SUB_COMPONENTS="$2"
      shift 2
      ;;
    --help)
      usage
      ;;
    *)
      echo "Error: Unknown argument $1"
      usage
      ;;
  esac
done

COMPONENT_PATH="${TARGET_DIR}/${COMPONENT_NAME}"
UI_DIR="${COMPONENT_PATH}/UI"

echo "Scaffolding component at: ${COMPONENT_PATH}"
mkdir -p "${COMPONENT_PATH}"

# Generate optional custom hook
HOOK_IMPORT=""
HOOK_CALL=""
if [[ "$WITH_HOOK" == true ]]; then
  HOOK_NAME="use${COMPONENT_NAME}"
  HOOK_FILE="${COMPONENT_PATH}/${HOOK_NAME}.ts"
  
  cat << EOF > "${HOOK_FILE}"
import { useState } from 'react';

export function ${HOOK_NAME}() {
  const [isLoading, setIsLoading] = useState(false);

  return {
    isLoading,
    setIsLoading,
  };
}
EOF
  echo "  Created hook: ${HOOK_NAME}.ts"
  HOOK_IMPORT="import { ${HOOK_NAME} } from './${HOOK_NAME}';"
  HOOK_CALL="  const { isLoading } = ${HOOK_NAME}();\n"
fi

# Generate sub-components if requested
SUB_COMP_IMPORTS=""
SUB_COMP_JSX=""

if [[ -n "$SUB_COMPONENTS" ]]; then
  mkdir -p "${UI_DIR}"
  IFS=',' read -ra ADDR <<< "$SUB_COMPONENTS"
  for SUB in "${ADDR[@]}"; do
    SUB_TRIMMED=$(echo "$SUB" | xargs)
    SUB_PATH="${UI_DIR}/${SUB_TRIMMED}"
    mkdir -p "${SUB_PATH}"
    
    cat << EOF > "${SUB_PATH}/index.tsx"
import React from 'react';

export interface ${SUB_TRIMMED}Props {
  className?: string;
}

export function ${SUB_TRIMMED}({ className }: ${SUB_TRIMMED}Props) {
  return (
    <div className={className}>
      <h3>${SUB_TRIMMED}</h3>
    </div>
  );
}
EOF
    echo "  Created child UI component: UI/${SUB_TRIMMED}/index.tsx"
    SUB_COMP_IMPORTS="${SUB_COMP_IMPORTS}import { ${SUB_TRIMMED} } from './UI/${SUB_TRIMMED}';\n"
    SUB_COMP_JSX="${SUB_COMP_JSX}      <${SUB_TRIMMED} />\n"
  done
fi

# Generate main component index.tsx (Table of Contents)
cat << EOF > "${COMPONENT_PATH}/index.tsx"
import React from 'react';
${HOOK_IMPORT}
$(echo -e "${SUB_COMP_IMPORTS}")
export interface ${COMPONENT_NAME}Props {
  className?: string;
}

export function ${COMPONENT_NAME}({ className }: ${COMPONENT_NAME}Props) {
$(echo -e "${HOOK_CALL}")  return (
    <div className={className}>
$(echo -e "${SUB_COMP_JSX:-      <h2>${COMPONENT_NAME}</h2>}")
    </div>
  );
}
EOF

echo "  Created Table of Contents entry: index.tsx"
echo "Done! Generated hierarchy for ${COMPONENT_NAME}."
