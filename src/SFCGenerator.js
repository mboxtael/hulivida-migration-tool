module.exports.generate = (script, template, style = '') => {
  let SFCTemplate =
    '<script>\n' +
    `${script}\n` +
    '</script>\n' +
    '<template>\n' +
    `${template}\n` +
    '</template>\n';

  if (style) {
    SFCTemplate += '<style lang="scss">\n' + `${style}\n` + '</template>\n';
  }

  return SFCTemplate;
};
