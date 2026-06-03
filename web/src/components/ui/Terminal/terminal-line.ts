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

export const txt = (text: string, kind?: TerminalTokenKind): TerminalToken => ({
  kind,
  text,
});

export const blank: TerminalLine = [];
