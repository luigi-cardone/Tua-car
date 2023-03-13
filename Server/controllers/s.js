let timeOffset = new Date().getTimezoneOffset()
let dtNow = new Date(new Date().getTime() - (timeOffset * 60 * 1000));
const currentDate = new Date(dtNow).toJSON().slice(0,19).replace(/-/g,'/').replaceAll("/", "_").replace("Z", "_").replace("T", "_").replaceAll(":", "")
console.log(currentDate)