
import {account} from '@/lib/appwrite'

export async function loginUser(email:string, password:string) {
    try {
        const session = await account.createEmailPasswordSession(email, password)
        return {success: true, data:session}
    } catch (error) {
        console.log(error)
    }
}
