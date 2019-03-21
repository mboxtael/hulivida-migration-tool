const removeRelativeImports = source => {
  return source.replace(RegExp(/@import\s'(\.\.\/)+/, 'g'), "@import 'scss/");
};

module.exports.parse = source => {
  let parsedSource = removeRelativeImports(source);

  return { output: parsedSource };
};
