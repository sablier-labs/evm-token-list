import buildList from "./buildList.mjs";

try {
  const data = buildList();
  const formattedData = JSON.stringify(data, null, 2);
  console.log(formattedData);
} catch (error) {
  console.error("Failed to build list:", error);
  process.exit(1);
}
