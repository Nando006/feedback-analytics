import type { ChangeEvent } from "react";

export interface PropsFieldMainProducts {
  value: string;
  onChange: (value: string) => void;
}

export interface PropsFieldUsesCompanyProducts {
  checked: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export interface PropsFieldBusinessSummary {
  value: string;
  onChange: (value: string) => void;
}

export interface PropsFieldAnalyticsGoal {
  value: string;
  onChange: (value: string) => void;
}

export interface PropsFieldCompanyObjective {
  value: string;
  onChange: (value: string) => void;
}
