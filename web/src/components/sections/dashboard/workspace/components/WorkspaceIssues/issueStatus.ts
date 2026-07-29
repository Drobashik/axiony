import type { SelectOption } from "@/components/ui";
import type { IssueStatus } from "@/lib/workspace";

interface StatusMeta {
  value: IssueStatus;
  label: string;
  color: string;
}

export const ISSUE_STATUSES: StatusMeta[] = [
  { value: "open", label: "Open", color: "var(--severity-serious)" },
  { value: "in-progress", label: "In progress", color: "var(--blue)" },
  { value: "resolved", label: "Resolved", color: "var(--green)" },
  { value: "ignored", label: "Ignored", color: "var(--text-muted)" },
];

const BY_VALUE = new Map(ISSUE_STATUSES.map((s) => [s.value, s]));

export const statusMeta = (status: IssueStatus): StatusMeta =>
  BY_VALUE.get(status) ?? ISSUE_STATUSES[0];

export const STATUS_OPTIONS: SelectOption[] = ISSUE_STATUSES.map((s) => ({
  value: s.value,
  label: s.label,
  color: s.color,
}));
