import type { IProfile } from "./IProfile"
import type { ISessionCredential } from "./ISessionCredential"

export interface IPersistedSession {
  version: 2
  environment: string
  credential: ISessionCredential
  profile: IProfile
}
