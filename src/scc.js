"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// G(V, E)
var fs = __importStar(require("fs"));
var StronglyConnectedComponents = function (graph, revGraph) {
    var used = new Array(graph.length).fill(false);
    var order = [];
    var comp = new Array(graph.length).fill(-1);
    var dfs = function (id) {
        if (used[id])
            return;
        used[id] = true;
        for (var _i = 0, _a = graph[id]; _i < _a.length; _i++) {
            var to = _a[_i];
            dfs(to);
        }
        order.push(id);
    };
    var rdfs = function (id, cnt) {
        if (comp[id] !== -1)
            return;
        comp[id] = cnt;
        for (var _i = 0, _a = revGraph[id]; _i < _a.length; _i++) {
            var to = _a[_i];
            rdfs(to, cnt);
        }
    };
    var build = function () {
        for (var i = 0; i < graph.length; i++)
            dfs(i);
        var reversedOrder = order.reverse();
        var ptr = 0;
        for (var _i = 0, reversedOrder_1 = reversedOrder; _i < reversedOrder_1.length; _i++) {
            var i = reversedOrder_1[_i];
            if (comp[i] === -1) {
                rdfs(i, ptr);
                ptr++;
            }
        }
        return comp;
    };
    return build;
};
var main = function (input) {
    var args = input.split('\n');
    var _a = args[0].split(' ').map(function (str) { return parseInt(str, 10); }), V = _a[0], E = _a[1];
    var S = [];
    var T = [];
    var graph = new Array(V);
    var revGraph = new Array(V);
    for (var i = 0; i < graph.length; i++) {
        graph[i] = [];
        revGraph[i] = [];
    }
    for (var i = 1; i < E + 1; i++) {
        var _b = args[i].split(' ').map(function (str) { return parseInt(str, 10); }), s = _b[0], t = _b[1];
        S.push(s);
        T.push(t);
        graph[s].push(t);
        revGraph[t].push(s);
    }
    var scc = StronglyConnectedComponents(graph, revGraph);
    var comp = scc();
    var Q = args[E + 1].split(' ').map(function (str) { return parseInt(str, 10); })[0];
    for (var i = E + 2; i < E + 2 + Q; i++) {
        var _c = args[i].split(' ').map(function (str) { return parseInt(str, 10); }), u = _c[0], v = _c[1];
        console.log(comp[u] === comp[v] ? 1 : 0);
    }
};
main(fs.readFileSync('/dev/stdin', 'utf8'));
