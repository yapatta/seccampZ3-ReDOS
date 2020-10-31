import { Node, Parser } from 'rerejs';

export type NFA = AutomatonNode;

export type Arrow = {
  char: string;
  to: AutomatonNode;
};

export type AutomatonNode = {
  next: Array<Arrow>;
  isEnd: boolean;
};

const recursivePush = (before: AutomatonNode, after: AutomatonNode): void => {
  if (before.next.length > 0) {
    for (let i = 0; i < before.next.length; i++) {
      recursivePush(before.next[i].to, after);
    }
  } else {
    before.next.push({ char: '', to: after } as Arrow);
  }
};

export const createNFA = (exp: string): NFA => {
  const parser = new Parser(exp);
  const pattern = parser.parse();
  const endNode: AutomatonNode = { next: [], isEnd: true };
  const nfa = createAutomatonNode(pattern.child, true, endNode);

  return nfa;
};

const createAutomatonNode = (
  node: Node,
  isEnd: boolean,
  endNode: AutomatonNode,
): AutomatonNode => {
  switch (node.type) {
    case 'Capture': {
      return createAutomatonNode(node.child, isEnd, endNode);
    }
    case 'Disjunction': {
      const nextNodes = node.children.map((child, index) =>
        createAutomatonNode(
          child,
          index === node.children.length - 1 ? isEnd : false,
          endNode,
        ),
      );

      const nowNode: AutomatonNode = { next: [], isEnd: isEnd };

      nextNodes.map((nn) => {
        const arrow: Arrow = { char: '', to: nn };
        nowNode.next.push(arrow);
      });

      return nowNode;
    }
    case 'Sequence': {
      const seqNodes = node.children.map((child, index) =>
        createAutomatonNode(
          child,
          index === node.children.length - 1 ? isEnd : false,
          endNode,
        ),
      );

      for (let i = 0; i < seqNodes.length - 1; i++) {
        const before = seqNodes[i];
        const after = seqNodes[i + 1];

        // need to push recursively
        recursivePush(before, after);
      }

      return seqNodes[0];
    }
    case 'Many': {
      // FIXME: recursivePushでエラー(同じやつをpushすると永遠に食べてしまう)
      const nextNode: AutomatonNode = isEnd
        ? endNode
        : { next: [], isEnd: false };

      const repeatNode = createAutomatonNode(node.child, false, endNode);
      recursivePush(repeatNode, repeatNode);
      recursivePush(repeatNode, nextNode);

      const toRepeatNodeArrow: Arrow = {
        char: '',
        to: repeatNode,
      };
      const nowToNextarrow: Arrow = {
        char: '',
        to: nextNode,
      };

      const nowNode: AutomatonNode = {
        next: [toRepeatNodeArrow, nowToNextarrow],
        isEnd: false,
      };

      return nowNode;
    }
    case 'Dot': {
      const nextNode: AutomatonNode = isEnd
        ? endNode
        : { next: [], isEnd: false };
      const arrow: Arrow = { char: '∑', to: nextNode };
      const nowNode: AutomatonNode = { next: [arrow], isEnd: false };

      return nowNode;
    }
    case 'Char': {
      const nextNode: AutomatonNode = isEnd
        ? endNode
        : { next: [], isEnd: false };
      const arrow: Arrow = { char: node.raw, to: nextNode };
      const nowNode: AutomatonNode = { next: [arrow], isEnd: false };

      return nowNode;
    }
  }

  throw 'Cannnot Parse!!';
};

const createVizStr = (nfa: NFA): string => {
  let count = 0;
  const getId = () => count++;

  let ret = '';
  ret += `digraph G {\n`;

  const pid = getId();
  for (const arrow of nfa.next) {
    ret += createDot(pid, arrow, getId);
  }

  ret += `}\n`;

  return ret;
};

const createDot = (pid: number, arrow: Arrow, getId: () => number): string => {
  let ret = '';

  const cid = getId();

  ret += `${pid} -> ${cid} [label = "${
    arrow.char === '' ? 'ε' : arrow.char
  }"];\n`;

  for (const nextArrow of arrow.to.next) {
    ret += createDot(cid, nextArrow, getId);
  }

  return ret;
};

// Test
const main = () => {
  const testCases = ['abc', 'a|b|c', 'a*'];
  // const testCases = ['a*'];

  for (const testCase of testCases) {
    const nfa = createNFA(testCase);
    const viz = createVizStr(nfa);
    console.log(viz);
  }
};

main();
