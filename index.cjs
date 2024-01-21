"use strict";

const {makeSynchronizedModule} = require('make-synchronized')

function createSynchronizedPrettier({ prettierEntry }) {
  return makeSynchronizedModule(prettierEntry);
}

module.exports = createSynchronizedPrettier({ prettierEntry: "prettier" });
module.exports.createSynchronizedPrettier = createSynchronizedPrettier;
