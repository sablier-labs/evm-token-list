#!/usr/bin/env bash

# Pre-requisites for running this script:
#
# - bash >=4.0.0
# - .env file

set -euo pipefail

# Source variables from .env file if it exists.
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  source <(envsubst < .env)
fi

# Loop through files in `src/tokens` directory.
for file in src/tokens/*.json; do
  json_objects=$(cat "$file")

  # Extract the filename and replace '-' with '_'.
  network=$(basename "$file" .json | tr '-' '_' | tr '[:lower:]' '[:upper:]')

  echo -n "$network tokens list: "

  # Construct the RPC URL variable name from filename.
  rpc_url_var="${network}_RPC_URL"

  # Load the RPC URL from the environment variable or default to empty string if not found.
  rpc_url=${!rpc_url_var:-}

  if [ -z "$rpc_url" ]; then
    echo -e "🟡 missing RPC endpoint."
    continue
  fi

  # Loop through JSON objects and extract address and token decimals.
  echo "$json_objects" | jq -c '.[]' | while read -r row; do
    address=$(echo "$row" | jq -r '.address')
    token_decimal=$(echo "$row" | jq -r '.decimals')

    # Indicate progress
    echo -n "."

    # Make request through RPC
    response=$(curl -sS $rpc_url \
      -X POST \
      -H "Content-Type: application/json" \
      -d '{
        "jsonrpc": "2.0",
        "method": "eth_call",
        "params": [{
          "to": "'"$address"'",
          "data": "0x313ce567"
        }, "latest"],
        "id": 1
      }')

    # Get token decimals (base-16) from curl response, continue if response is not valid.
    if ! actual_decimals=$(echo $response | jq -r '.result'); then
      echo -e "\e[31m🔴 $response"
      continue
    fi

    # Convert token decimals to base-10, continue if response is not valid.
    if ! actual_decimals=$(printf "%d" "$actual_decimals"); then
      echo -e "🟡 Invalid for $address, could be an RPC issue, manual check is recommended."
      continue
    fi

    # Compare token decimal with actual decimals and throw error if they do not match.
    if [ "$token_decimal" -ne "$actual_decimals" ]; then
      echo -e "\e[31m🔴 Mismatch for $address. Set to $token_decimal. Should be $actual_decimals\e[0m"
      exit 1
    fi

  done

  # Log success
  echo -e "\e[32m🟢 Valid\e[0m"
done
