export type AgentStatus = 'active' | 'inactive';

export type Agent = {
  id: string;
  name: string;
  job: string;
  chain: string;
  status: AgentStatus;
  avatarColor: string;
};