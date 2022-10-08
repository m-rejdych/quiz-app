interface MemberInfo {
  email: string;
  image: null;
  name: string;
}

export interface Member {
  id: string;
  info: MemberInfo;
}

export type Members = Record<string, MemberInfo>;
