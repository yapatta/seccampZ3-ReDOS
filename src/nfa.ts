import { Node, Parser } from 'rerejs';

const testText = 'a|b';

export type NFA = AutomatonNode;

export type Arrow = {
  char: string;
  node: AutomatonNode;
};

export type AutomatonNode = {
  next: Array<Arrow>;
};

export const createNFA = (exp: string): void => {
  const parser = new Parser(exp);
  const pattern = parser.parse();

  const nfa = createAutomatonNode(pattern.child);
  // pattern.child.children.map((x) => console.log(x));
  console.log(nfa.next[0].node);
};

const createAutomatonNode = (node: Node): AutomatonNode => {
  switch (node.type) {
    case 'Disjunction':
      {
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
      break;
    case 'Sequence': {
      const seqNodes = node.children.map((child) => createAutomatonNode(child));

      for (let i = 0; i < seqNodes.length - 1; i++) {
        const before = seqNodes[i];
        const after = seqNodes[i + 1];
        before.next.push({ char: '', node: after } as Arrow);
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
