import mongoose from "mongoose";

export function connect() {
    mongoose.connect(process.env.MONGOURI!, {
        tls: true,
    })
        .then(() => console.log("Database connected Succesfully"))
        .catch((err) => console.log("Hey there is some error", err))
}