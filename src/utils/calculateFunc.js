const calaulatePercentage = (thisMonth, lastMonth) => {
  if (lastMonth === 0) {
    if (thisMonth * 100 > 9999) {
      return 9999;
    }
    return thisMonth * 100;
  }
  const percent = (thisMonth / lastMonth) * 100;
  console.log(percent);

  if (percent > 9999) {
    return 9999;
  }
  return Number(percent.toFixed(0));
};

module.exports = calaulatePercentage;
