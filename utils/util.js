const formatTime = date => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return month + '月' + day + '日'
}
module.exports = {
  formatTime: formatTime
}
