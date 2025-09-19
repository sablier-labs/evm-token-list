// Manual EIP-55 checksum validation
const crypto = require('crypto');

function keccak256(data) {
  return crypto.createHash('sha3-256').update(Buffer.from(data, 'utf8')).digest('hex');
}

function toChecksumAddress(address) {
  // Remove 0x prefix and convert to lowercase
  const addr = address.toLowerCase().replace('0x', '');

  // Get keccak256 hash of the lowercase address
  const hash = keccak256(addr);

  // Build checksummed address
  let checksummed = '0x';

  for (let i = 0; i < addr.length; i++) {
    const char = addr[i];
    const hashChar = hash[i];

    // If hash character is 8 or higher (in hex), uppercase the address character
    if (parseInt(hashChar, 16) >= 8) {
      checksummed += char.toUpperCase();
    } else {
      checksummed += char.toLowerCase();
    }
  }

  return checksummed;
}

function validateChecksumAddress(address) {
  const expectedChecksum = toChecksumAddress(address);
  return address === expectedChecksum;
}

// Test the address
const testAddress = "0x57e114B691Db790C35207b2e685D4A43181e6061";

console.log("Manual EIP-55 Checksum Validation");
console.log("=================================");
console.log("Input address:", testAddress);

const expectedChecksum = toChecksumAddress(testAddress);
const isValid = validateChecksumAddress(testAddress);

console.log("Expected checksum:", expectedChecksum);
console.log("Is valid checksum:", isValid);

if (isValid) {
  console.log("✅ Address has VALID EIP-55 checksum");
} else {
  console.log("❌ Address has INVALID EIP-55 checksum");
}

// Show the process
console.log("\nDetailed Process:");
const lowerAddr = testAddress.toLowerCase().replace('0x', '');
const hash = keccak256(lowerAddr);
console.log("Lowercase address:", lowerAddr);
console.log("Keccak256 hash:   ", hash);

console.log("\nCharacter by character:");
for (let i = 0; i < lowerAddr.length; i++) {
  const char = lowerAddr[i];
  const hashChar = hash[i];
  const hashValue = parseInt(hashChar, 16);
  const shouldBeUpper = hashValue >= 8;
  const actualChar = testAddress[i + 2]; // +2 to skip '0x'
  const expectedChar = shouldBeUpper ? char.toUpperCase() : char.toLowerCase();
  const matches = actualChar === expectedChar;

  console.log(`${i.toString().padStart(2)}: '${char}' hash='${hashChar}' (${hashValue}) ${shouldBeUpper ? 'UPPER' : 'lower'} -> '${expectedChar}' actual='${actualChar}' ${matches ? '✅' : '❌'}`);
}