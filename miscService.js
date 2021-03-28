// replace spaces with dash & convert string to lower case
let convertToId = (str) => {
  if (str.toLowerCase() === "html/css")
  return "html-css"
  
  return str.replace(/\s+/g, '-').toLowerCase()
};

module.exports = {
    convertToId
  };