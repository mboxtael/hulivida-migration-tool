module.exports.generate = (script, template, style = '') => {
  let SFCTemplate =
    '<script>\n' +
    `${script}\n` +
    '</script>\n\n' +
    '<template>\n' +
    `${template}\n` +
    '</template>\n\n';

  if (style) {
    SFCTemplate += '<style lang="scss">\n' + `${style}\n` + '</style>\n';
  }

  return SFCTemplate;
};
