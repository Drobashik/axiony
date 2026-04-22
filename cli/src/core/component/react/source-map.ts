import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { originalPositionFor, TraceMap, type SourceMapInput } from '@jridgewell/trace-mapping';

const formatSourcePath = (source: string, sourceMapPath: string): string => {
  if (source.startsWith('file://')) {
    return fileURLToPath(source);
  }

  const decodedSource = decodeURI(source);

  if (isAbsolute(decodedSource) || /^[A-Za-z]:\//.test(decodedSource)) {
    return normalize(decodedSource);
  }

  return resolve(dirname(sourceMapPath), decodedSource);
};

const isRelevantSource = (source: string): boolean =>
  !source.includes('node_modules') && !source.endsWith('entry.tsx');

export const mapStackToOriginalLocation = async (
  stack: string | undefined,
  sourceMapPath: string,
): Promise<string | undefined> => {
  if (!stack) {
    return undefined;
  }

  const sourceMap = JSON.parse(await readFile(sourceMapPath, 'utf8')) as SourceMapInput;
  const traceMap = new TraceMap(sourceMap);
  const framePattern = /bundle\.js:(\d+):(\d+)/g;
  let match: RegExpExecArray | null;

  while ((match = framePattern.exec(stack)) !== null) {
    const line = Number(match[1]);
    const column = Number(match[2]);
    const original = originalPositionFor(traceMap, {
      line,
      column: Math.max(0, column - 1),
    });

    if (original.source && original.line !== null && isRelevantSource(original.source)) {
      return `${formatSourcePath(original.source, sourceMapPath)}:${original.line}:${(original.column ?? 0) + 1}`;
    }
  }

  return undefined;
};
