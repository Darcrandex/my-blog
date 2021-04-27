# 打包并发布到github-page

# 打包
npm run build

# 进入打包目录
cd docs/.vuepress/dist

# 初始化git 因为每次打包都会删除'.git'
git init
git add -A
git commit -m 'deploy'

# 推代码到 github-page 仓库
# 需要先中本地环境配置好 github-pages 对应项目的ssh权限

# 推送到当前项目(my-blog),然后会自动创建一个'gh-pages'分支
# 当访问'https://darcrandex.github.io/my-blog'时,会自动重定向到'gh-pages'分支的内容
git push -f git@github.com:Darcrandex/my-blog.git master:gh-pages