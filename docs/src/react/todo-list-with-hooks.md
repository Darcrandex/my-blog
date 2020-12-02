# todo-list(react-hooks)

## 组件

```tsx
// TodoList.tsx

import React, { useState, useEffect } from "react";
import { Input, Icon } from "antd";
import moment from "moment";
import styles from "./styles.module.less";

const TODO_KEY = "_react_ts_test_todo_list";

interface ITodo {
  id: string;
  date: number;
  content: string;
  done: boolean;
}

const TodoItem = ({
  todo,
  onToggleStatus,
  onRemove,
}: {
  todo: ITodo;
  onToggleStatus: (todoId: string) => void;
  onRemove: (todoId: string) => void;
}) => {
  return (
    <li className={styles.item}>
      <p className={styles.content}>{todo.content}</p>
      <div className={styles.item_footer}>
        <span className={styles.date}>
          {moment(todo.date).format("YYYY-MM-DD hh:mm:ss")}
        </span>
        <Icon
          className={styles.btn}
          type="check-circle"
          title="toggle status"
          theme={todo.done ? "filled" : "outlined"}
          onClick={() => onToggleStatus(todo.id)}
        />
        <Icon
          className={styles.btn}
          type="delete"
          title="remove"
          onClick={() => onRemove(todo.id)}
        />
      </div>
    </li>
  );
};

const TodoCreator = ({ onSubmit }: { onSubmit: (todo: ITodo) => void }) => {
  const [content, setContent] = useState<string>("");

  return (
    <div className={styles.input_wrapper}>
      <Input
        type="text"
        name="new-todo"
        id="new-todo"
        autoComplete="false"
        placeholder="input todo, then hit 'Enther'"
        size="large"
        maxLength={30}
        className={styles.input}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyUp={(e) => {
          if (content.trim() && e && (e.keyCode === 13 || e.which === 13)) {
            onSubmit({
              id: Math.random().toFixed(6),
              date: Date.now(),
              content,
              done: false,
            });
            setContent("");
          }
        }}
      />
    </div>
  );
};

const TodoList = () => {
  const todoListFromStorage = window.localStorage.getItem(TODO_KEY);
  const initTodoList: ITodo[] = todoListFromStorage
    ? JSON.parse(todoListFromStorage)
    : [];
  const [list, setList] = useState<ITodo[]>(initTodoList);

  useEffect(() => {
    const todoListToStorage = JSON.stringify(list);
    window.localStorage.setItem(TODO_KEY, todoListToStorage);
  }, [list]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Todo List</h1>
      <TodoCreator onSubmit={(todo) => setList([...list, todo])} />

      <ol className={styles.list}>
        {list
          .sort((a, b) => b.date - a.date)
          .map((item) => (
            <TodoItem
              key={item.id}
              todo={item}
              onToggleStatus={(id) =>
                setList(
                  list.map((v) => (v.id === id ? { ...v, done: !v.done } : v))
                )
              }
              onRemove={(id) => setList(list.filter((v) => v.id !== id))}
            />
          ))}
      </ol>
    </div>
  );
};

export default TodoList;
```

## 样式

```less
// styles.module.less

@spacing: 20px;
@font-size: 20px;

.container {
  margin: 30px auto;
  width: 576px;
  max-width: 100%;
  user-select: none;
}

.title {
  font-size: 1.5 * @font-size;
  font-weight: bold;
  text-align: center;
  color: @theme-color;
}

.input_wrapper {
  margin: @spacing;
}

.list {
  list-style: none;
  padding-left: 0;
  margin: @spacing;
}

.item {
  padding: @spacing;
  margin: 2 * @spacing 0;
  border-radius: 5px;
  box-shadow: 0 0 @spacing 0 #ddd;
}

.content {
  margin-right: auto;
  font-size: @font-size;
  word-break: break-all;
}

.item_footer {
  display: flex;
  align-items: center;
  padding-top: @spacing;
  border-top: 1px solid #ddd;
}

.date {
  margin-right: auto;
  font-weight: bold;
  color: #666;
}

.btn {
  margin-left: @spacing;
  color: @theme-color;
  font-size: @font-size;
}
```
