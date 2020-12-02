# usePosition

> react-hooks. 获取鼠标坐标.

```ts
// usePosition.ts

import React, { useState, useEffect } from "react";

interface IPosition {
  x: number;
  y: number;
}

const usePosition = () => {
  const [{ x, y }, setPos] = useState<IPosition>({ x: 0, y: 0 });

  const handleMove = (e: MouseEvent) => {
    setPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMove);
    return () => {
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  return { x, y };
};

export default usePosition;
```

使用

```tsx
// App.tsx

import React from "react";
import usePosition from "./usePosition";

export default function () {
  const pos = usePosition();
  return (
    <>
      <h1>usePosition</h1>
      <p>{`x:${pos.x}, y:${pos.y}`}</p>
    </>
  );
}
```
