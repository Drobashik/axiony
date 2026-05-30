/**
 * A typed AST for terminal lines so we never have to dangerously inject
 * raw HTML into the DOM. Each line is a list of tokens, each token has a
 * style class (`prompt`, `cmd`, `success`, ...).
 */

export type TerminalTokenKind =
  | "prompt"
  | "cmd"
  | "comment"
  | "output"
  | "success"
  | "error"
  | "warn"
  | "blue"
  | "dim"
  | "syn-keyword"
  | "syn-string"
  | "syn-number"
  | "syn-comment"
  | "syn-prop"
  | "syn-fn"
  | "syn-punct";

export interface TerminalToken {
  kind?: TerminalTokenKind;
  text: string;
}

export type TerminalLine = TerminalToken[];

/** Convenience constructor for short, single-token lines. */
export const txt = (text: string, kind?: TerminalTokenKind): TerminalToken => ({
  kind,
  text,
});

/** A blank line — rendered as an empty row. */
export const blank: TerminalLine = [];
