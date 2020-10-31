import { Node, Parser } from 'rerejs';

const testText = '(a|b)*cd';

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

  createAutomatonNode(pattern);
  // pattern.child.children.map((x) => console.log(x));
  console.log(typeof pattern.child);
};

const createAutomatonNode = (node: Node): AutomatonNode => {
  switch (node.type) {
    case 'Disjunction':
      break;
    case 'Sequence': {
    }
    case 'Char': {
      const nextNodes: AutomatonNode = { next: [] };
      const arrow: Arrow = { char: node.raw, node: nextNodes };
      const nowNodes: AutomatonNode = { next: [arrow] };

      return nowNodes;
    }
  }
};

// Test
createNFA(testText);
