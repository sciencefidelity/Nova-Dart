export interface Element {
  title: string
  value: string
  readonly identifier: string
}

export interface ColorStrings {
  [key: string]: Color
}

export interface Notification<T> {
  event: string;
  params: T;
}

export interface UnknownNotification extends Notification<any> { }
