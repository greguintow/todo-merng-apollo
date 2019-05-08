import React, { useState } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Checkbox from '@material-ui/core/Checkbox'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/DeleteOutlined'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
// import DialogContent from '@material-ui/core/DialogContent'
// import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Input from '@material-ui/core/Input'
import './style.css'

const GET_TODOS = gql`
	{
		todos {
			id
			text
			complete
		}
	}
`

const ADD_TODO = gql`
	mutation addTodo($text: String!) {
		addTodo(text: $text) {
			id
			text
			complete
		}
	}
`

const UPDATE_TODO = gql`
	mutation updateTodo($id: ID!, $complete: Boolean!) {
		updateTodo(id: $id, complete: $complete) {
			id
			text
			complete
		}
	}
`

const DELETE_TODO = gql`
	mutation deleteTodo($id: ID!) {
		deleteTodo(id: $id) {
			id
			text
			complete
		}
	}
`

const App = () => {
	const [novoTodo, setNovoTodo] = useState('')
	const [open, setOpen] = useState(null)

	const sadYes = (deleteTodo, id) => {
		deleteTodo({ variables: { id } })
		setOpen(null)
	}

	const enviar = addTodo => {
		addTodo({ variables: { text: novoTodo } })
		setNovoTodo('')
	}

	return (
		<div className="center">
			{/* <h1>Hi</h1> */}
			<div className="inner">
				<Query query={GET_TODOS}>
					{({ loading, error, data: { todos } }) => {
						if (loading) return 'Carregando...'
						if (error) return `Erro! ${error.message}`
						console.log(todos)
						return (
							<Paper elevation={1}>
								<Mutation
									mutation={ADD_TODO}
									update={(cache, { data: { addTodo } }) => {
										const todos2 = cache.readQuery({ query: GET_TODOS }).todos
										cache.writeQuery({
											query: GET_TODOS,
											data: {
												todos: todos2.concat([addTodo])
											}
										})
									}}
								>
									{addTodo => (
										<Input
											placeholder="Adicione um a fazer"
											style={{ margin: 10 }}
											fullWidth
											value={novoTodo}
											onChange={({ target: { value } }) => setNovoTodo(value)}
											onKeyDown={e => e.keyCode === 13 && enviar(addTodo)}
										/>
									)}
								</Mutation>
								<List>
									{todos.map(({ id, text, complete }) => (
										<Mutation
											key={id}
											mutation={UPDATE_TODO}
											update={(cache, { data: { updateTodo } }) => {
												// console.log(cache.readQuery({ query: GET_TODOS }).todos)
												const todos2 = cache.readQuery({ query: GET_TODOS }).todos
												console.log(todos2)
												const index = todos2.findIndex(value => value.id === updateTodo.id)
												todos2[index].complete = !todos2[index].complete
												cache.writeQuery({
													query: GET_TODOS,
													data: {
														todos: todos2
													}
												})
											}}
										>
											{(updateTodo, { loading, error }) => {
												console.log(error)
												return (
													<ListItem role={undefined} dense button onClick={() => updateTodo({ variables: { id, complete: !complete } })}>
														<Checkbox checked={complete} tabIndex={-1} disableRipple />
														<ListItemText primary={text} />
														<ListItemSecondaryAction>
															<Mutation
																mutation={DELETE_TODO}
																update={(cache, { data: { deleteTodo } }) => {
																	const todos2 = cache.readQuery({ query: GET_TODOS }).todos
																	console.log(deleteTodo)
																	cache.writeQuery({
																		query: GET_TODOS,
																		data: { todos: todos2.filter(value => value.id !== deleteTodo.id) }
																	})
																}}
															>
																{deleteTodo => (
																	<>
																		<IconButton onClick={() => setOpen(id)}>
																			<DeleteIcon style={{ color: '#ef4c4c' }} />
																		</IconButton>
																		<Dialog
																			open={open === id}
																			onClose={() => setOpen(null)}
																			aria-labelledby="alert-dialog-title"
																			aria-describedby="alert-dialog-description"
																		>
																			<DialogTitle id="alert-dialog-title">Delete todo {text}</DialogTitle>
																			<DialogActions>
																				<Button onClick={() => setOpen(null)} color="primary">
																					Cancel
																				</Button>
																				<Button onClick={() => sadYes(deleteTodo, id)} color="primary" autoFocus>
																					Yes
																				</Button>
																			</DialogActions>
																		</Dialog>
																	</>
																)}
															</Mutation>
														</ListItemSecondaryAction>
													</ListItem>
												)
											}}
										</Mutation>
									))}
								</List>
							</Paper>
						)
					}}
				</Query>
			</div>
		</div>
	)
}

export default App
