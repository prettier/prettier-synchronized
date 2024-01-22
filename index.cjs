"use strict";

const { makeModuleSynchronized } = require("make-synchronized");

function createSynchronizedPrettier({ prettierEntry }) {
  return makeModuleSynchronized(prettierEntry);
}

module.exports = createSynchronizedPrettier({ prettierEntry: "prettier" });
module.exports.createSynchronizedPrettier = createSynchronizedPrettier;
