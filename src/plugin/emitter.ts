/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ts from 'typescript';
import { moduleExists } from './module-exists';
import { tsBinary } from './ts-loader';
import { Key, ModifiersMetadata } from '../meta-type';

type TypedNode = Pick<ts.ParameterDeclaration, 'type'>;

type NodeWithParameters = Pick<ts.MethodDeclaration, 'parameters'>;

function addRef(
  p: TypedNode,
  imports: Map<any, any>,
  mustImport: Set<unknown>,
) {
  if (p.type) {
    const ref = imports.get(p.type.getText());
    if (ref) mustImport.add(ref);
  }
}

function* emitPropertyAssignments(obj: Record<Key, boolean>) {
  for (const k in obj) {
    if (k in obj) {
      yield tsBinary.factory.createPropertyAssignment(
        k,
        obj[k] ? tsBinary.factory.createTrue() : tsBinary.factory.createFalse(),
      );
    }
  }
}

function getProperties(node: ts.HasModifiers): ts.ObjectLiteralElementLike[] {
  const modifiers = new Set<ts.Modifier['kind']>();
  for (const modifier of tsBinary.getModifiers(node) ?? []) {
    modifiers.add(modifier.kind);
  }
  const access = {
    private: modifiers.has(ts.SyntaxKind.PrivateKeyword),
    protected: modifiers.has(ts.SyntaxKind.ProtectedKeyword),
  };
  const properties: ModifiersMetadata = {
    exported: modifiers.has(ts.SyntaxKind.ExportKeyword),
    ...access,
    public: !access.private && !access.protected,
    readonly: modifiers.has(ts.SyntaxKind.ReadonlyKeyword),
    static: modifiers.has(ts.SyntaxKind.StaticKeyword),
    abstract: modifiers.has(ts.SyntaxKind.AbstractKeyword),
    accessor: modifiers.has(ts.SyntaxKind.AccessorKeyword),
    async: modifiers.has(ts.SyntaxKind.AsyncKeyword),
    const: modifiers.has(ts.SyntaxKind.ConstKeyword),
    override: modifiers.has(ts.SyntaxKind.OverrideKeyword),
  };
  return [
    ...emitPropertyAssignments(properties as unknown as Record<Key, boolean>),
  ];
}

function addParameterRefs(
  node: NodeWithParameters,
  imports: Map<any, any>,
  mustImport: Set<unknown>,
) {
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
            tsBinary.isMethodDeclaration(node) ||
            tsBinary.isPropertyDeclaration(node) ||
            tsBinary.isClassDeclaration(node)
          ) {
            let identifier: string;
            const modifiers = getProperties(node);
            if (!tsBinary.isClassDeclaration(node)) {
              if (node.type) addRef(node, imports, mustImport);
              if (tsBinary.isMethodDeclaration(node)) {
                addParameterRefs(node, imports, mustImport);
                identifier = 'registerMethodMetadata';
              } else {
                identifier = 'registerPropertyMetadata';
              }
            } else {
              identifier = 'registerClassMetadata';
              for (const member of node.members) {
                if (tsBinary.isConstructorDeclaration(member)) {
                  addParameterRefs(member, imports, mustImport);
                  break;
                }
              }
            }
            const requireCall = tsBinary.factory.createCallExpression(
              tsBinary.factory.createIdentifier('require'),
              undefined,
              [
                tsBinary.factory.createStringLiteral(
                  'nestjs-auto-reflect-metadata-emitter/plugin',
                ),
              ],
            );
            const decoratorAccess = tsBinary.factory.createPropertyAccessChain(
              requireCall,
              undefined,
              tsBinary.factory.createIdentifier(identifier),
            );
            const decoratorCall = tsBinary.factory.createCallExpression(
              decoratorAccess,
              undefined,
              [tsBinary.factory.createObjectLiteralExpression(modifiers)],
            );
            const decorator = tsBinary.factory.createDecorator(decoratorCall);
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
          if (
            tsBinary.isImportClause(node) &&
            mustImport.has(node) &&
            moduleExists(sf, (node.parent.moduleSpecifier as any).text)
          ) {
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
