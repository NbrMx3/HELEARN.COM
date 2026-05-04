import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

async function run(){
  try{
    const key = process.env.DARAJA_CONSUMER_KEY
    const secret = process.env.DARAJA_CONSUMER_SECRET
    const base = process.env.DARAJA_BASE_URL || 'https://sandbox.safaricom.co.ke'
    const creds = Buffer.from(`${key}:${secret}`).toString('base64')
    const resp = await axios.get(`${base}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: { Authorization: `Basic ${creds}` }
    })
    console.log('OAUTH OK', resp.data)
  }catch(e){
    if(e.response) console.error('OAUTH ERR', e.response.status, e.response.data)
    else console.error('OAUTH ERR', e.message)
    process.exit(1)
  }
}

run()
