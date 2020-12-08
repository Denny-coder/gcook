##### 使用背景

> 开发人员在 cook beta 后, 没有 push 代码, 导致其他开发人员 cook beta 时, 代码不是最新的.
> 另外人员比较分散, 无法及时定位到相关的开发人员.
> 此时通过 Record Notification 历史记录功能可以快速定位开发人员, 及时通知开发人员上传代码.

##### 基于 cook 能力, 二次开发

- 作用: 搜集更多的组件发版信息

- 版本要求: cook@1.4.0, gcook@1.2.12

- 安装: npm install -g @choicefe/gcook cook-cli --registry=http://npm.choicesaas.cn

- 注意事项:

  - 组件发布前, 请先 commit 修改;

  - 发布组件时, 请使用 gcook 代替 cook, 例如: gcook beta, gcook publish 等等;
