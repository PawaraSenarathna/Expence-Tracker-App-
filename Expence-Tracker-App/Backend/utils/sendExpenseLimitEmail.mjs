import nodemailer from "nodemailer";
export default function sendExpenseLimitEmail(
  expenseLimit,
  TotalExpenses,
  email
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "pawarasenarathna42@gmail.com",
      pass: "wmod foex izuf arbc",
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: "pawarasenarathna42@gmail.com",
    to: email,
    subject: "From Expense Tracker",
    text: `you're exceeding your expense limit`,
  };

  if (Math.abs(TotalExpenses) < expenseLimit) return false;
  if (expenseLimit === 0) return false;
  transporter.sendMail(mailOptions);
}
