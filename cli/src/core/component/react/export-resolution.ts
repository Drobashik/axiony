import ts from 'typescript';
import type { ComponentExportSelection } from '../types';

const isPascalCase = (value: string): boolean =>
  /^[A-Z][A-Za-z0-9]*$/.test(value);

const hasModifier = (
  node: ts.Node,
  kind: ts.SyntaxKind.ExportKeyword | ts.SyntaxKind.DefaultKeyword,
): boolean =>
  ts.canHaveModifiers(node) &&
  Boolean(ts.getModifiers(node)?.some((modifier) => modifier.kind === kind));

const isExported = (node: ts.Node): boolean =>
  hasModifier(node, ts.SyntaxKind.ExportKeyword);

const isDefaultExported = (node: ts.Node): boolean =>
  isExported(node) && hasModifier(node, ts.SyntaxKind.DefaultKeyword);

const exportedVariableNames = (statement: ts.VariableStatement): string[] =>
  statement.declarationList.declarations
    .map((declaration) =>
      ts.isIdentifier(declaration.name) ? declaration.name.text : undefined,
    )
    .filter((name): name is string => Boolean(name));

export const resolveReactComponentExport = (
  sourceText: string,
  filePath: string,
): ComponentExportSelection => {
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );

  const namedCandidates: string[] = [];

  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      return { kind: 'default', exportName: 'default' };
    }

    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement)) &&
      isDefaultExported(statement)
    ) {
      return { kind: 'default', exportName: 'default' };
    }

    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement)) &&
      isExported(statement) &&
      statement.name &&
      isPascalCase(statement.name.text)
    ) {
      namedCandidates.push(statement.name.text);
    }

    if (ts.isVariableStatement(statement) && isExported(statement)) {
      namedCandidates.push(
        ...exportedVariableNames(statement).filter(isPascalCase),
      );
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.exportClause &&
      ts.isNamedExports(statement.exportClause)
    ) {
      for (const element of statement.exportClause.elements) {
        const exportedName = element.name.text;
        const localName = element.propertyName?.text ?? exportedName;

        if (exportedName === 'default') {
          return { kind: 'default', exportName: 'default' };
        }

        if (isPascalCase(exportedName)) {
          namedCandidates.push(exportedName);
        } else if (isPascalCase(localName)) {
          namedCandidates.push(localName);
        }
      }
    }
  }

  const [firstCandidate] = namedCandidates;

  if (firstCandidate) {
    return { kind: 'named', exportName: firstCandidate };
  }

  throw new Error('no React component export found');
};
