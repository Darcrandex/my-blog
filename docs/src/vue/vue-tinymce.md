# Vue + Tinymce

`vuejs`

---

> vue 中使用 tinymce 富文本编辑器

参考文章

- [tinymce 官网文档](https://www.tiny.cloud/docs/)
- [tinymce Vue integration](https://www.tiny.cloud/docs/integrations/vue/#tinymcevuejsintegrationquickstartguide)
- [使用 tinymce 富文本](https://www.cnblogs.com/jay-sans/p/10792226.html)
- [Vue tinymce 富文本编辑器整合](https://blog.csdn.net/liub37/article/details/83310879)

## 1. 添加官方 vue 插件

```sh
yarn add @tinymce/tinymce-vue
```

## 2.获取 api-key (v5.x 必须)

进入[官网](https://www.tiny.cloud),点击`TinyMCE For Free`按钮.然后按照流程注册,最后在仪表盘中获取`api-key`即可.

## 3.下载中文语言包

[语言包下载地址](https://www.tiny.cloud/get-tiny/language-packages/), 选择中文,直接下载即可.
把下载的压缩包解压,然后把`zh_CN.js`文件放到项目的`public`文件夹下(可以自定文件夹结构,只要可以获取到即可).

## 4.新建组件

在`components`文件夹下新建`TinyMceEditor.vue`
`/src/components/TinyMceEditor.vue`

```vue
<template>
  <editor :api-key="apiKey" :init="editorInit" v-model="contentHtml" />
</template>

<script>
import Editor from "@tinymce/tinymce-vue";

// 后端上传接口,按照需求而定
import { apiUploadFile } from "@/apis/common";

const apiKey = "你的api-key";

export default {
  name: "TinyMceEditor",
  model: {
    prop: "content",
    event: "change",
  },
  props: {
    // 绑定的文本内容
    content: {
      type: String,
      default: "",
    },
  },

  components: { Editor },

  data: () => ({
    apiKey,

    // 编辑器配置
    editorInit: {
      language_url: "/zh_CN.js", //汉化文件的路径, 这里的原始路径是'/public/zh_CN.js'
      language: "zh_CN",

      height: 500,
      menubar: true,
      plugins: [
        "advlist autolink lists link image charmap print preview anchor",
        "searchreplace visualblocks code fullscreen",
        "insertdatetime media table paste code help wordcount",
        "image",
      ],
      toolbar:
        "undo redo | formatselect | bold italic backcolor | \
           alignleft aligncenter alignright alignjustify | \
           bullist numlist outdent indent | removeformat | image table",
      branding: false,

      // 自定义图片上传
      images_upload_handler: async (blobInfo, success, failure) => {
        try {
          const fileObj = blobInfo.blob(); //类似 input:file 获取到的文件对象
          const res = await apiUploadFile(fileObj); //自定义的后端接口
          const imageUrl = res;

          // success方法接受一个图片地址,然后在内容中追加图片元素
          success(imageUrl);
        } catch (err) {
          failure(err && err.msg ? err.msg : "上传失败");
        }
      },
    },

    contentHtml: "",
    updateTimer: null, //防抖
  }),

  watch: {
    content(valueFromParent) {
      // 由父组件自动修改的内容,同步到子组件
      if (valueFromParent !== this.contentHtml) {
        this.contentHtml = valueFromParent;
      }
    },

    contentHtml(valueFromChild = "") {
      // 向父组件派发change事件
      if (valueFromChild !== this.content) {
        this.updateTimer && clearTimeout(this.updateTimer);
        this.updateTimer = setTimeout(() => {
          this.$emit("change", valueFromChild);
        }, 500);
      }
    },
  },

  beforeDestroy() {
    this.updateTimer && clearTimeout(this.updateTimer);
  },
};
</script>
```

## 5.在逻辑组件中使用

`/src/views/Home.vue`

```vue
<template>
  <div>
    <h1>tinymce editor</h1>

    <TinyMceEditor v-model="content" />

    <button @click="resetContent">reset</button>
  </div>
</template>

<script>
import TinyMceEditor from "@/components/TinyMceEditor";

export default {
  name: "Home",
  components: { TinyMceEditor },
  data: () => ({
    content: "",
  }),
  methods: {
    resetContent() {
      this.content = "";
    },
  },
};
</script>
```
