import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export default class Mailer {
    constructor(mailTo, subject){
        dotenv.config()
        this.mailTo = mailTo
        this.subject = subject
        this.transporter = nodemailer.createTransport({
            service : "gmail",
            tls: {
                rejectUnauthorized: false
            },
            auth: {
                user : process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })
        this.mailOptions = {
            from: process.env.EMAIL,
            to: mailTo,
            subject: subject
        }
        const handlebarOptions = {
            viewEngine: {
                default: false
            },
            viewPath: path.join(__dirname, "/views/"),
            extName: ".handlebars"
        }
        this.transporter.use("compile", hbs(handlebarOptions))
    }

    SendEmail(data){
        var mailOptions = {
            ...this.mailOptions,
            template: "main",
            context: {
                subject: this.subject,
                title: "Risultati ricerca singola",
                user: data.user,
                options: data.options,
                file: data.fileName
            },
            attachments: [{
                            filename: data.fileName,
                            path: data.filePath
                        }]
        }
        this.transporter.sendMail(mailOptions, (error, info) => {
            if(error) console.log(error)
            else console.log("Email sent to : " + this.mailTo + " " + info.response)
        })
    }
}