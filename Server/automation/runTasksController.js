import mysql from "mysql";
import axios from "axios";
import winston from "winston";

// Logger setup
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "scheduler.log" }), // Logs stored in a file
    ],
});

// Database configuration
const dbConfig = {
    host: "141.95.54.84",
    user: "luigi_tuacar",
    password: "Tuacar.2023",
    database: "tuacarDb",
};

// Create a database connection
const db = mysql.createConnection(dbConfig);

db.connect((err) => {
    if (err) {
        logger.error(`Database connection failed: ${err.message}`);
        process.exit(1);
    }
    logger.info("Connected to the database.");
});

// API base URL
const API_URL = "http://leads.tua-car.it/";

// Get current timestamp adjusted for timezone
const timeOffset = new Date().getTimezoneOffset();
const dtNow = new Date(new Date().getTime() - timeOffset * 60 * 1000);
// Time window for task execution
const tsBefore = dtNow.getTime() - 2 * 60 * 1000; // 2 minutes before
const tsAfter = dtNow.getTime() + 3 * 60 * 1000; // 3 minutes after

(async function main() {
    try {
        logger.info("Fetching tasks scheduled for execution...");
        // Fetch tasks scheduled to run within the time window
        const query = `SELECT * FROM scheduled_tasks WHERE schedule_active = ? AND next_run <= ?`;
        const scheduledTasks = await queryDatabase(query, [
            1,
            new Date(tsAfter).toISOString().slice(0, 19).replace("T", " "),
        ]);

        logger.info(`Found ${scheduledTasks.length} tasks to execute.`);

        const executedTasks = [];
        for (const task of scheduledTasks) {
            logger.info(`Processing task ID: ${task.task_id}`);
            const executedTask = await tryExecuteTask(task);
            if (executedTask) {
                executedTasks.push(executedTask);

                // Update task's last_run and next_run in the database
                const updateQuery = `UPDATE scheduled_tasks SET last_run = ?, next_run = ? WHERE task_id = ?`;
                await queryDatabase(updateQuery, [
                    executedTask.last_run,
                    executedTask.next_run,
                    executedTask.task_id,
                ]);
                logger.info(`Task ID: ${executedTask.task_id} updated successfully.`);
            }
        }

        logger.info("All tasks processed successfully.");
    } catch (err) {
        logger.error(`Error in main execution: ${err.message}`);
    } finally {
        db.end(() => {
            logger.info("Database connection closed.");
            process.exit(0);
        });
    }
})();

// Execute a single task if it meets the criteria
async function tryExecuteTask(task) {
    try {
        const [hour, minute] = task.schedule_start.split(":").map(Number);
        const adjustedHour = (hour - timeOffset / 60 + 24) % 24; // Adjust for offset and wrap around
        const runDate = new Date();
        runDate.setHours(adjustedHour, minute, 0, 0);

        // Adjust next run based on repeat interval
        while (runDate < dtNow) {
            runDate.setHours(runDate.getHours() + task.schedule_repeat_h);
        }

        const lastRunTimestamp = runDate.getTime() - timeOffset * 60 * 1000;
        logger.info(`lastRunTimestamp: ${new Date(lastRunTimestamp).toTimeString()}`);
        logger.info(`tsAfter: ${new Date(tsAfter).toTimeString()}`);
        logger.info(`tsBefore: ${new Date(tsBefore).toTimeString()}`);
        if (lastRunTimestamp < tsAfter && lastRunTimestamp > tsBefore) {
            logger.info(`Task ID: ${task.task_id} is due for execution.`);

            // Fetch user details
            const userRes = await axios.get(`${API_URL}user/user/${task.user_id}`);
            const user = userRes.data[0];

            // Prepare the email list
            const mailList = JSON.parse(task.schedule_cc || "[]");
            mailList.push(user.email);

            logger.info(`Sending email for Task ID: ${task.task_id} to: ${mailList.join(", ")}`);

            // Trigger the search API
            await axios.post(`${API_URL}search`, {
                name: user.name,
                mail_list: mailList,
                setSpokiActive: 1,
                schedule_content: JSON.parse(task.schedule_content),
                user_id: task.user_id,
            });

            const nextRun = new Date(runDate.getTime() + task.schedule_repeat_h * 3600 * 1000);
            logger.info(`Task ID: ${task.task_id} scheduled for next run at: ${nextRun.toLocaleString()}`);

            return {
                ...task,
                last_run: dtNow.toISOString().slice(0, 19).replace("T", " "),
                next_run: nextRun.toISOString().slice(0, 19).replace("T", " "),
            };
        } else {
            logger.debug(`Task ID: ${task.task_id} is not due for execution.`);
        }
    } catch (err) {
        logger.error(`Error executing Task ID: ${task.task_id} - ${err.message}`);
        return null;
    }

    return null;
}

// Helper function to execute database queries
function queryDatabase(query, params) {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, results) => {
            if (err) {
                logger.error(`Database query failed: ${err.message}`);
                reject(err);
            } else {
                logger.debug(`Database query successful: ${query}`);
                resolve(results);
            }
        });
    });
}
