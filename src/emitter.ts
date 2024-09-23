/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ts from 'typescript';
import { moduleExists } from './module-exists';
import { tsBinary } from './ts-loader';

function isStatic(
  node: ts.MethodDeclaration | ts.ClassDeclaration | ts.PropertyDeclaration,
) {
  return node.modifiers?.find((x) => x.kind === ts.SyntaxKind.StaticKeyword);
}

type TypedNode = Pick<ts.ParameterDeclaration, 'type'>;

type NodeWithParameters = Pick<ts.MethodDeclaration, 'parameters'>;

function addRef(p: TypedNode, imports: Map<any, any>, mustImport: Set<unknown>) {
  if (p.type) {
    const ref = imports.get(p.type.getText());
    if (ref) mustImport.add(ref);
  }
}

function addParameterRefs(node: NodeWithParameters, imports: Map<any, any>, mustImport: Set<unknown>) {
for (const p of node.parameters) {
  addRef(p, imports, mustImport);
}
}
export function before() {
  return (ctx: ts.TransformationContext): ts.Transformer<any> => {
    return (sf: ts.SourceFile) => {
      const imports = new Map();
      const mustImport = new Set();
      const visitNode = (node: ts.Node) => {
        try {
          if (tsBinary.isImportClause(node)) {
            const { namedBindings } = node;
            if (namedBindings) {
              for (const item of ts.isNamedImports(namedBindings)
                ? namedBindings.elements
                : []) {
                imports.set(item.name.getText(), node);
              }
            }
          } else if (
            (tsBinary.isMethodDeclaration(node) ||
              tsBinary.isPropertyDeclaration(node) ||
              tsBinary.isClassDeclaration(node)) &&
            !tsBinary.getDecorators(node)?.length &&
            !isStatic(node)
          ) {
            const decorator = tsBinary.factory.createDecorator(
              tsBinary.factory.createCallExpression(
                tsBinary.factory.createIdentifier('require'),
                undefined,
                [
                  tsBinary.factory.createStringLiteral(
                    'nestjs-auto-reflect-metadata-emitter/dist/simple-decorator',
                  ),
                ],
              ),
            );
            if (!tsBinary.isClassDeclaration(node)) {
              if (node.type) addRef(node, imports, mustImport);
              if (tsBinary.isMethodDeclaration(node)) {
                  addParameterRefs(node, imports, mustImport);
              }
            } else {
              for (const member of node.members) {
                if (tsBinary.isConstructorDeclaration(member)) {
                  addParameterRefs(member, imports, mustImport);
                  break;
                }
              }
            }
            node = tsBinary.factory.replaceDecoratorsAndModifiers(node, [
              ...(node.modifiers ?? []),
              decorator,
            ]);
            return tsBinary.isClassDeclaration(node)
              ? tsBinary.visitEachChild(node, visitNode, ctx)
              : node;
          }
          return tsBinary.visitEachChild(node, visitNode, ctx);
        } catch (err) {
          console.log(err.stack);
          return node;
        }
      };
      const processImports = (node: ts.Node) => {
        try {
          if (tsBinary.isImportClause(node) && mustImport.has(node) && moduleExists(sf, (node.parent.moduleSpecifier as any).text)) {
            const { namedBindings } = node;
            if (namedBindings) {
              // Hack: if a import is flagged as transient and has links.referenced = true,
              // typescript will be forced to emit its import during transpiling.
              // Maybe there's a cleaner way to do it.
              for (const item of ts.isNamedImports(namedBindings)
                ? namedBindings.elements
                : []) {
                (item as any).symbol.flags |= 33554432 /* Transient */;
                (item as any).symbol.links = { referenced: true };
                break;
              }
            }
            return tsBinary.factory.updateImportClause(
              node,
              false,
              node.name,
              node.namedBindings,
            );
          }
          return tsBinary.visitEachChild(node, processImports, ctx);
        } catch (err) {
          console.log(err.stack);
          return node;
        }
      };
      const nodeResult = tsBinary.visitNode(sf, visitNode);
      return tsBinary.visitNode(nodeResult, processImports);
    };
  };
}

export function simpleDecorator() {
  //
}
