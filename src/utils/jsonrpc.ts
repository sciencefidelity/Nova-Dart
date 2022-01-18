import { EventEmitter } from "events"

type Request = {
  jsonrpc: string
  method: string
  params?: any
  id?: string | number | null
}

const DEFAULT_BUFFER_SIZE = 8192
const CR = Buffer.from("\r", "ascii")[0]
const LF = Buffer.from("\n", "ascii")[0]

const READ_EXIT_CODE = 50
const MISSING_ID_EXIT_CODE = 51

class JsonRpcBuffer extends EventEmitter {
  buffer: Buffer
  index: number
  headers: Map<any, any> | null
  body: string | null
  bodyLength: number | undefined

  constructor() {
    super()

    this.buffer = Buffer.allocUnsafe(DEFAULT_BUFFER_SIZE)
    this.index = 0
    this.headers = null
    this.body = null
  }

  append(data: number[]) {
    if (this.index + data.length >= this.buffer.length) {
      this.buffer = Buffer.concat(
        [this.buffer],
        this.buffer.length + Math.max(DEFAULT_BUFFER_SIZE, data.length)
      )
      this.buffer.set(data, this.index)
    } else {
      this.buffer.set(data, this.index)
    }

    this.index += data.length

    this.read()
  }

  read() {
    this.readHeaders()
    this.readBody()

    if (!this.body) return

    this.emit("request", this.headers, this.body)

    this.headers = null
    this.body = null
  }

  readHeaders() {
    if (this.headers) return

    let i = 0
    while (
      i < this.index + 1 &&
      (this.buffer[i] !== CR ||
        this.buffer[i + 1] !== LF ||
        this.buffer[i + 2] !== CR ||
        this.buffer[i + 3] !== LF)
    ) {
      i += 1
    }

    if (!this.buffer[i + 3]) return

    const headerArray = this.buffer.toString("ascii", 0, i).split("\r\n")
    const headers = new Map(
      headerArray.map((header: string) => {
        const [name, ...value] = header.split(":")
        return [name, value.join().trim()]
      })
    )

    this.headers = headers
    this.bodyLength = parseInt(this.headers.get("Content-Length"), 10)

    this.buffer = this.buffer.slice(i + 4)
    this.index -= i + 4
  }

  readBody() {
    if (!this.bodyLength) return
    if (this.index < this.bodyLength) return

    const data = this.buffer.toString("utf8", 0, this.bodyLength)
    this.body = JSON.parse(data)

    this.buffer = this.buffer.slice(this.bodyLength)
    this.index -= this.bodyLength
  }
}

export class JsonRpcService {
  readStream: any
  writeStream: any
  requestHandlers: Map<any, any>
  buffer: JsonRpcBuffer

  constructor(readStream: any, writeStream: any) {
    this.processRequest = this.processRequest.bind(this)
    this.readFromStream = this.readFromStream.bind(this)

    this.readStream = readStream
    this.writeStream = writeStream

    this.requestHandlers = new Map()

    this.buffer = new JsonRpcBuffer()
    this.buffer.on("request", this.processRequest)
    this.readStream.on("readable", this.readFromStream)
  }

  onRequest(method: string, handler: object) {
    this.requestHandlers.set(method, handler)
  }

  async readFromStream() {
    let chunk
    while ((chunk = this.readStream.read()) !== null) {
      try {
        this.buffer.append(chunk)
      } catch (err) {
        // TODO: Document error codes
        process.exit(READ_EXIT_CODE)
      }
    }
  }

  async processRequest(_header: string, request: Request) {
    if (!Object.prototype.hasOwnProperty.call(request, "id")) {
      process.exit(MISSING_ID_EXIT_CODE)
    }

    const handler = this.requestHandlers.get(request.method)
    if (!handler) {
      return this.sendError(request.id!, -32601, "Method not found")
    }

    try {
      const result = await handler(request.params)
      this.write({ result, id: request.id })
    } catch (err) {
      if (typeof err === "string") return { error: { message: err } }

      // this.write({
      //   id: request.id,
      //   result: {
      //     error: {
      //       name: err.name,
      //       message: err.message,
      //       stack: err.stack
      //     }
      //   }
      // })
    }
  }

  sendError(requestId: string | number | null, code: number, message: string) {
    this.write({
      id: requestId,
      error: {
        code,
        message
      }
    })
  }

  notify(method: string, params?: string) {
    this.write({ method, params })
  }

  write(data: object) {
    const responseString = JSON.stringify({ jsonrpc: "2.0", ...data })

    const responseBuffer = Buffer.from(responseString, "utf8")
    const headerBuffer = Buffer.from(
      `Content-Length: ${responseBuffer.length}\r\n\r\n`,
      "ascii"
    )
    this.writeStream.write(headerBuffer)
    this.writeStream.write(responseBuffer)
  }
}
