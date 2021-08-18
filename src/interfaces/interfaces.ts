export interface Element {
  title: string
  value: string
  readonly identifier: string
}

export interface ColorStrings {
  [key: string]: Color
}

export interface Message {
  event: string
  params?: {
    appId?: string | undefined
    pid?: number | undefined
    wsUri?: string | undefined
  }
}

export interface Notification<T> {
  event: string
  params: T
}

export interface UnknownNotification extends Notification<any> {}
