"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNFA = void 0;
var rerejs_1 = require("rerejs");
var testText = '(a|b)*cd';
exports.createNFA = function (exp) {
    var parser = new rerejs_1.Parser(exp);
    var pattern = parser.parse();
    // pattern.child.children.map((x) => console.log(x));
    console.log(typeof pattern.child);
};
// Test
exports.createNFA(testText);
