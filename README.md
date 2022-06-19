# nest-admin-template

### 介绍

一个基于nest开发的后台管理系统模版，支持常见的功能

### 软件功能

- [x] swagger接口文档
- [x] typeorm/redis集成
- [x] jwt授权（token/cookie）
- [x] 异常处理
- [x] 文件上传
- [x] 邮件发送
- [x] 三方授权（gitee/gitlab/github/feishu）

将来规划的部分

- [ ] 角色权限管理
- [ ] 账号绑定三方平台

#### 异常处理

HTTP错误返回

```typescript
interface SuccessResp {
  status: 0,
  message: String
}
```

其他例如Error，Promise.reject()等返回

```typescript
interface ErrorResp {
  status: 1,
  message: String
}
```

#### 响应数据转化

```json
{
  "status": 0,
  "message": "OK",
  "data": "响应数据"
}
```
#### 三方授权

配置环境变量，仓库根目录下面的.env文件

```dotenv
# 监听端口
LISTEN_PORT=3000
# ======================== swagger ========================
# swagger文档路径
SWAGGER_URL=api/swagger
# 关闭swagger，生产环境建议关闭
SWAGGER_OFF=false
# ======================== jwt配置 ========================
JWT_SECRET=thisassecret111
JWT_EXPIRATION_TIME=2h
# ======================== redis配置 ========================
REDIS_HOST=localhost
REDIS_PORT=6379
# ======================== 邮箱模块配置 ========================
MAIL_HOST=smtp.qq.com
MAIL_PORT=465
MAIL_USER=
MAIL_PASS=
MAIL_FROM=
# ======================== 文件上传 ========================
# 上传文件的路径;如果不是/开头，则认为是相对于项目根目录
UPLOAD_PATH=upload
# 文件上传大小限制,单位M
FILE_SIZE_LIMIT=10
# 上传文件支持的类型；为空不做限制
FILE_TYPE_LIMIT=image,json
# ======================== 数据库配置 ========================
DB_HOST=localhost
DB_PORT=3306
DB_USER=nest
DB_PASS=nest
DB_NAME=nest
# ======================== Gitlab v8 登录 ========================
GITLAB_URL=
GITLAB_CLIENT_ID=
GITLAB_CLIENT_SECRET=
GITLAB_REDIRECT_URL=

# ======================== github配置 ========================
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_REDIRECT_URL=

# ======================== 飞书配置 ========================
FEISHU_CLIENT_ID=
FEISHU_CLIENT_SECRET=
FEISHU_REDIRECT_URL=

# ======================== 码云配置 ========================
GITEE_CLIENT_ID=
GITEE_CLIENT_SECRET=
GITEE_REDIRECT_URL=

# 登录完成的前端回调
FRONT_URL=
```

### 开发指南

#### 环境要求

- Node.js 14+
- MySQL 5.6+
- Redis

#### 开始开发

1、下载仓库

```bash
git clone git@github.com:gslnzfq/nest-admin-templete.git
```

2、修改配置文件

在项目的根目录创建.env.local，写入自己开发环境的配置，mysql和redis的配置必须填写，要是联调三方授权，需要在需要的平台创开发者账号进行配置

3、安装依赖，启动项目

```
yarn
yarn start:dev
```
