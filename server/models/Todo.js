import mongoose, { Schema } from 'mongoose'

const todoSchema = new Schema({
	text: {
		type: String,
		required: true
	},
	complete: Boolean
}, {
	timestamps: true
})

const Todo = mongoose.model('Todo', todoSchema)
export default Todo
