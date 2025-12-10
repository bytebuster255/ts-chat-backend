import { Socket } from "socket.io";

export function withJson<T>(
  handler: (msg: T, socket: Socket) => void | Promise<void>
) {
  return async function (this: Socket, raw: any) {
    try {
      const parsed: T =
        typeof raw === "string" ? JSON.parse(raw) : (raw as T);

      await handler(parsed, this);
    } catch (err) {
      console.error("JSON parse error:", err);
    }
  };
}
