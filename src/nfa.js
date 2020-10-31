"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNFA = void 0;
var rerejs_1 = require("rerejs");
var recursivePush = function (before, after) {
    if (before.next.length > 0) {
        for (var i = 0; i < before.next.length; i++) {
            recursivePush(before.next[i].to, after);
        }
    }
    else {
        before.next.push({ char: '', to: after });
    }
};
exports.createNFA = function (exp) {
    var parser = new rerejs_1.Parser(exp);
    var pattern = parser.parse();
    var endNode = { next: [], isEnd: true };
    var nfa = createAutomatonNode(pattern.child, true, endNode);
    return nfa;
};
var createAutomatonNode = function (node, isEnd, endNode) {
    switch (node.type) {
        case 'Capture': {
            return createAutomatonNode(node.child, isEnd, endNode);
        }
        case 'Disjunction': {
            var nextNodes = node.children.map(function (child, index) {
                return createAutomatonNode(child, index === node.children.length - 1 ? isEnd : false, endNode);
            });
            var nowNode_1 = { next: [], isEnd: isEnd };
            nextNodes.map(function (nn) {
                var arrow = { char: '', to: nn };
                nowNode_1.next.push(arrow);
            });
            return nowNode_1;
        }
        case 'Sequence': {
            var seqNodes = node.children.map(function (child, index) {
                return createAutomatonNode(child, index === node.children.length - 1 ? isEnd : false, endNode);
            });
            for (var i = 0; i < seqNodes.length - 1; i++) {
                var before = seqNodes[i];
                var after = seqNodes[i + 1];
                // need to push recursively
                recursivePush(before, after);
            }
            return seqNodes[0];
        }
        case 'Many': {
            // FIXME: recursivePushでエラー
            var nextNode = isEnd
                ? endNode
                : { next: [], isEnd: false };
            var repeatNode = createAutomatonNode(node.child, false, endNode);
            recursivePush(repeatNode, JSON.parse(JSON.stringify(repeatNode)));
            recursivePush(repeatNode, nextNode);
            var toRepeatNodeArrow = {
                char: '',
                to: repeatNode,
            };
            var nowToNextarrow = {
                char: '',
                to: nextNode,
            };
            var nowNode = {
                next: [toRepeatNodeArrow, nowToNextarrow],
                isEnd: false,
            };
            return nowNode;
        }
        case 'Dot': {
            var nextNode = isEnd
                ? endNode
                : { next: [], isEnd: false };
            var arrow = { char: '∑', to: nextNode };
            var nowNode = { next: [arrow], isEnd: false };
            return nowNode;
        }
        case 'Char': {
            var nextNode = isEnd
                ? endNode
                : { next: [], isEnd: false };
            var arrow = { char: node.raw, to: nextNode };
            var nowNode = { next: [arrow], isEnd: false };
            return nowNode;
        }
    }
    throw 'Cannnot Parse!!';
};
var createVizStr = function (nfa) {
    var count = 0;
    var getId = function () { return count++; };
    var ret = '';
    ret += "digraph G {\n";
    var pid = getId();
    for (var _i = 0, _a = nfa.next; _i < _a.length; _i++) {
        var arrow = _a[_i];
        ret += createDot(pid, arrow, getId);
    }
    ret += "}\n";
    return ret;
};
var createDot = function (pid, arrow, getId) {
    var ret = '';
    var cid = getId();
    ret += pid + " -> " + cid + " [label = \"" + (arrow.char === '' ? 'ε' : arrow.char) + "\"];\n";
    for (var _i = 0, _a = arrow.to.next; _i < _a.length; _i++) {
        var nextArrow = _a[_i];
        ret += createDot(cid, nextArrow, getId);
    }
    return ret;
};
// Test
var main = function () {
    // const testCases = ['abc', 'a|b|c', 'a*'];
    var testCases = ['a*'];
    for (var _i = 0, testCases_1 = testCases; _i < testCases_1.length; _i++) {
        var testCase = testCases_1[_i];
        var nfa = exports.createNFA(testCase);
        var viz = createVizStr(nfa);
        console.log(viz);
    }
};
main();
