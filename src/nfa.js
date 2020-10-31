"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNFA = void 0;
var rerejs_1 = require("rerejs");
var testText = 'abc';
var recursivePush = function (before, after) {
    if (before.next.length > 0) {
        for (var i = 0; i < before.next.length; i++) {
            recursivePush(before.next[i].node, after);
        }
    }
    else {
        before.next.push({ char: '', node: after });
    }
};
exports.createNFA = function (exp) {
    var parser = new rerejs_1.Parser(exp);
    var pattern = parser.parse();
    var nfa = createAutomatonNode(pattern.child);
    console.log(nfa.next[0].node.next[0].node.next[0].node.next[0].node);
};
var createAutomatonNode = function (node) {
    switch (node.type) {
        case 'Disjunction': {
            var nextNodes = node.children.map(function (child) {
                return createAutomatonNode(child);
            });
            var nowNode_1 = { next: [] };
            nextNodes.map(function (nn) {
                var arrow = { char: '', node: nn };
                nowNode_1.next.push(arrow);
            });
            return nowNode_1;
        }
        case 'Sequence': {
            var seqNodes = node.children.map(function (child) { return createAutomatonNode(child); });
            for (var i = 0; i < seqNodes.length - 1; i++) {
                var before = seqNodes[i];
                var after = seqNodes[i + 1];
                // need to push recursively
                recursivePush(before, after);
            }
            return seqNodes[0];
        }
        case 'Char': {
            var nextNode = { next: [] };
            var arrow = { char: node.raw, node: nextNode };
            var nowNode = { next: [arrow] };
            return nowNode;
        }
    }
    return {};
};
// Test
exports.createNFA(testText);
