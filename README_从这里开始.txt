黄灿个人网站｜从这里开始
=========================

这个项目包含：
- 个人主页：关于我、性格、实验室兴趣、决心、经历与作品、联系方式
- 管理员登录后编辑网站文案、项目列表和头像
- 访客无需注册即可查看、留言、回复
- 所有新留言/回复默认待审核；管理员批准后公开
- 管理员可删除留言；删除父留言时会一并删除其回复
- Supabase 数据库保存内容；Vercel 托管网页

重要说明
--------
1. 这是一个需要完成 Supabase 配置后才能使用留言、登录和云端编辑的完整项目模板，不是只在浏览器本地保存的演示版。
2. 目前代码/数据库结构尚未在你的 Supabase 项目中执行，因此不能声称已经上线或已通过你的环境测试。
3. 绝不要把 Supabase service_role / secret key 放入 config.js，也不要把管理员密码发给任何人。
4. 首页文案是示例，请按自己的真实经历修改；不要编造科研经历、实验技能或项目成果。
5. 免费计划的配额、休眠策略和服务政策可能变化。重要留言请定期备份。
6. 留言是公开内容；不要在网页上收集不必要的敏感个人信息。上线前请测试滥用防护与审核流程。

A. 需要准备的账号
----------------
- Supabase：https://supabase.com/
- Vercel：https://vercel.com/
- GitHub（推荐用于部署）：https://github.com/

B. 配置 Supabase
----------------
1. 登录 Supabase，创建一个新项目。设置一个强数据库密码并自行保管。
2. 进入项目的 SQL Editor，点击 New query。
3. 打开本文件夹中的 supabase_setup.sql，复制全部内容，粘贴到 SQL Editor，点击 Run。
4. 打开 Authentication -> Users，创建/邀请一个仅你自己使用的管理员用户。
   - 关闭公开注册（在 Authentication 的 Sign In / Providers 或用户注册设置中关闭新用户注册；界面名称可能随版本变化）。
   - 设定强密码，最好为专用且不重复使用的密码。
5. 在 Authentication -> Users 中复制你这个用户的 UUID。
6. 回到 SQL Editor，运行下面语句，把 UUID 替换为你的真实 UUID（保留单引号）：
   insert into public.site_admins (user_id) values ('把管理员UUID放这里');
   注意：这条语句只在首次配置时运行一次。不要把 UUID 当密码；但也不要公开你的登录信息。
7. 打开 Project Settings -> API（或 Connect/API Keys 页面），复制 Project URL 与 publishable key。
   老项目可能显示 anon key，也可用 anon key。绝对不要复制 service_role/secret key 到前端。
8. 在 VS Code 打开 config.js，把两项填入引号内：
   SUPABASE_URL: "https://你的项目.supabase.co",
   SUPABASE_ANON_KEY: "你的 publishable/anon 公钥"
9. 保存 config.js。不要在聊天中发送这些值。publishable/anon key 本身是客户端公开键，但必须配合本项目的 RLS 策略使用。

C. 先在本地检查页面
------------------
1. 推荐安装 VS Code 扩展 Live Server（只从 VS Code 扩展市场安装）。
2. 在 VS Code 中右键 index.html -> Open with Live Server。
   不要只依赖双击文件打开；通过本地 HTTP 地址测试更接近线上环境。
3. 打开页面，检查个人介绍和项目卡片。
4. 点击右上角圆形箭头按钮进入管理员入口，使用你创建的邮箱和密码登录。
5. 在“编辑主页”里修改文案，点击保存所有主页内容。
6. 上传一张小于 3 MB 的 JPG/PNG/WebP 头像。
7. 从无痕窗口访问本地网站，提交一条测试留言；它应显示“等待审核”，普通访客看不到。
8. 管理员登录 -> 留言审核 -> 批准公开。刷新无痕窗口后，留言应出现。
9. 测试回复：公开留言 -> 回复这条留言 -> 提交 -> 管理员审核 -> 批准公开。
10. 测试删除一条测试留言，确认对应回复也被删除。

D. 发布到互联网（推荐 GitHub + Vercel）
--------------------------------------
1. 注册/登录 GitHub，创建一个新的 Private repository（私有仓库更适合存放个人项目源文件）。
2. 把 index.html、styles.css、app.js、config.js、supabase_setup.sql、README_从这里开始.txt 放入仓库。
   注意：config.js 含项目 URL 与公开 publishable key；不要把任何 service_role/secret key 放入仓库。
3. 登录 Vercel，选择 Add New -> Project，导入刚创建的 GitHub 仓库。
4. 这是纯静态网页项目，通常不需要 Build Command；Output Directory 设为项目根目录（或留空/按 Vercel 对静态站点的识别结果）。
5. 点击 Deploy，成功后 Vercel 会给出一个 *.vercel.app 网址。
6. 在这个线上网址上重复 C 部分的测试。不要只验证本地版本。
7. 若之后修改代码并推送到 GitHub，Vercel 通常会自动重新部署。

E. 你必须完成的上线检查
----------------------
[ ] config.js 已填入正确的 URL 和 publishable/anon key
[ ] SQL 已在 Supabase 成功执行，无报错
[ ] 只有你自己的用户存在于 site_admins
[ ] 已关闭公开注册，管理员强密码已设置
[ ] 未将 service_role/secret key 放入前端
[ ] 未登录访客只能读取已审核留言
[ ] 未登录访客不能批准、编辑或删除留言
[ ] 访客新留言和回复都默认为待审核
[ ] 管理员可以批准、删除留言并编辑主页
[ ] 头像上传限制为图片且最大 3 MB
[ ] 刷新网页后内容和留言仍保留
[ ] 手机屏幕显示正常
[ ] 网站联系方式是你愿意公开的信息
[ ] 你确认所有自我介绍内容真实、准确、不过度夸大

F. 常见问题
------------
- 页面显示“留言板尚未连接数据库”：检查 config.js 是否填写正确、浏览器是否能访问 Supabase。
- 登录成功但提示未加入管理员名单：确认你已把正确的 Auth 用户 UUID 插入 site_admins。
- 管理员能登录但无法保存：回 SQL Editor 检查脚本是否完整执行，并确认当前用户在 site_admins。
- 留言提交失败：确认 supabase_setup.sql 执行成功；查看浏览器开发者工具 Console/Network 中的错误。
- 头像上传失败：确认 Storage 中有 avatars 桶、管理员身份正确、图片格式和大小符合限制。
- 修改 config.js 后网页没变化：保存文件后强制刷新 Ctrl+F5，或确认部署包含了新文件。
- Google Fonts 加载失败：只是字体服务不可用，页面仍应使用系统字体。
- 删除留言失败：请先看浏览器 Console 的详细错误；不要为解决错误而随意关闭 RLS。

安全与隐私
----------
- 公开留言可能包含骚扰、垃圾信息或不适内容，因此默认先审核再公开。
- 当前项目提供基本审核流程；如果网站访问量增大，应增加验证码、速率限制、滥用举报和备份。
- 公开头像和联系方式前请确认你愿意让任何访问者看到。
- 定期在 Supabase 导出/备份数据；不要将“永久保存”理解为无需备份。
