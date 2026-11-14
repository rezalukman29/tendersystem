import type { ISessionCredential } from "../../entities/interfaces/auth/ISessionCredential"

let activeCredential: ISessionCredential | undefined

export function getActiveCredential() {
  return activeCredential
}

export function setActiveCredential(credential?: ISessionCredential) {
  activeCredential = credential
}
