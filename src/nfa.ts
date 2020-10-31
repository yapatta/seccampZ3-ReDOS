import { Node, Parser } from 'rerejs';

const testText = '(a|b)*cd';

export type NFA = AutomatonNode;

export type Arrow = {
  char: string;
  node: AutomatonNode;
};

export type AutomatonNode = {
  isFirst: boolean;
  isEnd: boolean;
  char: string;
  next: Array<Arrow>;
};

export const createNFA = (exp: string): void => {
  const parser = new Parser(exp);
  const pattern = parser.parse();

  const origin: AutomatonNode = {
    isFirst: true,
    isEnd: false,
    char: '',
    next: [],
  };

  createAutomatonNode(origin, pattern.child, false, true);
  // pattern.child.children.map((x) => console.log(x));
  console.log(typeof pattern.child);
};

const createAutomatonNode = (
  origin: AutomatonNode,
  addition: Node,
  isFirst: boolean,
  isEnd: boolean,
): AutomatonNode => {
  switch (addition.type) {
    case 'Disjunction':
      break;
    case 'Sequence':
      /*
      addition.children.map((val) => {
         const newNode = createAutomatonNode(origin, val, isFirst, isEnd);
         origin.next.push({
            char: addition.raw,
            node: newNode,
          } as Arrow)
      }
      */
      break;
    case 'Char':
      const newNode: AutomatonNode = {
        isFirst: isFirst,
        isEnd: isEnd,
        char: addition.raw,
        next: [],
      };

      origin.next.push({
        char: addition.raw,
        node: newNode,
      } as Arrow);

      break;
  }

  return origin;
};

// Test
createNFA(testText);
