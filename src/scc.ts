// G(V, E)
import * as fs from 'fs';

const StronglyConnectedComponents = (
  graph: Array<Array<number>>,
  revGraph: Array<Array<number>>,
) => {
  const used: Array<boolean> = new Array(graph.length).fill(false);
  const order: Array<number> = [];
  const comp: Array<number> = new Array(graph.length).fill(-1);

  const dfs = (id: number): void => {
    if (used[id]) return;
    used[id] = true;
    for (const to of graph[id]) {
      dfs(to);
    }
    order.push(id);
  };

  const rdfs = (id: number, cnt: number): void => {
    if (comp[id] !== -1) return;
    comp[id] = cnt;
    for (const to of revGraph[id]) {
      rdfs(to, cnt);
    }
  };

  const build = (): Array<number> => {
    for (let i = 0; i < graph.length; i++) dfs(i);

    const reversedOrder = order.reverse();
    let ptr = 0;
    for (const i of reversedOrder) {
      if (comp[i] === -1) {
        rdfs(i, ptr);
        ptr++;
      }
    }
    return comp;
  };

  return build;
};

const main = (input: string) => {
  const args = input.split('\n');
  const [V, E] = args[0].split(' ').map((str) => parseInt(str, 10));

  const S: Array<number> = [];
  const T: Array<number> = [];
  const graph: Array<Array<number>> = new Array(V);
  const revGraph: Array<Array<number>> = new Array(V);
  for (let i = 0; i < graph.length; i++) {
    graph[i] = [];
    revGraph[i] = [];
  }

  for (let i = 1; i < E + 1; i++) {
    const [s, t] = args[i].split(' ').map((str) => parseInt(str, 10));
    S.push(s);
    T.push(t);

    graph[s].push(t);
    revGraph[t].push(s);
  }

  const scc = StronglyConnectedComponents(graph, revGraph);
  const comp = scc();

  const [Q] = args[E + 1].split(' ').map((str) => parseInt(str, 10));
  for (let i = E + 2; i < E + 2 + Q; i++) {
    const [u, v] = args[i].split(' ').map((str) => parseInt(str, 10));

    console.log(comp[u] === comp[v] ? 1 : 0);
  }
};

main(fs.readFileSync('/dev/stdin', 'utf8'));
