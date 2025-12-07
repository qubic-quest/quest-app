"use client";

import type { FC, PropsWithChildren } from "react";
import { useAssistantState } from "@assistant-ui/react";

type UseAssistantIfProps = {
  condition: AssistantIf.Condition;
};

const useAssistantIf = (props: UseAssistantIfProps) => {
  return useAssistantState(props.condition);
};

export namespace AssistantIf {
  export type Props = PropsWithChildren<UseAssistantIfProps>;
  export type Condition = (state: any) => boolean;
}

export const AssistantIf: FC<AssistantIf.Props> = ({ children, condition }) => {
  const result = useAssistantIf({ condition });
  return result ? children : null;
};

AssistantIf.displayName = "AssistantIf";
