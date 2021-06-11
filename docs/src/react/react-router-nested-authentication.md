# react-router@5.x 嵌套路由鉴权

## `<Route/>` 组件渲染优先级

> - [route-render-methods](https://reactrouter.com/web/api/Route/route-render-methods)
> - [render 和 component 的区别](https://www.jianshu.com/p/a2a9b469a422)

渲染方式有如下三种:

1. render
2. component
3. children

三个属性同时存在

```jsx
<Route
  path="/the-path"
  render={() => <div>by render</div>}
  component={() => <div>by component</div>}
>
  <div>by children</div>
</Route>
```

渲染结果

```html
<div>by children</div>
```

只有`render`和`component`

```jsx
<Route
  path="/the-path"
  render={() => <div>by render</div>}
  component={() => <div>by component</div>}
/>
```

渲染结果

```html
<div>by component</div>
```

因此,渲染的优先级为

```
children > component > render
```

## 使用`render`渲染嵌套的路由

```jsx
<>
  <Link to="/the-path/r1">route 1</Link>
  <Link to="/the-path/r1/1">route 1-1</Link>
  <Link to="/the-path/r1/2">route 1-2</Link>
  <Link to="/the-path/r2">route 2</Link>

  <Switch>
    <Route
      path="/the-path/r1"
      render={() => (
        <div>
          <h1>Route 1</h1>
          <Route path="/the-path/r1/1" render={() => <h2>Route 1-1</h2>} />
          <Route path="/the-path/r1/2" render={() => <h2>Route 1-2</h2>} />
        </div>
      )}
    />
    <Route path="/the-path/r2" render={() => <h1>Route 2</h1>} />
  </Switch>
</>
```

## 使用路由配置的形式来渲染路由

```jsx
// 路由配置

const R1 = ({ children }) => (
  <div>
    <h1>Route 1</h1>
    {children}
  </div>
);
const R2 = () => <h1>Route 2</h1>;
const R11 = () => <h2>Route 1-1</h2>;
const R12 = () => <h2>Route 1-2</h2>;

const routes = [
  {
    path: "/the-path/r1",
    component: R1,
    children: [
      {
        path: "/the-path/r1/1",
        component: R11,
      },
      {
        path: "/the-path/r1/2",
        component: R12,
      },
    ],
  },
  {
    path: "/the-path/r2",
    component: R2,
  },
];
```

```jsx
// 用于渲染嵌套路由的渲染函数

function renderNestedRoute({
  path = "",
  component: Content = () => false,
  children = undefined,
  ...otherRouteProps
} = {}) {
  return (
    <Route
      key={path}
      path={path}
      render={() => (
        <Content>
          {Array.isArray(children) && children.map(renderNestedRoute)}
        </Content>
      )}
      {...otherRouteProps}
    />
  );
}
```

结合使用

```jsx
// App.jsx

<Switch>{routes.map(renderNestedRoute)}</Switch>
```

## 添加 user 的管理模块

```jsx
// App.jsx

function App() {
  const [user, setUser] = useState({ name: "", roles: [] });

  // 在本例中,使用了简单的 state, 真正的业务中一般会使用 redux 或 mobx
  const login = () => {
    window.localStorage.setItem("roles", JSON.stringify(["account"]));
    setUser({ name: "nickname", roles: ["account"] });
  };

  const logout = () => {
    window.localStorage.removeItem("roles");
    setUser({ name: "", roles: [] });
  };

  return (
    <>
      // ...
      <p>name: {user.name}</p>
      <button onClick={login}>login</button>
      <button onClick={logout}>logout</button>
      <hr />
    </>
  );
}
```

## 修改路由配置,添加路由的权限

本例中,在配置中添加`roles`属性,类型是`string[]`

```jsx
const routes = [
  {
    path: "/the-path/r1",
    component: R1,
    redirect: "/the-path/r1/1",
    children: [
      {
        path: "/the-path/r1/1",
        component: R11,
        roles: ["account"],
      },
      {
        path: "/the-path/r1/2",
        component: R12,
        roles: ["admin"],
      },
    ],
  },
  {
    path: "/the-path/r2",
    component: R2,
    roles: ["admin", "super-admin"],
  },
];
```

## 修复路由渲染函数

```jsx
function renderNestedRoute({
  path = "",
  component: Content = () => false,
  children = undefined,
  roles = [],
  ...otherRouteProps
} = {}) {
  // 从本地缓存中获取当前用户(登录之后)的角色权限
  const currUserRoles = JSON.parse(
    window.localStorage.getItem("roles") || "[]"
  );

  // 判断当前用户是否有权限访问指定的路由
  // 这里的业务逻辑是, 只要用户的角色匹配权限列表中的任意一个即可允许访问
  const hasAuthorization =
    roles.length === 0 || currUserRoles.some((r) => roles.includes(r));

  return (
    <Route
      key={path}
      path={path}
      render={() =>
        hasAuthorization ? (
          <Content>
            {Array.isArray(children) && children.map(renderNestedRoute)}
          </Content>
        ) : (
          <div>you have no authorization as {roles.join(" or ")} !</div>
        )
      }
      {...otherRouteProps}
    />
  );
}
```

## 完整例子

```jsx
// App.jsx

import React, { useState } from "react";
import { Switch, Route, Link } from "react-router-dom";

const R1 = ({ children }) => (
  <div>
    <h1>Route 1</h1>
    {children}
  </div>
);
const R2 = () => <h1>Route 2</h1>;
const R11 = () => <h2>Route 1-1</h2>;
const R12 = () => <h2>Route 1-2</h2>;

const routes = [
  {
    path: "/the-path/r1",
    component: R1,
    redirect: "/the-path/r1/1",
    children: [
      {
        path: "/the-path/r1/1",
        component: R11,
        roles: ["account"],
      },
      {
        path: "/the-path/r1/2",
        component: R12,
        roles: ["admin"],
      },
    ],
  },
  {
    path: "/the-path/r2",
    component: R2,
    roles: ["admin", "super-admin"],
  },
];

function renderNestedRoute({
  path = "",
  component: Content = () => false,
  children = undefined,
  roles = [],
  ...otherRouteProps
} = {}) {
  const currUserRoles = JSON.parse(
    window.localStorage.getItem("roles") || "[]"
  );
  const hasAuthorization =
    roles.length === 0 || currUserRoles.some((r) => roles.includes(r));

  return (
    <Route
      key={path}
      path={path}
      render={() =>
        hasAuthorization ? (
          <Content>
            {Array.isArray(children) && children.map(renderNestedRoute)}
          </Content>
        ) : (
          <div>you have no authorization as {roles.join(" or ")} !</div>
        )
      }
      {...otherRouteProps}
    />
  );
}

const App = () => {
  const [user, setUser] = useState({ name: "", roles: [] });

  const login = () => {
    window.localStorage.setItem("roles", JSON.stringify(["account"]));
    setUser({ name: "nickname", roles: ["account"] });
  };

  const logout = () => {
    window.localStorage.removeItem("roles");
    setUser({ name: "", roles: [] });
  };

  return (
    <>
      <p>name: {user.name}</p>
      <button onClick={login}>login</button>
      <button onClick={logout}>logout</button>
      <hr />

      <Link to="/the-path/r1">route 1</Link>
      <Link to="/the-path/r1/1">route 1-1</Link>
      <Link to="/the-path/r1/2">route 1-2</Link>
      <Link to="/the-path/r2">route 2</Link>

      <Switch>{routes.map(renderNestedRoute)}</Switch>
    </>
  );
};

export default React.memo(App);
```
