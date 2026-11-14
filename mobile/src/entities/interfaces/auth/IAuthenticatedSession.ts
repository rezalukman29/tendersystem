import type { IProfile } from "./IProfile"
import type { ISessionCredential } from "./ISessionCredential"

export interface IAuthenticatedSession {
  credential: ISessionCredential
  profile: IProfile
}
