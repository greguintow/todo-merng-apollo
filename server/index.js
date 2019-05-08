import { GraphQLServer } from 'graphql-yoga'
import mongoose from 'mongoose'
import { config } from 'dotenv'
import Todo from './models/Todo'

config()

const typeDefs = `
  type Query {
		hello(name: String): String!
		todos: [Todo!]!
	}
	type Mutation {
		addTodo(text: String!): Todo
		updateTodo(id: ID!, complete: Boolean!): Todo
		deleteTodo(id: ID!): Todo
	}
	type Todo {
		id: ID!
		text: String!
		complete: Boolean!
	}
`

const resolvers = {
	Query: {
		hello: (_, { name }) => `Hello ${name || 'World'}`,
		todos: () => Todo.find()
	},
	Mutation: {
		addTodo: async (_, { text }) => {
			const todo = await Todo.create({
				text,
				complete: false
			})
			return todo
		},
		updateTodo: async (_, { id, complete }) => {
			try {
				const todo = await Todo.findByIdAndUpdate(id, { complete })
				if (todo) return todo
				return false
			} catch (err) {
				throw new Error('Não foi possível achar esse ID')
			}
		},
		deleteTodo: async (_, { id } ) => {
			try {
				const todo = await Todo.findByIdAndDelete(id)
				if (todo) return todo
				return false
			} catch (err) {
				throw new Error('Não foi possível achar esse ID')				
			}
		}
	}
}

const server = new GraphQLServer({
	typeDefs,
	resolvers
})
mongoose.connect(process.env.URI, {
	useNewUrlParser: true,
	useFindAndModify: false
}).then(() => {
	server.start(() => console.log('Server is running on http://localhost:4000'))
}).catch(err => {
	throw err
})
