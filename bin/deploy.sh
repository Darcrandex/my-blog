# 打包并发布到github-page

# 打包
npm run docs:build

# 进入打包目录
cd docs/.vuepress/dist

# 初始化git 因为每次打包都会删除'.git'
git init
git add -A
git commit -m 'deploy'

# 推代码到 github-page 仓库(本地要先配置好ssh权限)
git push -f git@github.com:Darcrandex/darcrandex.github.io.git master