interface MemberInfo {
  email: string;
  image: null;
  name: string;
}

export interface Member {
  id: string;
  info: MemberInfo;
}

export interface MatchedMembers {
  spectators: Members;
  players: Members;
}

export type Members = Record<string, MemberInfo>;
