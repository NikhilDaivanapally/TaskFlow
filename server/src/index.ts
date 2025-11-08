import { app } from "./app";

app.listen(process.env.PORT || 8000, () => {
  console.log(`server is Running on ${process.env.PORT}`);
});