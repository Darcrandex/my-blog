# react 監聽 search 變化

> 參考文章
>
> - [react-router history.listen](https://github.com/ReactTraining/history/blob/master/docs/api-reference.md#historylistenlistener-listener)
> - [類裝飾器](https://es6.ruanyifeng.com/#docs/decorator)

## 業務場景

1. A 頁面中存在查詢表單，表單的更新能被保存，並且在頁面刷新後，保留參數項。
2. 從 B 頁面跳轉到 A 頁面，並攜帶查詢參數。到達 A 頁面後，能獲得參數。

## 實現

1. 使用類裝飾器
2. 允許使用默認值
3. 自動監聽`search`的變化
4. 自動將`search`轉化為對象
5. 提供`search`字符串和對象的互轉工具函數

## 代码

```js
import { withRouter } from "react-router-dom";

/**
 * @desc 将Location中的search字符串转换为对象
 * @param {string} search
 */
export function getSearchObject(search = "") {
  const result = {};
  if (search) {
    const searchStr = search.split("?")[1];
    const searchKeyValueArr = searchStr.split("&");
    for (let i = 0; i < searchKeyValueArr.length; i++) {
      const [key, value] = searchKeyValueArr[i].split("=");
      result[key] = decodeURIComponent(value);
    }
  }

  return result;
}

/**
 * @desc 将对象转化为search字符串
 * @param {object} obj
 */
export function objectToSearch(obj = {}) {
  let searchStr = "";
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = encodeURIComponent(obj[key]);
      searchStr += `${key}=${value}&`;
    }
  }

  return searchStr ? "?" + searchStr.slice(0, -1) : "";
}

/**
 * @desc 可监听search变化的装饰器
 *
 * @desc 限制:
 * @desc state.search用于存放参数对象,不能命名冲突
 * @desc onRouteSearchUpdate用于监听更新,不能命名冲突
 *
 * @param {boolean?} listenOnDidMount 是否在组件初始化时就触发'onRouteSearchUpdate'
 */
export default function withSearchListener(listenOnDidMount = true) {
  let initSearch = {};

  return (WrappedComponent) =>
    withRouter(
      class extends WrappedComponent {
        componentDidMount() {
          // 初始化默认的search
          if (this.state && typeof this.state.search === "object") {
            initSearch = this.state.search;
          }

          if (
            typeof WrappedComponent.prototype.componentDidMount === "function"
          ) {
            WrappedComponent.prototype.componentDidMount.call(this);
          }

          if (listenOnDidMount) {
            this.onRouteSearchUpdate(
              getSearchObject(this.props.location.search),
              this.props.location
            );
          }
        }

        componentDidUpdate(prevProps) {
          if (
            typeof WrappedComponent.prototype.componentDidUpdate === "function"
          ) {
            WrappedComponent.prototype.componentDidUpdate.call(this);
          }

          if (prevProps.location.search !== this.props.location.search) {
            this.onRouteSearchUpdate(
              getSearchObject(this.props.location.search),
              this.props.location
            );
          }
        }

        /**
         * @desc 当路由中的'search'更新时触发
         * @param {string?} search
         * @param {object?} location
         */
        onRouteSearchUpdate(search = {}, location = {}) {
          // 根据默认的search来合并出新的search
          const nextSearch = { ...initSearch, ...search };

          this.setState({ search: nextSearch }, () => {
            if (
              typeof WrappedComponent.prototype.onRouteSearchUpdate ===
              "function"
            ) {
              WrappedComponent.prototype.onRouteSearchUpdate.call(
                this,
                nextSearch,
                location
              );
            }
          });
        }
      }
    );
}
```

## 使用

```js
import React, { Component } from "react";
import withSearchListener, { objectToSearch } from "@/utils/search-listener";

@withSearchListener()
class App extends Component {
  state = { search: { a: "", b: "" } };

  componentDidMount() {
    console.log(this.state.search);
  }

  onRouteSearchUpdate(search = {}, location = {}) {
    console.log(this.state.search);
  }

  gotoSameRouteWithOhterSearch() {
    const { pathname } = this.props.location;
    const nextSearch = objectToSearch({ c: "888" });
    this.props.history.replace(pathname + nextSearch);

    // 这里的路由跳转后会自动刷新当前组件的'state'
    // 将得到state: { search: { a: "", b: "", c: "888" }  }
  }

  render() {
    return "";
  }
}
```

路徑映射成對象的關係

```json
{
  "/page-a?a=123&b=456": { "a": "123", "b": "456" },
  "/page-a?a=123": { "a": "123", "b": "" },
  "/page-a?a=123&b=456&c=789": { "a": "123", "b": "456", "c": "789" }
}
```
