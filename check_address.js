// Simple address validation using the same approach as the test file
const { getAddress } = require("@ethersproject/address");

const address = "0x57e114B691Db790C35207b2e685D4A43181e6061";

console.log("Testing address:", address);

try {
  const checksummed = getAddress(address);
  console.log("✅ Valid address!");
  console.log("Checksummed form:", checksummed);

  if (address === checksummed) {
    console.log("✅ Address already has correct EIP-55 checksum!");
  } else {
    console.log("❌ Address has incorrect checksum");
    console.log("Expected:", checksummed);
    console.log("Provided:", address);
  }
} catch (error) {
  console.log("❌ Invalid address:", error.message);
}