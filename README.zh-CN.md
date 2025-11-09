# FilNote FEVM API

[English Documentation](./README.md)

## 项目简介

基于 NestJS 框架构建的区块链验证服务，提供 Filecoin FEVM 网络上的安全文件上传和验证功能。该服务实现了两步验证流程：首先客户端获取临时验证 ID (verifyId)，然后使用该 ID 结合加密签名进行文件上传。服务通过验证链上权限和加密签名，确保只有授权的审计员才能上传文件。

## 功能特性

- 🔐 **两步验证流程**: 基于 UUID 签名的安全认证流程
- 📋 **审计员验证**: 通过链上智能合约验证审计员权限
- ✍️ **签名验证**: 加密签名验证，确保地址所有权
- 📁 **文件上传**: 支持 PDF 文件上传，限制大小（最大 512KB）
- 🌐 **IPFS 存储**: 集成 Pinata 实现去中心化文件存储，直接从内存上传
- 🔗 **智能合约集成**: 与 FEVM 上的 FilNote 智能合约交互
- 🛡️ **安全防护**: 内置速率限制、helmet 保护、输入验证和一次性 UUID 令牌
- 📊 **轻量数据库**: 使用 LowDB 存储临时验证数据，支持 TTL 过期机制
- ⚡ **高性能**: 内存直接上传到 IPFS，无需本地磁盘存储

## 技术栈

- **框架**: NestJS v11.0.1
- **语言**: TypeScript
- **区块链**: Ethers.js v6.15.0
- **存储**: Pinata (IPFS)，通过 HTTP API 使用 axios
- **数据验证**: class-validator、class-transformer、joi
- **安全**: helmet、express-rate-limit
- **数据库**: lowdb
- **HTTP 客户端**: axios、form-data
- **包管理器**: pnpm

## 项目结构

```
.
├── src/
│   ├── common/           # 通用服务（Pinata）
│   │   └── pinata.service.ts
│   ├── config/           # 配置文件
│   ├── filters/          # 异常过滤器
│   ├── interceptors/     # 响应拦截器
│   ├── utils/            # 工具类、ABI 和数据库辅助函数
│   │   ├── FilNoteABI.ts
│   │   ├── verify.service.utils.ts
│   │   └── lowdb.json
│   ├── verify/           # 核心验证模块
│   │   ├── dto/          # 数据传输对象
│   │   ├── verify.controller.ts
│   │   ├── verify.service.ts
│   │   └── verify.module.ts
│   ├── app.module.ts
│   └── main.ts
├── test/                 # 端到端测试
└── package.json
```

## 环境要求

- Node.js (推荐 v16 或更高版本)
- pnpm (包管理器)
- Filecoin FEVM RPC 端点
- 已部署在 FEVM 网络的 FilNote 智能合约
- Pinata 账户（包含 JWT 令牌和网关 URL）

## 安装

```bash
# 安装依赖
pnpm install
```

## 环境配置

在项目根目录创建 `.env.development` 和 `.env.production` 文件。可以从 `.env.example` 复制：

```env
# Node 环境
NODE_ENV=development

# 服务器端口
PORT=3000

# Filecoin FEVM RPC URL
RPC_URL=https://api.hyperspace.node.glif.io/rpc/v1

# FilNote 智能合约地址（40 个十六进制字符，以 0x 开头）
FIL_NOTE_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

# Pinata 配置
# 从 https://app.pinata.cloud/ 获取 JWT 令牌
PINATA_JWT=your_pinata_jwt_token_here
# Pinata 网关域名（例如：your-gateway.mypinata.cloud）
PINATA_GATEWAY=your-gateway.mypinata.cloud

# 可选：上传配置
# 最大文件大小（字节，默认：512KB）
UPLOAD_MAX_SIZE=524288

# 可选：上传目录（默认：uploads）
UPLOAD_DIR=uploads

# 可选：Verify ID TTL（毫秒，默认：5 分钟）
VERIFY_ID_TTL_MS=300000
```

## 运行应用

```bash
# 开发模式 (带热重载)
pnpm run dev

# 生产模式
pnpm run prod

# 构建项目
pnpm run build

# 标准启动
pnpm run start
```

## API 接口

### 获取验证 UUID

**GET** `/verify/get-verify-uuid/:address`

获取指定地址的临时验证 UUID。该 UUID 需要客户端使用私钥签名后，作为签名验证的明文。UUID 具有可配置的过期时间（默认：5 分钟），为一次性使用，文件上传成功后将被删除。

**参数:**

- `address`: 要获取 UUID 的以太坊地址

**响应:**

```json
{
  "status": 0,
  "message": "OK",
  "data": "550e8400-e29b-41d4-a716-446655440000"
}
```

**说明:**

- 如果该地址已存在有效的 UUID，将返回现有值（不会重新生成）
- 过期的 UUID 会自动清理
- UUID 为一次性使用，上传成功后会被删除
- 客户端需要对此 UUID 进行签名，在上传时提交签名

### 上传并验证文件

**POST** `/verify/upload`

上传 PDF 文件并进行全面验证。该接口执行多项安全检查：

