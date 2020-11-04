import { Node, Parser } from 'rerejs';

export type NFA = AutomatonNode;

export type Arrow = {
  char: string;
  to: AutomatonNode;
  visited?: boolean;
};

export type AutomatonNode = {
  next: Arrow[];
  ends: AutomatonNode[];
  index?: number;
};

export const createNFA = (exp: string): NFA => {
  const parser = new Parser(exp);
  const pattern = parser.parse();
  const nfa = createAutomatonNode(pattern.child);

  // 受理状態追加
  const lastNode: AutomatonNode = { next: [], ends: [] };
  lastNode.ends.push(lastNode);

  nfa.ends.map((end) => {
    end.next.push({ char: '', to: lastNode } as Arrow);
  });

  nfa.ends = [lastNode];

  giveIndexToNode(nfa);

  return nfa;
};

const createAutomatonNode = (node: Node): AutomatonNode => {
  switch (node.type) {
    case 'Capture':
    case 'NamedCapture':
    case 'Group': {
      return createAutomatonNode(node.child);
    }
    case 'Disjunction': {
      const nextNodes = node.children.map((child) =>
        createAutomatonNode(child),
      );

      const prevNode: AutomatonNode = { next: [], ends: [] };

      nextNodes.map((nextNode) => {
        prevNode.next.push({ char: '', to: nextNode } as Arrow);
        prevNode.ends.push(...nextNode.ends);
      });

      return prevNode;
    }
    case 'Sequence': {
      const seqNodes = node.children.map((child) => createAutomatonNode(child));

      for (let i = seqNodes.length - 2; i >= 0; i--) {
        const before = seqNodes[i];
        const after = seqNodes[i + 1];

        before.ends.map((end) => {
          after.next.map((afterArrow) => {
            end.next.push(afterArrow);
          });
        });

        before.ends = after.ends;
      }

      return seqNodes[0];
    }
    case 'Many': {
      const nextNode: AutomatonNode = { next: [], ends: [] };
      const repeatNode = createAutomatonNode(node.child);

      const prevToRepeatArrow: Arrow = {
        char: '',
        to: repeatNode,
      };

      const prevToNextarrow: Arrow = {
        char: '',
        to: nextNode,
      };

      repeatNode.ends.map((node) => {
        node.next.push({ char: '', to: repeatNode } as Arrow);
        node.next.push({ char: '', to: nextNode } as Arrow);
      });

      const prevNode: AutomatonNode = {
        next: [prevToRepeatArrow, prevToNextarrow],
        ends: [nextNode],
      };

      return prevNode;
    }
    case 'Optional': {
      const nextNode: AutomatonNode = { next: [], ends: [] };
      const optionalNode = createAutomatonNode(node.child);

      const prevToNextarrow: Arrow = {
        char: '',
        to: nextNode,
      };

      const prevToOptionalArrow: Arrow = {
        char: '',
        to: optionalNode,
      };

      optionalNode.ends.map((node) => {
        node.next.push({ char: '', to: nextNode } as Arrow);
      });

      const prevNode: AutomatonNode = {
        next: [prevToNextarrow, prevToOptionalArrow],
        ends: [nextNode],
      };

      return prevNode;
    }
    case 'Dot': {
      const nextNode: AutomatonNode = { next: [], ends: [] };
      nextNode.ends.push(nextNode);
      const prevNode: AutomatonNode = {
        next: [{ char: '∑', to: nextNode } as Arrow],
        ends: [nextNode],
      };

      return prevNode;
    }
    case 'Char': {
      const nextNode: AutomatonNode = { next: [], ends: [] };
      nextNode.ends.push(nextNode);
      const prevNode: AutomatonNode = {
        next: [{ char: node.raw, to: nextNode } as Arrow],
        ends: [nextNode],
      };

      return prevNode;
    }
  }

  throw 'Cannnot Parse!!';
};

const giveIndexToNode = (nfa: NFA) => {
  const queue = Array<AutomatonNode>();
  let n = 0;
  queue.push(nfa);

  while (queue.length > 0) {
    const node = queue.shift();

    if (typeof node !== 'undefined') {
      node.index = n++;
      for (const arrow of node.next) {
        if (typeof arrow.to.index === 'undefined') {
          queue.push(arrow.to);
        }
      }
    } else {
      break;
    }
  }
};

const createVizStr = (nfa: NFA): string => {
  let ret = '';
  ret += `digraph G {\n`;

  nfa.ends.map((node) => {
    ret += `${node.index} [shape=doublecircle];\n`;
  });

  const pid = nfa.index;

  if (typeof pid === 'undefined') {
    throw 'undefined pid';
  }

  for (const arrow of nfa.next) {
    ret += createDot(pid, arrow);
  }

  ret += `}\n`;

  return ret;
};

const createDot = (pid: number, arrow: Arrow): string => {
  if (arrow.visited === true) {
    return '';
  }

  arrow.visited = true;
  let ret = '';

  const cid = arrow.to.index;

  if (typeof cid === 'undefined') {
    throw 'undefined pid';
  }

  ret += `${pid} -> ${cid} [label = "${
    arrow.char === '' ? 'ε' : arrow.char
  }"];\n`;

  for (const nextArrow of arrow.to.next) {
    ret += createDot(cid, nextArrow);
  }

  return ret;
};

// Test
const main = () => {
  // const testCases = ['abc', 'a|b|c', 'a*', '(a|b)*', '.*|(a|a)*'];
  // const testCases = ['.*|(a|a)*'];
  const testCases = ['a?b?'];

  for (const testCase of testCases) {
    console.log(`// TestCase: \'${testCase}\'`);
    const nfa = createNFA(testCase);
    const viz = createVizStr(nfa);
    console.log(viz);
  }
};

main();
