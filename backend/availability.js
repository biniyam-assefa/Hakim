const startTime = new Date(2023, 0, 28, 5, 01, 00, 00);
const endTime = new Date(2023, 0, 28, 5, 31, 00, 00);

function isValidInterval(startTime, endTime) {
  const diff = (endTime - startTime) / 1000 / 60; // difference in minutes
  return diff % 30 === 0;
}

console.log(isValidInterval(startTime, endTime));
