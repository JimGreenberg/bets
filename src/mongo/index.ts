if (!process.env.MONGO_URL) throw new Error("No mongo url");
connect(process.env.MONGO_URL);
