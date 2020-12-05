const srcFilesToSidebar = require("./utils");

// 统一配置一些选项
function setDefaultOptions(sidebar = []) {
  return sidebar.map((item) => {
    // 让侧边导航无法折叠
    if (typeof item === "object") {
      return Object.assign(item, { collapsable: false });
    } else {
      return item;
    }
  });
}

// 配置侧边栏
const sidebar = setDefaultOptions([
  {
    title: "介绍",
    path: "/", // 这个路径获取默认获取'docs/readme.md',而且是必须的
  },

  // 根据src文件夹生成的导航
  ...srcFilesToSidebar(),
]);

module.exports = {
  // 开发相关
  host: "localhost",
  port: 7788,

  // 顶部标题
  title: "Darcrand's Blog",

  themeConfig: {
    logo:
      "https://avatars1.githubusercontent.com/u/26473667?s=460&u=a118bff244dafd9a1bf2d8a8465d043d1d083109&v=4",

    // 顶部导航
    nav: [{ text: "Github", link: "https://github.com/Darcrandex/my-blog" }],

    // 侧边栏
    sidebarDepth: 2,
    sidebar,

    lastUpdated: true,
  },
};
