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

  # Extract the network name for display purposes.
  network=$(basename "$file" .json | tr '-' '_' | tr '[:lower:]' '[:upper:]')

  echo -n "$network tokens list: "

  # Extract the chainId from the first token in the JSON file.
  chain_id=$(echo "$json_objects" | jq -r '.[0].chainId')

  if [ -z "$chain_id" ] || [ "$chain_id" = "null" ]; then
    echo -e "🟡 missing chainId in token file."
    continue
  fi

  # Check if ROUTEMESH_API_KEY is set.
  if [ -z "$ROUTEMESH_API_KEY" ]; then
    echo -e "🟡 missing ROUTEMESH_API_KEY."
    continue
  fi

  # Generate RPC URL using RouteMesh.
  rpc_url="https://lb.routeme.sh/rpc/${chain_id}/${ROUTEMESH_API_KEY}"

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
