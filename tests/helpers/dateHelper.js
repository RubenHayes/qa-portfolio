/**
 * Returns a DOB string (YYYY-MM-DD) for someone who is exactly `age` years old today,
 * optionally offset by extra days to land just before/after a birthday.
 */
function getDob(age, extraDaysOlder = 0) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - age);
  date.setDate(date.getDate() - extraDaysOlder);
  return date.toISOString().split("T")[0];
}

module.exports = { getDob };