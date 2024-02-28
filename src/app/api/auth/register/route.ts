import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { registerSchema } from "@/validator/authSchema"
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";
import bcrypt from "bcryptjs"
import { User } from "@/model/User";


interface UserPayload {
    name: string;
    email: string;
    password: string;
    avtar?: string;
}

connect();
export async function POST(request: NextRequest) {

    try {
        const body: UserPayload = await request.json();
        const validator = vine.compile(registerSchema)
        validator.errorReporter = () => new ErrorReporter()
        const output = await validator.validate(body)
        // check if email exist or not 
        const user = await User.findOne({ email: output.email })
        if (user) {
            return NextResponse.json({
                status: 400, errors: {
                    email: "Email is already taken"
                }
            }, { status: 200 })
        }
        //encrypt the password
        const salt = bcrypt.genSaltSync(10)
        output.password = bcrypt.hashSync(output.password, salt)
        await User.create(output)
        return NextResponse.json({ status: 200, message: "User created succesfully" }, { status: 200 })
    } catch (error) {
        if (error instanceof errors.E_VALIDATION_ERROR) {
            return NextResponse.json({ status: 400, errors: error.message }, { status: 400 })
        }
    }

}