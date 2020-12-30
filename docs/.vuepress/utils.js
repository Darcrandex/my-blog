/**
 * 根据'docs/src'文件夹自动生成vuepress的侧边栏选项
 * 有以下限制
 * 1.src下只能有两层目录结构
 * 例如: src/dir/abc.md, src/xyz.md
 * 2.第一层如果是文件夹,自动将文件夹名称设置为分组的名称
 * 3.每个子 markdown 文件必须在内容开头添加大标题(# 标题),因为会作为子导航的名称
 * 4.生成的顺序目前无法单独控制
 */

const fs = require("fs");
const path = require("path");
// 中文路径编码
const urlencode = require("urlencode");

// 资源根文件夹的名称
const SRC_DIR_NAME = "src";
// 用来存放所有md文件的基础路径
const SRC_DIR = path.resolve(__dirname, "../", SRC_DIR_NAME);

// 判断是否为 markdown 文件
function isMarkDownFile(stat = {}, filename = "") {
  return stat.isFile() && path.extname(filename) === ".md";
}

// 获取文件名,去掉扩展名
function getMarkDownFileName(name = "") {
  return name.replace(".md", "");
}

function srcFilesToSidebar(rootDir = SRC_DIR) {
  const res = [];

  try {
    // 第一层
    const topLevelFiles = fs.readdirSync(rootDir);
    topLevelFiles.forEach((topLevelFileName) => {
      //  第一层文件/文件夹的绝对路径
      const topLevelFilePath = path.join(rootDir, topLevelFileName);
      // 第一层的文件对象
      const topLevelStat = fs.statSync(topLevelFilePath);
      const isMarkDown = isMarkDownFile(topLevelStat, topLevelFileName);

      if (isMarkDown) {
        res.push(
          `/${SRC_DIR_NAME}/${urlencode(getMarkDownFileName(topLevelFileName))}`
        );
      } else if (topLevelStat.isDirectory()) {
        const children = [];

        // 嵌套的子层(目前只支持两层结构)
        const subLevelFiles = fs.readdirSync(topLevelFilePath);
        subLevelFiles.forEach((subFilename) => {
          const subDirPath = path.join(topLevelFilePath, subFilename);
          const subStat = fs.statSync(subDirPath);
          const isMarkDown = isMarkDownFile(subStat, subFilename);

          if (isMarkDown) {
            children.push(
              `/${SRC_DIR_NAME}/${urlencode(
                topLevelFileName
              )}/${getMarkDownFileName(subFilename)}`
            );
          }
        });
        res.push({
          title: topLevelFileName,
          children,
        });
      }
    });
  } catch (err) {
    console.error("自动生成 侧边栏配置 失败", err);
    throw err;
  }

  return res;
}

module.exports = srcFilesToSidebar;
