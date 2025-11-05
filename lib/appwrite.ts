import { Client, Account, Databases } from "appwrite";

const client = new Client();

client
    .setEndpoint("https://sgp.cloud.appwrite.io/v1")
    .setProject('690b625000198f401de1')

export const account = new Account(client);
export const databases = new Databases(client);