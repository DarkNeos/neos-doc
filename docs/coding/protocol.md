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
整体上，前后端基于一些`MSG`进行交互。`MSG`分为两类，分别是`STOC_MSG`(Server To Client)和`CTOS_MSG`(Client To Server)。

在前后端交互中，基本上对局中所有的信息，包括卡片位置，连锁，伤害计算等，都是由后端传`STOC_MSG`给前端，前端负责进行展示；而一些依赖玩家行为的信息，比如是否发动某张卡的效果，选择上级/融合/同调/超量/链接召唤的素材等，需要前端将玩家的选择转换成`CTOS_MSG`并传给后端，后端进行效果处理。

:::tip
一个`STOC_MSG`的🌰：
```proto
// 卡牌位置移动
message MsgMove {
  int32 code = 1;        // 移动的卡牌code
  CardLocation from = 2; // 移动前的位置信息
  CardLocation to = 3;   // 移动后的位置信息
  int32 reason = 4;      // 移动的原因
}
```

一个`CTOS_MSG`的🌰：
```proto
// 卡片位置的选择结果
message SelectPlaceResponse {
  int32 player = 1; // 玩家编号
  CardZone zone = 2; // 区域编号
  int32 sequence = 3; // 序列号
}
```
:::tip

> 目前大部分的`MSG`在Neos中都适配了，但还遗留一部分未支持。如果在对局中遇到，界面上方会给出`unimplemented`提示。

:::info
->ccc@neos.moe: 后续找时间给`neos-protobuf/idl/ocgcore.proto`文件添加充足的注释，方便开发者们理解。
:::
