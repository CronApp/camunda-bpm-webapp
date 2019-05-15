function customTranslate(template, replacements) {
  
  var translations = require('./pt-BR');
  replacements = replacements || {};

  // Translate
  template = translations[template] || template;

  // Replace
  return template.replace(/{([^}]+)}/g, function(_, key) {
    return replacements[key] || '{' + key + '}';
  });
}

module.exports = customTranslate;