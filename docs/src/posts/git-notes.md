# Git 学习总结

## 使用 git 管理前的一些准备

### 配置本地 git 账号

```sh
git config user.name "zhangsan"
git config user.email "zhangsan@gmail.com"
```

### 本地生成 ssh-key

1. 直接生成

```sh
cd
ssh-keygen
```

其中第一步的`cd`是进入默认根目录, 然后一路按`回车`选择默认项即可.

```sh
cd ./.ssh
ll
```

2. 添加参数

```
-b  采用长度1024bit的密钥对,b=bits,最长4096，不过没啥必要
-t  加密方式,t=type
-f  生成文件名,f=output_keyfiles
-C  备注内容,C=comment
```

例如

```sh
ssh-keygen -t rsa -b 1024 -f yourkeyname -C "备注"
```

进入默认根目录, 然后进入`.ssh`文件夹即可看到生成的两个密钥文件:`id_rsa`(私钥), `id_rsa.pub`(公钥).

```sh
// 打印公钥内容
cat id_rsa.pub

// 复制公钥文件内容到剪贴板
clip < id_rsa.pub
```

登录 github 账号, 在`设置-ssh-key`中添加你的公钥

最后验证是否生效

```sh
ssh -T git@github.com
```

### 一些配置

1. 禁用 windows 的`crlf`换行符

因为在线上仓库使用的`linus`系统的换行符是`lf`,windows 用的是`crlf`.在拉取项目到本地会默认转化换行符.

```sh
git config --global core.autocrlf false
```

## 常用指令

1. 初始化本地仓库

```sh
cd my-project
git init
```

2. 克隆仓库

```sh
git clone <仓库地址(线上/本地)>

git clone <地址> <本地仓库新的名字>

git clone -b <指定要克隆的分支名> <地址>
```

3. 工作区->暂存区

```sh
// 暂存个别文件,空格隔开多个文件名
git add <文件路径>

// 暂存所有修改的文件
git add .
```

4. 暂存区->本地仓库

```sh
git commit -m "备注"
```

5. 拉取线上新内容(尝试合并)

```sh
git pull <终端名称> <分支名称>

git pull origin master

git pull gitee my-branch

```

6. 本地仓库->线上仓库

```sh
git push <终端名称> <分支名称>

git push origin master
```

7. 查看关联的终端

```sh
git remote -v
```

8. 查看修改历史

```sh
git log
```

9. 将 A 分支的单个`commit`的内容合并到 B 分支

> [git cherry-pick 教程](http://www.ruanyifeng.com/blog/2020/04/git-cherry-pick.html)

```sh
git checkout A
git commit -m 'a1 的内容'
git push origin A
git log
```

查看'a1 的内容'所对应的 id

```sh
git checkout B
git cherry-pick <id>
```

10. 克隆项目

```sh
git clone <项目地址>

git clone -b <指定要克隆的分支> <项目地址>

git clone <项目地址> <重新命名文件夹>
```

![git 指令](https://atts.w3cschool.cn/attachments/image/20191225/1577243564858376.png)

## git 工作流

> [参考文章](https://github.com/Darcrandex/my-git/blob/master/git-workflow-tutorial.md)

先水一波,后续更新
