import NodeRsa from "node-rsa";

const key = new NodeRsa({b: 1024});
console.log(key.exportKey('private'));
console.log('');
console.log(key.exportKey('public'));