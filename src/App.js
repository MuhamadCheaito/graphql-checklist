import React, { useState } from "react";
import {useQuery,gql, useMutation} from '@apollo/client';

const GET_TODOS = gql`
  query getTodos {
    todos{
      done
      id
      text
    }
  }
`
const TOGGLE_TODO = gql`
  mutation toggleTodo($id: uuid!, $done: Boolean!){
    update_todos(where: {id: { _eq: $id } }, _set: { done: $done }){
      returning {
        done
        id
        text
      }
    }
  }
`
const ADD_TODO = gql`
  mutation addTodo($text: String!){
    insert_todos(objects: {text: $text, done:false}){
      returning {
        done
        id
        text
      }
    }
  }
`

const DELETE_TODO = gql`
  mutation deleteTodo($id: uuid!){
    delete_todos(where: {id: { _eq: $id } }){
      returning {
        done
        id
        text
      }
    }
  }
`

function App() {
  const {data, loading, error} = useQuery(GET_TODOS)
  const [todoText, setTodoText] = useState("");
  const [toggleTodo] = useMutation(TOGGLE_TODO)
  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: () => setTodoText('')
  })
  const [deleteTodo] = useMutation(DELETE_TODO)
  async function handleDeleteTodo({id}){
    const isConfirmed = window.confirm("Do you want to delete this todo? ")
    if(isConfirmed){
      await deleteTodo({variables: {id},
        update: cache => {
          const prevData = cache.readQuery({ query: GET_TODOS})
          const newTodos = prevData.todos.filter(todo => todo.id !== id)
          cache.writeQuery({query: GET_TODOS, data: {todos: newTodos}})
        }
      })
    }
  }
  async function handleAddTodo(e){
    e.preventDefault()
    if(!todoText.trim()) return
    await addTodo(
      {
        variables: { text: todoText},
        refetchQueries: [
          { query: GET_TODOS }
        ]
      })
  }
  async function handleToggleTodo({id, done}){
    await toggleTodo({ variables: { id, done: !done }})
  }
  if(loading) return <div>loading...</div>
  if(error) return <div>Error fetching todos</div>
  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white pa4 fl-1">
      <h1 className="f2-l">GraphQL Checklist{" "}
      <span role="img"
      aria-label="Checkmark">
        ✅
      </span>
      </h1>
      <form onSubmit={handleAddTodo} className="mb3">
        <input type="text" className="pa2 f4 b--dashed" 
        onChange={(e) => setTodoText(e.target.value)}
        placeholder="Write your todo"
        value={todoText}/>{" "}
        <button
         className="pointer pa2 f3 br3 bg-green white bn" type="submit">Create</button>
      </form>
    <div className="flex items-center justify-center flex-column">
    { data.todos.length ?
    data.todos.map(todo =>(
      <p onDoubleClick={() => handleToggleTodo(todo)} key={todo.id}>
        <span className={`pointer list pa1 f3 ${todo.done && 'strike'}`}>
          {todo.text}
        </span>
        <button onClick={() => handleDeleteTodo(todo)} className="bg-transparent bn f4">
          <span className="red">
          &times;
          </span>
        </button>
      </p>
      )) : <p>There is no todos yet!! 😅</p>
    }
    </div>
    </div>
  );
}

export default App;
