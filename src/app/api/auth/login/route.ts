import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/database/mongo.config";
import { loginSchema } from "@/validator/authSchema"
import vine, { errors } from "@vinejs/vine";
import ErrorReporter from "@/validator/ErrorReporter";
import { User } from "@/model/User";
import bcrypt from 'bcryptjs';


connect();
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validator = vine.compile(loginSchema);
        validator.errorReporter = () => new ErrorReporter();
        const output = await validator.validate(body);

        const user = await User.findOne({ email: output.email })
        if (user) {
            const checkPassword = bcrypt.compareSync(output.password!, user.password)
            if (checkPassword) {
                return NextResponse.json({
                    status: 200,
                    message: "User Logged in Succesfully"
                }, { status: 200 })
            }
            return NextResponse.json({ status: 400, message: "please check your credentials" }, { status: 200 })
        }
        return NextResponse.json({ status: 200, errors: { email: "No account found with this email." } })
    } catch (error) {
        if (error instanceof errors.E_VALIDATION_ERROR) {
            return NextResponse.json(
                { status: 400, errors: error.messages },
                { status: 200 }
            );
        }
    }
}