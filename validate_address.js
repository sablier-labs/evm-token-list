const { getAddress } = require("@ethersproject/address");

// Address to validate
const addressToValidate = "0x57e114B691Db790C35207b2e685D4A43181e6061";

console.log("Address validation for EIP-55 checksum");
console.log("=====================================");
console.log(`Address to validate: ${addressToValidate}`);

try {
  // The getAddress function will:
  // 1. Validate the address format (0x + 40 hex characters)
  // 2. Validate the EIP-55 checksum if mixed case is used
  // 3. Return the properly checksummed version
  // 4. Throw an error if the checksum is invalid

  const checksummedAddress = getAddress(addressToValidate);

  console.log(`Checksummed address: ${checksummedAddress}`);

  // Check if the original address matches the checksummed version
  const isValidChecksum = addressToValidate === checksummedAddress;

  console.log(`Original matches checksum: ${isValidChecksum}`);

  if (isValidChecksum) {
    console.log("✅ VALID: Address has correct EIP-55 checksum");
  } else {
    console.log("❌ INVALID: Address checksum is incorrect");
    console.log(`Expected: ${checksummedAddress}`);
    console.log(`Provided: ${addressToValidate}`);
  }

} catch (error) {
  console.log("❌ ERROR: Address validation failed");
  console.log(`Error: ${error.message}`);
}

console.log("\nEIP-55 Checksum Info:");
console.log("- EIP-55 uses mixed case (uppercase/lowercase) for checksum validation");
console.log("- Each character's case is determined by the Keccak-256 hash of the lowercase address");
console.log("- If a character should be uppercase based on the hash and it's lowercase (or vice versa), the checksum is invalid");