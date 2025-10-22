import mongoose  from 'mongoose';

const snippetSchema = new mongoose.Schema({
    title : {
        type : String, 
        required: true
    },
    code : {
        type : String,
        required : true
    },
    description : String,
    tags : [String],
    language : String,
    createdAt : {
        type : Date, 
        default: Date.now
    },
    user: {
        type : mongoose.Schema.Types.ObjectId, 
        ref: "User"
    }
});

export default mongoose.model("Snippet", snippetSchema);