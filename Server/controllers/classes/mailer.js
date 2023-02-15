import nodemailer from 'nodemailer'
import hbs from 'nodemailer-express-handlebars'
import path from 'path'
export default class Mailer {
    constructor(mailTo, subject){
        var mail = "mail"
        this.transporter = nodemailer.createTransport({
            service : "gmail",
            auth: {
                user : mail,
                pass: "password"
            }
        })
        this.mailOptions = {
            from: mail,
            to: mailTo,
            subject: subject
        }
        const handlebarOptions = {
            viewEngine: {
                extName: ".handlebars",
                partialDir: path.resolve("./views"),
                default: false
            },
            viewPath: path.resolve("./views"),
            extName: ".handlebars"
        }

        this.transporter.use("compile", hbs(handlebarOptions))
    }

    createSearchEmail(data){
        var mailOptions = {
            ...this.mailOptions,
            template: "singleSearch",
            context: {
                title: "Risultati ricerca singola",
                user: data.user,
                options: data.optionsText,
                geoTowns: data.geoTowns,
                file: data.csvFile
            }
        }
        this.sendEmail(mailOptions)
    }

    sendEmail(mailOptions){
        this.transporter.sendMail(mailOptions, (error, info) => {
            if(error) console.log(error)
            else console.log("Email sent: " + info.response)
        })
    }
}