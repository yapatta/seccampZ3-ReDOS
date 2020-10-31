import { Node, Parser } from 'rerejs';

const testText = 'abc';

export type NFA = AutomatonNode;

export type Arrow = {
  char: string;
  node: AutomatonNode;
};

export type AutomatonNode = {
  next: Array<Arrow>;
};

const recursivePush = (before: AutomatonNode, after: AutomatonNode): void => {
  if (before.next.length > 0) {
    for (let i = 0; i < before.next.length; i++) {
      recursivePush(before.next[i].node, after);
    }
  } else {
    before.next.push({ char: '', node: after } as Arrow);
  }
};

export const createNFA = (exp: string): void => {
  const parser = new Parser(exp);
  const pattern = parser.parse();

  const nfa = createAutomatonNode(pattern.child);
  console.log(nfa.next[0].node.next[0].node.next[0].node.next[0].node);
};

const createAutomatonNode = (node: Node): AutomatonNode => {
  switch (node.type) {
    case 'Disjunction': {
      const nextNodes = node.children.map((child) =>
        createAutomatonNode(child),
      );

      const nowNode: AutomatonNode = { next: [] };

      nextNodes.map((nn) => {
        const arrow: Arrow = { char: '', node: nn };
        nowNode.next.push(arrow);
      });

      return nowNode;
    }
    case 'Sequence': {
      const seqNodes = node.children.map((child) => createAutomatonNode(child));

      for (let i = 0; i < seqNodes.length - 1; i++) {
        const before = seqNodes[i];
        const after = seqNodes[i + 1];

        // need to push recursively
        recursivePush(before, after);
      }

      return seqNodes[0];
    }
    case 'Char': {
      const nextNode: AutomatonNode = { next: [] };
      const arrow: Arrow = { char: node.raw, node: nextNode };
      const nowNode: AutomatonNode = { next: [arrow] };

      return nowNode;
    }
  }
  return {} as AutomatonNode;
};

// Test
createNFA(testText);
