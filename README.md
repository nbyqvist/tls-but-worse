# TLS but worse
This repository implements a client and server that verify messages using rsa key signatures. The messages are transmitted in base64 encoded plain text.

This example uses HTTP, but the idea could be extended to use non-HTTP transports.

The example provided allows the "client" to execute a shell command on the "server".

## Applications
- Closed (private) networks
- Transports other than HTTP (sockets, serial, etc.)

## Example
- A client wants to send a message to a server
- The client creates a message like the following:
```jsonc
{
    "destId": "server", // The identifier of the server
    "sourceId": "client", // The identifier of the client
    "message": "...", // The message, encoded as a base64 string
    "sig": "...", // The signature of the above message with the client's private key
}
```
- The server recieves the message and uses the `sourceId` of the message to choose which public key to use to verify the signature
- If the signature is successfully verified, the server processes the message and generates a response
- The server then sends back a message to the client like the following:
```jsonc
{
    "destId": "client", // The message is from the server, so the client is the destination
    "sourceId": "server", // The message is from the server
    "message": "...", // The response to the client's original message encoded as a base64 string
    "sig": "...", // The signature of the above message signed with the server's private key
}
```
- The client receives the message from the server and verifies the response with the server's public key.