1. **UUID 验证**: 从数据库获取该地址对应的 UUID 并验证是否过期
2. **签名验证**: 使用数据库中的 UUID 作为明文，验证签名是否由声明地址签发
3. **链上权限检查**: 通过智能合约验证地址是否为授权审计员
4. **文件上传**: 直接从内存通过 Pinata 将文件上传到 IPFS

**请求:**

- Content-Type: `multipart/form-data`
- 请求体:
  - `file`: PDF 文件（最大 512KB，必填）
  - `signature`: 对 UUID 的加密签名（0x 前缀的十六进制字符串，必填）
  - `address`: 以太坊地址（必填）

**签名生成示例 (JavaScript):**

```javascript
// 1. 获取 UUID
const response = await fetch(`/verify/get-verify-uuid/${address}`);
const { data: uuid } = await response.json();

// 2. 对 UUID 进行签名
const signature = await signer.signMessage(uuid);

// 3. 上传文件
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('signature', signature);
formData.append('address', address);
```

**响应:**

```json
{
  "status": 0,
  "message": "OK",
  "data": "bafkreiembdmqw4bfqgyw2jet7cpfi5oawnkuj7mwzr57gqgziom6yrwiry"
}
```

**注意:** 响应数据直接是 IPFS CID 字符串，而不是包装在对象中。

**错误响应:**

- `401 Unauthorized`: UUID 无效/过期、签名不匹配或不是审计员
- `400 Bad Request`: 缺少文件、无效文件类型或验证错误

**安全说明:**

- UUID 为**一次性使用**，上传成功后立即失效
- 只有 FilNote 智能合约中注册为审计员的地址才能上传文件
- 签名必须是对数据库中 UUID 的签名，且由对应地址签发
- 文件大小限制为 512KB
- 文件直接从内存上传，不在服务器磁盘留存

## 工作流程

典型的上传文件工作流程：

1. **获取 UUID**: 客户端调用 `GET /verify/get-verify-uuid/:address` 获取临时 UUID
2. **签名 UUID**: 客户端使用私钥对 UUID 进行签名（使用 `signMessage`）
3. **上传文件**: 客户端调用 `POST /verify/upload`，携带：
   - PDF 文件
   - 步骤 2 中生成的签名
   - 以太坊地址
4. **服务验证**: 服务端执行以下检查：
   - 从数据库获取该地址对应的 UUID
   - 使用 UUID 作为明文验证签名
   - 验证地址在链上是否为审计员
5. **IPFS 上传**: 如果所有检查通过，文件直接从内存通过 Pinata 上传到 IPFS
6. **UUID 失效**: 上传成功后，该地址的 UUID 立即从数据库删除
7. **响应**: 服务返回 IPFS CID

## 开发

```bash
# 格式化代码
pnpm run format

# 代码检查
pnpm run lint

# 运行单元测试
pnpm run test

# 运行端到端测试
pnpm run test:e2e

# 测试覆盖率
pnpm run test:cov

# 调试模式
pnpm run debug
```

## 安全特性

- **Helmet**: HTTP 头部安全防护
- **速率限制**: API 请求节流（每分钟 100 次请求）
- **输入验证**: 使用 class-validator 进行 DTO 验证
- **文件类型验证**: 仅允许 PDF 文件（MIME 类型、扩展名和文件头验证）
- **大小限制**: 强制 512KB 文件大小限制
- **签名验证**: 使用 ethers.js 进行加密签名验证，UUID 作为签名明文
- **链上权限检查**: 通过智能合约验证审计员状态
- **一次性令牌**: UUID 令牌为单次使用，上传后自动失效
- **TTL 管理**: 自动过期和清理过期的 UUID
- **内存上传**: 文件直接从内存上传，不在服务器留存，防止数据泄露

## 构建与部署

```bash
# 生产构建
pnpm run build

# 运行生产版本
pnpm run prod
```

生产构建输出到 `dist/` 目录。

## 环境变量

| 变量                        | 说明                  | 示例                                          |
| --------------------------- | --------------------- | --------------------------------------------- |
| `PORT`                      | 服务器端口            | `3300`                                        |
| `RPC_URL`                   | Filecoin RPC 端点     | `https://api.calibration.node.glif.io/rpc/v1` |
| `FIL_NOTE_CONTRACT_ADDRESS` | FilNote 智能合约地址  | `0xa07C...e05C`                               |
| `PINATA_JWT`                | Pinata JWT 令牌       | `eyJhbGc...`                                  |
| `PINATA_GATEWAY`            | Pinata 网关域名       | `your-gateway.mypinata.cloud`                 |
| `VERIFY_ID_TTL_MS`          | Verify ID TTL（毫秒） | `300000` (5 分钟)                             |

## 数据库

服务使用 LowDB 存储临时验证数据。数据库文件位于：

- 开发环境: `src/utils/lowdb.json`
- 生产环境: `utils/lowdb.json`

数据库存储以地址为键、UUID 及过期时间戳为值的映射关系。过期条目在访问时自动清理，上传成功后对应条目立即删除。

## 许可证

UNLICENSED

## 支持

如有问题或疑问，请在仓库中创建 issue。
