# Vue Event Bus

`vuejs` `javascript`

---

> vue 中使用 event-bus

新建文件 `./events/module-a.js`

```js
import Vue from "vue";

const EventBus = new Vue();

export const types = {
  EVENT_A: "a",
  EVENT_B: "b",
};

export default EventBus;
```

新建两个页面组件

`./views/A.vue`

```vue
<template>
  <div>
    <button @click="handleClick">emit</button>
  </div>
</template>

<script>
// 引入 event-bus
import busA, { types } from "@/events/module-a.js";

export default {
  methods: {
    handleClick() {
      // 派发事件
      busA.$emit(types.EVENT_A, { msg: "hello" });
    },
  },
};
</script>
```

`./views/B.vue`

```vue
<template>
  <div>
    <p>msg: {{ msg }}</p>
  </div>
</template>

<script>
import busA, { types } from "@/events/module-a.js";

export default {
  data: () => ({ msg: "" }),
  mounted() {
    // 监听事件
    busA.$on(types.EVENT_A, (res) => {
      this.msg = res.msg;
    });
  },
};
</script>
```
