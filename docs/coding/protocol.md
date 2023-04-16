---
sidebar_position: 2
---

# 前后端交互与协议设计
本章将会主要介绍Neos前端与[srvpro后端](https://github.com/mycard/srvpro)的交互方式。

## 基于Websocket的全双工交互
Neos前端与srvpro后端在底层基于[Websocket](https://en.wikipedia.org/wiki/WebSocket)协议进行全双工通信。
在具体实现细节上Websocket以一个`Redux`中间件的形式在多页面间共享：
```ts title="src/middleware/socket.ts"
export enum socketCmd {
  // 建立长连接
  CONNECT,
  // 断开长连接
  DISCONNECT,
  // 通过长连接发送数据
  SEND,
}

export interface socketAction {
  cmd: socketCmd;
  // 创建长连接需要业务方传入的数据
  initInfo?: {
    ip: string;
    player: string;
    passWd: string;
  };
  // 通过长连接发送的数据
  payload?: Uint8Array;
}

let ws: WebSocket | null = null;
export default function (action: socketAction) {
  switch (action.cmd) {...}
}
```

## 前后端协议格式
在客户端ygopro和ygopro2的实现中，前后端交互的数据协议格式是裸buffer：
> 参考：https://www.icode9.com/content-1-1341344.html

```
 16bit packet_len     8bit proto          exdata_len  exdata
+------------------+---------------+-------------------------+
				   |-              data					    -|

其中第一部分为packet_len,长度2个字节,数值是 exdata_len + 1,即后面内容的长度总和
第二部分是 proto,长度1个字节, 表示后面 exdata 的类型
第三部分是 exdata,一些特定的proto会附带这部分内容,长度不定.上面提到的core传出来的buffer在这部分中

这个packet的最终长度是packet_len+2.
```

在Neos项目初期，发现这种数据协议格式给工程实现带来了比较大的困扰：
1. 难以理解：要想知道一个`packet`到底包含了什么信息，往往需要去扒ygopro的源代码；
2. 难以维护：如果要修改协议，一是后端需要考虑版本兼容，否则需要客户端强制升级；二是端上需要较大改动才能兼容新协议。

因此在Neos项目中，引入了一个`Adaptor`层，负责将裸buffer的packet转换成[protobuffer](https://protobuf.dev/)格式的对象，后续Neos将基于清晰明了的protobuffer对象进行所有涉及与srvpro后端交互的逻辑处理。

```ts title="src/api/ocgcore/ocgAdapter/adapter.ts"
/*
 * 将[`ygoProPacket`]对象转换成[`ygopro.YgoStocMsg`]对象
 *
 * @param packet - The ygoProPacket object
 * @returns The ygopro.YgoStocMsg object
 *
 * */
export function adaptStoc(packet: YgoProPacket): ygopro.YgoStocMsg {
  let pb = new ygopro.YgoStocMsg({});
  switch (packet.proto) {...}

  return pb;
}

```

这些protobuffer协议定义在[neos-protobuf](https://code.mycard.moe/mycard/neos-protobuf)仓库中。

**因此如果开发者们想了解Neos前端与srvpro后端的交互细节的话，阅读`neos-protobuf`项目即可。**

## 前后端交互逻辑
