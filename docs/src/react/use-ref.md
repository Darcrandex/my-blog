## 关于 useRef 的使用

`useRef`类似于`React.createRef`.

### 1. 用于绑定 DOM

使用类组件

```jsx
class App extends React.Component {
  refInput = React.createRef();
  componentDidMount() {
    this.refInput.current && this.refInput.current.focus();
  }
  render() {
    return <input ref={this.refInput} />;
  }
}
```

使用函数组件

```jsx
function App() {
  const refInput = React.useRef(null);
  React.useEffect(() => {
    refInput.current && refInput.current.focus();
  }, []);

  return <input ref={refInput} />;
}
```

### 2. 父组件调用子组件方法

一些应用场景,需要在父组件中调用子组件定义的方法.这就需要将组件抛出给父组件.

使用类组件

```jsx
class ChildComponent extends Component {
  state = { text: "" };
  setText(text = "") {
    this.setState({ text });
  }
  render() {
    return <p>text: {this.state.text}</p>;
  }
}

class ParentComponent extends Component {
  refChild = React.createRef();
  setChildText = () => {
    if (this.refChild.current) {
      this.refChild.current.setText("text updated by parent component");
    }
  };
  render() {
    return (
      <>
        {/* 父组件引用时,直接使用 ref 即可绑定子组件实例 */}
        <ChildComponent ref={this.refChild} />
        <button onClick={this.setChildText}>set text by parent</button>
      </>
    );
  }
}
```

使用函数组件
需要配合[useImperativeHandle](https://zh-hans.reactjs.org/docs/hooks-reference.html#useimperativehandle)使用

```jsx
function Child(props, ref) {
  const [text, setText] = useState("");

  // 该 hook 需要定义抛出给父组件的可以使用的 api 方法
  // 相当于代理了子组件的方法
  useImperativeHandle(ref, () => ({
    setTextByParent(text = "") {
      setText(text);
    },
  }));

  return <p>text: {text}</p>;
}

// 函数组件需要使用 forwardRef 包裹
const ForwardChild = forwardRef(Child);

function Parent() {
  const ref = useRef(null);

  return (
    <>
      <ForwardChild ref={ref} />
      <button
        onClick={() => {
          ref.current &&
            ref.current.setTextByParent("text updated by parent component");
        }}
      >
        set text by parent
      </button>
    </>
  );
}
```

[在 code-sand-box 中查看](https://codesandbox.io/s/forward-ref-component-y4j49?file=/src/App.js:746-1392)
