const autoGetSidebarOptionBySrcDir = require("./get-sidebar-by-dir");

// 统一配置一些选项
function setDefaultOptions(sidebar = []) {
  return sidebar.map((item) => {
    if (typeof item === "object") {
      // 让侧边导航无法折叠
      return Object.assign(item, { collapsable: false });
    } else {
      return item;
    }
  });
}

// 配置侧边栏
const sidebar = setDefaultOptions([
  "/", // 这个路径获取默认获取'docs/readme.md',而且是必须的

  // 根据src文件夹生成的导航
  ...autoGetSidebarOptionBySrcDir(),
]);

module.exports = {
  // 博客部署的项目
  base: "/my-blog/",

  // 开发相关
  host: "localhost",
  port: 7788,

  head: [["link", { rel: "icon", href: "/images/darcrand-avatar.jpg" }]],
  // 顶部标题
  title: "Darcrand's Blog",

  themeConfig: {
    logo: "/images/darcrand-avatar.jpg",

    // 顶部导航
    nav: [{ text: "Github", link: "https://github.com/Darcrandex/my-blog" }],

    // 侧边栏
    sidebar,

    lastUpdated: true,
  },

  plugins: ["@vuepress/back-to-top"],
};
