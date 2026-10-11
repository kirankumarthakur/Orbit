export type ConnectionStatus = "connected" | "disconnected" | "pending";

export type ConnectionItem = {
  id: "calendar" | "meet";
  label: string;
  status: ConnectionStatus;
};

export type AllConnections = {
  calendar: ConnectionItem;
  meet: ConnectionItem;
};

export type ConnectionInfo = AllConnections;

export type AgentActivityStage =
  | "thinking"
  | "tool_call"
  | "analyzing"
  | "generating"
  | "started"
  | "completed"
  | "error";

export type AgentActivity = {
  stage: AgentActivityStage;
  message: string;
  toolName?: string;
};
