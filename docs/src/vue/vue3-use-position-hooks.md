# usePosition(vue3)

`vuejs`

---

> 基于 vue3 的鼠标坐标跟踪的 hooks

```js
import { ref, onMounted, onUnmounted } from "vue";

function usePosition() {
  const x = ref(0);
  const y = ref(0);

  const handleUpdatePosition = (mouseEvent) => {
    const { clientX, clientY } = mouseEvent;
    x.value = clientX;
    y.value = clientY;
  };

  onMounted(() => {
    window.addEventListener("mousemove", handleUpdatePosition);
  });

  onUnmounted(() => {
    window.removeEventListener("mousemove", handleUpdatePosition);
  });

  return { x, y };
}

export default {
  setup() {
    const pos = usePosition();
    return { pos };
  },
};
```

相对于`react-hooks`, `composition-api`的语义(写法)更容易理解.
