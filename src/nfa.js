"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNFA = void 0;
var rerejs_1 = require("rerejs");
exports.createNFA = function (exp) {
    var parser = new rerejs_1.Parser(exp);
    var pattern = parser.parse();
    var nfa = createAutomatonNode(pattern.child);
    // 受理状態追加
    var lastNode = { next: [], ends: [] };
    nfa.ends.map(function (end) {
        end.next.push({ char: '', to: lastNode });
    });
    nfa.ends = [lastNode];
    return nfa;
};
var createAutomatonNode = function (node) {
    switch (node.type) {
        case 'Capture': {
            return createAutomatonNode(node.child);
        }
        case 'Disjunction': {
            var nextNodes = node.children.map(function (child) {
                return createAutomatonNode(child);
            });
            var prevNode_1 = { next: [], ends: [] };
            nextNodes.map(function (nextNode) {
                var _a;
                prevNode_1.next.push({ char: '', to: nextNode });
                (_a = prevNode_1.ends).push.apply(_a, nextNode.ends);
            });
            return prevNode_1;
        }
        case 'Sequence': {
            var seqNodes = node.children.map(function (child) { return createAutomatonNode(child); });
            var _loop_1 = function (i) {
                var before = seqNodes[i];
                var after = seqNodes[i + 1];
                before.ends.map(function (end) {
                    end.next.push({ char: '', to: after });
                });
                before.ends = after.ends;
            };
            for (var i = seqNodes.length - 2; i >= 0; i--) {
                _loop_1(i);
            }
            return seqNodes[0];
        }
        case 'Many': {
            var nextNode_1 = { next: [], ends: [] };
            var repeatNode_1 = createAutomatonNode(node.child);
            var prevTorepeatArrow = {
                char: '',
                to: repeatNode_1,
            };
            var prevToNextarrow = {
                char: '',
                to: nextNode_1,
            };
            repeatNode_1.ends.map(function (node) {
                node.next.push({ char: '', to: repeatNode_1 });
                node.next.push({ char: '', to: nextNode_1 });
            });
            var prevNode = {
                next: [prevTorepeatArrow, prevToNextarrow],
                ends: [nextNode_1],
            };
            return prevNode;
        }
        case 'Dot': {
            var nextNode = { next: [], ends: [] };
            nextNode.ends.push(nextNode);
            var prevNode = {
                next: [{ char: '∑', to: nextNode }],
                ends: [nextNode],
            };
            return prevNode;
        }
        case 'Char': {
            var nextNode = { next: [], ends: [] };
            nextNode.ends.push(nextNode);
            var prevNode = {
                next: [{ char: node.raw, to: nextNode }],
                ends: [nextNode],
            };
            return prevNode;
        }
    }
    throw 'Cannnot Parse!!';
};
var giveIndexToNode = function (nfa) {
    var queue = Array();
    var n = 0;
    queue.push(nfa);
    while (queue.length > 0) {
        var node = queue.shift();
        if (typeof node !== 'undefined') {
            node.index = n++;
            for (var _i = 0, _a = node.next; _i < _a.length; _i++) {
                var arrow = _a[_i];
                if (typeof arrow.to.index === 'undefined') {
                    queue.push(arrow.to);
                }
            }
        }
        else {
            break;
        }
    }
};
var createVizStr = function (nfa) {
    // 最初に点に対して数字を割り振る
    giveIndexToNode(nfa);
    var ret = '';
    ret += "digraph G {\n";
    ret += nfa.ends[0].index + " [shape=doublecircle];\n";
    var pid = nfa.index;
    if (typeof pid === 'undefined') {
        throw 'undefined pid';
    }
    for (var _i = 0, _a = nfa.next; _i < _a.length; _i++) {
        var arrow = _a[_i];
        ret += createDot(pid, arrow);
    }
    ret += "}\n";
    return ret;
};
var createDot = function (pid, arrow) {
    if (arrow.visited === true) {
        return '';
    }
    arrow.visited = true;
    var ret = '';
    var cid = arrow.to.index;
    if (typeof cid === 'undefined') {
        throw 'undefined pid';
    }
    ret += pid + " -> " + cid + " [label = \"" + (arrow.char === '' ? 'ε' : arrow.char) + "\"];\n";
    for (var _i = 0, _a = arrow.to.next; _i < _a.length; _i++) {
        var nextArrow = _a[_i];
        ret += createDot(cid, nextArrow);
    }
    return ret;
};
// Test
var main = function () {
    var testCases = ['abc', 'a|b|c', 'a*', '(a|b)*', '((a|a)*)*'];
    for (var _i = 0, testCases_1 = testCases; _i < testCases_1.length; _i++) {
        var testCase = testCases_1[_i];
        var nfa = exports.createNFA(testCase);
        var viz = createVizStr(nfa);
        console.log(viz);
    }
};
main();
